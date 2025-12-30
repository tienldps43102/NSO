import { prisma } from "@/lib/db"
import { os } from "@orpc/server"
import z from "zod"
import { computeSkipTake, paginationInput } from "./shared"


const getAllPublishers = os
    .route({
        method: "GET",
        path: "/publishers",
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
        const [publishers, totalCount] = await Promise.all([
            prisma.publisher.findMany({
                where: whereClause,
                skip,
                take,
                orderBy: { name: "asc" },
            }),
            prisma.publisher.count({ where: whereClause }),
        ])

        return {
            publishers,
            totalCount,
            totalPages: Math.ceil(totalCount / input.limit),
            currentPage: input.page,
        }
    })
    
export  const publisherRoutes = {
    getAllPublishers,
}