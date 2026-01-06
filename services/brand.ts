import { prisma } from "@/lib/db";
import { os } from "@orpc/server";
import z from "zod";
import { computeSkipTake, paginationInput } from "./shared";

const getAllBrands = os
  .route({
    method: "GET",
    path: "/brands",
  })
  .input(
    paginationInput.extend({
      q: z.string().trim().min(1).optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { skip, take } = computeSkipTake(input.page, input.limit);

    const whereClause = input.q
      ? {
          name: {
            contains: input.q,
            mode: "insensitive" as const,
          },
        }
      : {};
    const [brands, totalCount] = await Promise.all([
      prisma.brand.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.brand.count({ where: whereClause }),
    ]);

    return {
      brands,
      totalCount,
      totalPages: Math.ceil(totalCount / input.limit),
      currentPage: input.page,
    };
  });
const createBrand = os
  .route({
    method: "POST",
    path: "/brands",
  })
  .input(z.object({ name: z.string(), description: z.string().optional() }))
  .handler(async ({ input }) => {
    const brand = await prisma.brand.create({ data: input });
    return brand;
  });
const updateBrand = os
  .route({
    method: "PUT",
    path: "/brands/:id",
  })
  .input(
    z.object({ id: z.string(), name: z.string().optional(), description: z.string().optional() }),
  )
  .handler(async ({ input }) => {
    const brand = await prisma.brand.update({ where: { id: input.id }, data: input });
    return brand;
  });
const deleteBrand = os
  .route({
    method: "DELETE",
    path: "/brands/:id",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    // count the number of products in the brand
    const products = await prisma.product.count({ where: { brandId: input.id } });
    if (products > 0) {
      throw new Error(`Nhà xuất bản có ${products} sách, không thể xóa`);
    }
    const brand = await prisma.brand.delete({ where: { id: input.id } });
    return brand;
  });

const getBrandById = os
  .route({
    method: "GET",
    path: "/brands/:id",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const brand = await prisma.brand.findUnique({ where: { id: input.id } });
    return brand;
  });
export const brandRoutes = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
