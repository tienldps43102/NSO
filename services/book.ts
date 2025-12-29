import { prisma } from "@/lib/db"
import { os } from "@orpc/server"
import z from "zod"


const getLatestBooks = os.input(
    z.object({
        limit: z.number().min(1).max(20).default(10),
    })
).handler(async ({ input }) => {
    const books = await prisma.product.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: input.limit,
        include: {
            category: true,
            publisher: true,
        },
    })
    return books
})


const getBookById = os.input(
    z.object({
        id: z.string(),
    })
).handler(async ({ input }) => {
    const book = await prisma.product.findUnique({
        where: {
            id: input.id,
        },
        include: {
            category: true,
            publisher: true,
            authors: true,
            attributes: true,
            images: true,
            variants: true,
            series: true,
        },
    })
    if (!book) {
        throw new Error("Book not found")
    }
    return book
})

export const bookRoutes = os.router({
    getLatestBooks,
    getBookById,
})