import { prisma } from "@/lib/db"
import { os } from "@orpc/server"
import z from "zod"
import { computeSkipTake, paginationInput } from "./shared"


const getAllSeries = os
    .route({
        method: "GET",  
        path: "/series",
    })
    .input(
        paginationInput.extend({
            q: z.string().trim().min(1).optional(),
        })
    )
    .handler(async ({ input }) => {
        const { skip, take } = computeSkipTake(input.page, input.limit)
        
        const whereClause = input.q
            ? {
                  name: {
                      contains: input.q,
                      mode: "insensitive" as const,
                  },
              }
            : {}
        const [series, totalCount] = await Promise.all([
            prisma.series.findMany({
                where: whereClause,
                skip,
                take,
                orderBy: { name: "asc" },
            }),
            prisma.series.count({ where: whereClause }),
        ])

        return {
            series,
            totalCount,
            totalPages: Math.ceil(totalCount / input.limit),
            currentPage: input.page,
        }
    })

export  const seriesRoutes = {
    getAllSeries,
}