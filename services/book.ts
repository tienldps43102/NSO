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
const getLatestBooks = os
  .input(
    z.object({
      limit: z.coerce.number().min(1).max(20).default(10),
    }),
  )
  .route({
    method: "GET",
    path: "/books/latest",
  })
  .handler(async ({ input }) => {
    const books = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: input.limit,
      include: {
        category: true,
      },
    });
    return books;
  });

/**
 * 2) Listing / browse catalog
 * - filter: category, publisher, author, price range
 * - search: title / isbn10 / isbn13
 * - sort: newest / price / title
 * - paging
 */
const listBooks = os
  .route({
    method: "GET",
    path: "/books",
  })
  .input(
    paginationInput.extend({
      q: z.string().trim().min(1).optional(),
      categoryIds: z.array(z.string()).optional(),
      publisherIds: z.array(z.string()).optional(),
      authorIds: z.array(z.string()).optional(),
      seriesIds: z.array(z.string()).optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
      sort: sortInput,
      inStockOnly: z.coerce.boolean().default(false),
      withInActive: z.boolean().optional().default(false),
    }),
  )
  .handler(async ({ input }) => {
    const { skip, take } = computeSkipTake(input.page, input.limit);
    console.log(input);
    // Sort by variant price: need orderBy via relation aggregate.
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
      ...(input.publisherIds && input.publisherIds.length > 0
        ? { publisherId: { in: input.publisherIds } }
        : {}),
      ...(input.seriesIds && input.seriesIds.length > 0
        ? { seriesId: { in: input.seriesIds } }
        : {}),
      // Many-to-many relationship với authors
      ...(input.authorIds && input.authorIds.length > 0
        ? {
            authors: {
              some: {
                id: { in: input.authorIds },
              },
            },
          }
        : {}),
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" as const } },
              { isbn10: { contains: input.q, mode: "insensitive" as const } },
              { isbn13: { contains: input.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      variants: {
        some: {
          ...(input.withInActive ? {} : { isActive: true }),
          ...(input.inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
          ...(input.minPrice != null ? { price: { gte: input.minPrice } } : {}),
          ...(input.maxPrice != null ? { price: { lte: input.maxPrice } } : {}),
        },
      },
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: orderBy as Prisma.ProductOrderByWithRelationInput,
        skip,
        take,
        include: {
          category: true,
          publisher: true,
          images: true,
          // show price range quickly
          variants: {
            where: { isActive: true },
            select: { price: true, stockQuantity: true },
          },
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
const getBookById = os
  .route({
    method: "GET",
    path: "/books/:id",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const book = await prisma.product.findFirst({
      where: { id: input.id, isActive: true },
      include: {
        category: true,
        publisher: true,
        authors: true,
        attributes: true,
        images: true,
        series: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
    });

    if (!book) throw new Error("Book not found");
    return book;
  });

/**
 * 5) Related books (same category, exclude itself)
 */
const getRelatedBooks = os
  .route({
    method: "GET",
    path: "/books/related",
  })
  .input(
    z.object({
      bookId: z.string(),
      limit: z.coerce.number().min(1).max(20).default(10),
    }),
  )
  .handler(async ({ input }) => {
    const base = await prisma.product.findFirst({
      where: { id: input.bookId, isActive: true },
      select: { id: true, categoryId: true, publisherId: true },
    });
    if (!base) throw new Error("Book not found");

    const items = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: base.id },
        OR: [
          { categoryId: base.categoryId },
          ...(base.publisherId ? [{ publisherId: base.publisherId }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: input.limit,
      include: { category: true },
    });
    return items;
  });

const getBookBySeriesId = os
  .route({
    method: "GET",
    path: "/books/series/:seriesId",
  })
  .input(
    z.object({
      seriesId: z.string(),
      excludeBookId: z.string().optional(),
      limit: z.coerce.number().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ input }) => {
    const books = await prisma.product.findMany({
      where: {
        seriesId: input.seriesId,
        isActive: true,
        ...(input.excludeBookId ? { id: { not: input.excludeBookId } } : {}),
      },
      include: {
        category: true,
      },
      take: input.limit,
      orderBy: { createdAt: "desc" },
    });
    return books;
  });

const getVariantById = os
  .route({
    method: "GET",
    path: "/books/variants/:variantId",
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

//cud book

export const bookRoutes = os.router({
  getLatestBooks,
  getBookById,
  listBooks,
  getRelatedBooks,
  getBookBySeriesId,
  getVariantById,
});
