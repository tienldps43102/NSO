import { prisma } from "@/lib/db";
import { os } from "@orpc/server";
import z from "zod";
import { computeSkipTake, paginationInput } from "./shared";

const getAllSeries = os
  .route({
    method: "GET",
    path: "/series",
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
    const [series, totalCount] = await Promise.all([
      prisma.series.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.series.count({ where: whereClause }),
    ]);

    return {
      series,
      totalCount,
      totalPages: Math.ceil(totalCount / input.limit),
      currentPage: input.page,
    };
  });
const getSeriesById = os
  .route({
    method: "GET",
    path: "/series/:id",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const series = await prisma.series.findFirst({
      where: { id: input.id },
    });
    return series;
  });

const createSeries = os
  .route({
    method: "POST",
    path: "/series",
  })
  .input(z.object({ name: z.string(), description: z.string().optional() }))
  .handler(async ({ input }) => {
    const series = await prisma.series.create({ data: input });
    return series;
  });
const updateSeries = os
  .route({
    method: "PUT",
    path: "/series/:id",
  })
  .input(
    z.object({ id: z.string(), name: z.string().optional(), description: z.string().optional() }),
  )
  .handler(async ({ input }) => {
    const series = await prisma.series.update({ where: { id: input.id }, data: input });
    return series;
  });
const deleteSeries = os
  .route({
    method: "DELETE",
    path: "/series/:id",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    // count the number of books in the series
    const books = await prisma.product.count({ where: { seriesId: input.id } });
    if (books > 0) {
      throw new Error(`Bộ sách có ${books} sách, không thể xóa`);
    }
    const series = await prisma.series.delete({ where: { id: input.id } });
    return series;
  });
export const seriesRoutes = {
  getAllSeries,
  getSeriesById,
  createSeries,
  updateSeries,
  deleteSeries,
};
