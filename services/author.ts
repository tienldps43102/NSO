import { prisma } from "@/lib/db"
import { os  } from "@orpc/server"
import z from "zod"
import { computeSkipTake, paginationInput } from "./shared"

const getAllAuthors = os
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

const getAuthorById = os
    .route({
        method: "GET",
        path: "/authors/:id",
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
        const author = await prisma.author.findUnique({ where: { id: input.id } })
        return author
    });

const createAuthor = os
    .route({
        method: "POST",
        path: "/authors",
    })
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .handler(async ({ input }) => {
        const author = await prisma.author.create({ data: input })
        return author
    });
const updateAuthor = os
    .route({
        method: "PUT",
        path: "/authors/:id",
    })
    .input(z.object({ id: z.string(), name: z.string().optional(), description: z.string().optional() }))
    .handler(async ({ input }) => {
        const author = await prisma.author.update({ where: { id: input.id }, data: input })
        return author
    });
const deleteAuthor = os
    .route({
        method: "DELETE",
        path: "/authors/:id",
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
        const author = await prisma.author.delete({ where: { id: input.id } })
        return author
    });

export const authorRoutes = {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
}