import { prisma } from "@/lib/db";
import { os } from "@orpc/server";
import z from "zod";
import { computeSkipTake, paginationInput } from "./shared";
import { Prisma } from "@/lib/generated/prisma/client";

const sortInput = z
  .enum(["newest", "price_asc", "price_desc", "title_asc", "title_desc"])
  .default("newest");

/**
 * 1) Home: latest products (your version, improved)
 */
const getLatestProducts = os
  .input(
    z.object({
      limit: z.coerce.number().min(1).max(20).default(10),
    }),
  )
  .route({
    method: "GET",
    path: "/products/latest",
  })
  .handler(async ({ input }) => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: input.limit,
      include: {
        category: true,
      },
    });
    return products;
  });

/**
 * 2) Listing / browse catalog
 * - filter: category, publisher, author, price range
 * - search: title / isbn10 / isbn13
 * - sort: newest / price / title
 * - paging
 */
const listProducts = os
  .route({
    method: "GET",
    path: "/products",
  })
  .input(
    paginationInput.extend({
      q: z.string().trim().min(1).optional(),
      categoryIds: z.array(z.string()).optional(),
      brandIds: z.array(z.string()).optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
      sort: sortInput,
      inStockOnly: z.coerce.boolean().default(false),
      withInActive: z.boolean().optional().default(false),
    }),
  )
  .handler(async ({ input }) => {
    const { skip, take } = computeSkipTake(input.page, input.limit);
    const orderBy =
      input.sort === "newest"
        ? ({ createdAt: "desc" } as const)
        : input.sort === "title_asc"
          ? ({ title: "asc" } as const)
          : input.sort === "title_desc"
            ? ({ title: "desc" } as const)
            : input.sort === "price_asc"
              ? ({ displayPrice: "asc" } as const)
              : ({ displayPrice: "desc" } as const);

    const where = {
      ...(input.withInActive ? {} : { isActive: true }),
      // Chuyển sang dùng mảng với `in` operator
      ...(input.categoryIds && input.categoryIds.length > 0
        ? { categoryId: { in: input.categoryIds } }
        : {}),
      ...(input.brandIds && input.brandIds.length > 0
        ? { brandId: { in: input.brandIds } }
        : {}),
     
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      // variants: {
      //   some: {
      //     ...(input.withInActive ? {} : { isActive: true }),
      //     ...(input.inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
      //     ...(input.minPrice != null ? { price: { gte: input.minPrice } } : {}),
      //     ...(input.maxPrice != null ? { price: { lte: input.maxPrice } } : {}),
      //   },
      // },
    };
    console.log(where, orderBy);
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: orderBy as Prisma.ProductOrderByWithRelationInput,
        skip,
        take,
        include: {
          category: true,
          images: true,
          brand: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  });
/**
 * 3) Product detail (your version, refined: active variants only)
 */
const getProductById = os
  .route({
    method: "GET",
    path: "/products/:id",
  })
  .input(z.object({ id: z.string(), withInActive: z.boolean().optional().default(false) }))
  .handler(async ({ input }) => {
    const product = await prisma.product.findFirst({
      where: { id: input.id, ...(input.withInActive ? {} : { isActive: true }) },
      include: {
        category: true,
        brand: true,
        attributes: true,
        images: true,
        variants: {
          where: { ...(input.withInActive ? {} : { isActive: true }) },
          orderBy: { price: "asc" },
        },
      },
    });

    if (!product) throw new Error("Product not found");
    return product;
  });

/**
 * 5) Related products (same category, exclude itself)
 */
const getRelatedProducts = os
  .route({
    method: "GET",
    path: "/products/related",
  })
  .input(
    z.object({
      productId: z.string(),
      limit: z.coerce.number().min(1).max(20).default(10),
    }),
  )
  .handler(async ({ input }) => {
    const base = await prisma.product.findFirst({
      where: { id: input.productId, isActive: true },
      select: { id: true, categoryId: true, brandId: true },
    });
    if (!base) throw new Error("Product not found");

    const items = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: base.id },
        OR: [
          { categoryId: base.categoryId },
          ...(base.brandId ? [{ brandId: base.brandId }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: input.limit,
      include: { category: true },
    });
    return items;
  });


const getVariantById = os
  .route({
    method: "GET",
    path: "/products/variants/:variantId",
  })
  .input(z.object({ variantId: z.string() }))
  .handler(async ({ input }) => {
    const variant = await prisma.productVariant.findFirst({
      where: { id: input.variantId, isActive: true },
      include: {
        product: true,
      },
    });
    if (!variant) throw new Error("Variant not found");
    return variant;
  });

const getVariantOptionsByProductId = os
  .route({
    method: "GET",
    path: "/products/:id/variants/options",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const variants = await prisma.productVariant.findMany({
      where: { productId: input.id },
    });
    return variants.map((variant) => ({
      id: variant.id,
      name: variant.variantName,
    }));
  });

const getVariantsByProductId = os
  .route({
    method: "GET",
    path: "/products/:id/variants",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const variants = await prisma.productVariant.findMany({
      where: { productId: input.id },
    });
    return variants;
  });

//cud product
const getProductByBrandId = os
  .route({
    method: "GET",
    path: "/products/brand/:brandId",
  })
  .input(z.object({ brandId: z.string() }))
  .handler(async ({ input }) => {
    const products = await prisma.product.findMany({
      where: { brandId: input.brandId, isActive: true },
      include: { category: true, brand: true },
    });
    return products;
  });

export const productRoutes = os.router({
  getLatestProducts,
  getProductById,
  listProducts,
  getRelatedProducts,
  getVariantById,
  getVariantOptionsByProductId,
  getVariantsByProductId,
  getProductByBrandId,
});
