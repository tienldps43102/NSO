import { prisma } from "@/lib/db"
import { os } from "@orpc/server"
import z from "zod"
import { computeSkipTake, paginationInput } from "./shared"


export const getAllAuthors = os
    .route({
        method: "GET",
        path: "/authors",
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
        const [authors, totalCount] = await Promise.all([
            prisma.author.findMany({
                where: whereClause,
                skip,
                take,
                orderBy: { name: "asc" },
            }),
            prisma.author.count({ where: whereClause }),
        ])

        return {
            authors,
            totalCount,
            totalPages: Math.ceil(totalCount / input.limit),
            currentPage: input.page,
        }
    })

export const authorRoutes = {
    getAllAuthors,
}