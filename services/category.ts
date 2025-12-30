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

const getCategoryById = os
    .route({
        method: "GET",
        path: "/categories/:id",
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
        const category = await prisma.category.findUnique({ where: { id: input.id } })
        return category
    });
    const createCategory = os
    .route({
        method: "POST",
        path: "/categories",
    })
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .handler(async ({ input }) => {
        const category = await prisma.category.create({ data: input })
        return category
    });
    const updateCategory = os
    .route({
        method: "PUT",
        path: "/categories/:id",
    })
    .input(z.object({ id: z.string(), name: z.string().optional(), description: z.string().optional() }))
    .handler(async ({ input }) => {
        const category = await prisma.category.update({ where: { id: input.id }, data: input })
        return category
    });
    const deleteCategory = os
    .route({
        method: "DELETE",
        path: "/categories/:id",
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
        const category = await prisma.category.delete({ where: { id: input.id } })
        return category
    });

export  const categoryRoutes = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
}