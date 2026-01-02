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
const createPublisher = os
    .route({
        method: "POST",
        path: "/publishers",
    })
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .handler(async ({ input }) => {
        const publisher = await prisma.publisher.create({ data: input })
        return publisher
    });
const updatePublisher = os
    .route({
        method: "PUT",
        path: "/publishers/:id",
    })
    .input(z.object({ id: z.string(), name: z.string().optional(), description: z.string().optional() }))
    .handler(async ({ input }) => {
        const publisher = await prisma.publisher.update({ where: { id: input.id }, data: input })
        return publisher
    });
const deletePublisher = os
    .route({
        method: "DELETE",
        path: "/publishers/:id",
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
        // count the number of books in the publisher
        const books = await prisma.product.count({ where: { publisherId: input.id } })
        if (books > 0) {
            throw new Error(`Nhà xuất bản có ${books} sách, không thể xóa`)
        }
        const publisher = await prisma.publisher.delete({ where: { id: input.id } })
        return publisher
    });

const getPublisherById = os
    .route({
        method: "GET",
        path: "/publishers/:id",
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
        const publisher = await prisma.publisher.findUnique({ where: { id: input.id } })
        return publisher
    });
export  const publisherRoutes = {
    getAllPublishers,
    getPublisherById,
    createPublisher,
    updatePublisher,
    deletePublisher,
}