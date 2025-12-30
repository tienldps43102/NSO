import { prisma } from "@/lib/db"
import { os } from "@orpc/server"
import z from "zod"
import { computeSkipTake, paginationInput } from "./shared"


const getAllCategories = os
    .route({
        method: "GET",
        path: "/categories",
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
        const [categories, totalCount] = await Promise.all([
            prisma.category.findMany({
                where: whereClause,
                skip,
                take,
                orderBy: { name: "asc" },
            }),
            prisma.category.count({ where: whereClause }),
        ])

        return {
            categories,
            totalCount,
            totalPages: Math.ceil(totalCount / input.limit),
            currentPage: input.page,
        }
    })

export  const categoryRoutes = {
    getAllCategories,
}