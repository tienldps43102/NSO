import { prisma } from "@/lib/db"
import { os } from "@orpc/server"
import z from "zod"
import { computeSkipTake, paginationInput } from "./shared"

const sortInput = z
    .enum(["newest", "price_asc", "price_desc", "title_asc", "title_desc"])
    .default("newest")

/**
 * 1) Home: latest products (your version, improved)
 */
const getLatestBooks = os
    .input(
        z.object({
            limit: z.coerce.number().min(1).max(20).default(10),
        })
    )
    .route({
        method: "GET",
        path: "/books/latest",
    })
    .handler(async ({ input }) => {
        const books = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: input.limit,
            include: {
                category: true,
            },
        })
        return books
    })

/**
 * 2) Listing / browse catalog
 * - filter: category, publisher, author, price range
 * - search: title / isbn10 / isbn13
 * - sort: newest / price / title
 * - paging
 */
const listBooks = os
    .route({
        method: "GET",
        path: "/books",
    })
    .input(
        paginationInput.extend({
            q: z.string().trim().min(1).optional(),
            categoryId: z.string().optional(),
            publisherId: z.string().optional(),
            authorId: z.string().optional(),
            seriesId: z.string().optional(),
            minPrice: z.coerce.number().nonnegative().optional(),
            maxPrice: z.coerce.number().nonnegative().optional(),
            sort: sortInput,
            inStockOnly: z.coerce.boolean().default(false),
        })
    )
    .handler(async ({ input }) => {
        const { skip, take } = computeSkipTake(input.page, input.limit)

        // Sort by variant price: need orderBy via relation aggregate.
        // Prisma supports orderBy on relations (min/max) for scalar fields in many cases.
        // We'll use variants: { _min: { price: ... } } pattern where available.
        const orderBy =
            input.sort === "newest"
                ? ({ createdAt: "desc" } as const)
                : input.sort === "title_asc"
                    ? ({ title: "asc" } as const)
                    : input.sort === "title_desc"
                        ? ({ title: "desc" } as const)
                        : input.sort === "price_asc"
                            ? ({ variants: { _min: { price: "asc" } } } as const)
                            : ({ variants: { _min: { price: "desc" } } } as const)

        const where = {
            isActive: true,
            ...(input.categoryId ? { categoryId: input.categoryId } : {}),
            ...(input.publisherId ? { publisherId: input.publisherId } : {}),
            ...(input.seriesId ? { seriesId: input.seriesId } : {}),
            ...(input.authorId
                ? { authors: { some: { id: input.authorId } } }
                : {}),
            ...(input.q
                ? {
                    OR: [
                        { title: { contains: input.q, mode: "insensitive" as const } },
                        { isbn10: { contains: input.q, mode: "insensitive" as const } },
                        { isbn13: { contains: input.q, mode: "insensitive" as const } },
                    ],
                }
                : {}),
            variants: {
                some: {
                    isActive: true,
                    ...(input.inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
                    ...(input.minPrice != null ? { price: { gte: input.minPrice } } : {}),
                    ...(input.maxPrice != null ? { price: { lte: input.maxPrice } } : {}),
                },
            },
        }

        const [items, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                orderBy: orderBy as any,
                skip,
                take,
                include: {
                    category: true,
                    publisher: true,
                    images: true,
                    // show price range quickly
                    variants: {
                        where: { isActive: true },
                        select: { price: true, stockQuantity: true },
                    },
                },
            }),
            prisma.product.count({ where }),
        ])

        return {
            items,
            pagination: {
                page: input.page,
                limit: input.limit,
                total,
                totalPages: Math.ceil(total / input.limit),
            },
        }
    })

/**
 * 3) Product detail (your version, refined: active variants only)
 */
const getBookById = os
    .route({
        method: "GET",
        path: "/books/:id",
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
        const book = await prisma.product.findFirst({
            where: { id: input.id, isActive: true },
            include: {
                category: true,
                publisher: true,
                authors: true,
                attributes: true,
                images: true,
                series: true,
                variants: {
                    where: { isActive: true },
                    orderBy: { price: "asc" },
                },
            },
        })

        if (!book) throw new Error("Book not found")
        return book
    })

/**
* 5) Related books (same category, exclude itself)
*/
const getRelatedBooks = os
    .route({
        method: "GET",
        path: "/books/related",
    })
    .input(
        z.object({
            bookId: z.string(),
            limit: z.coerce.number().min(1).max(20).default(10),
        })
    )
    .handler(async ({ input }) => {
        const base = await prisma.product.findFirst({
            where: { id: input.bookId, isActive: true },
            select: { id: true, categoryId: true, publisherId: true },
        })
        if (!base) throw new Error("Book not found")

        const items = await prisma.product.findMany({
            where: {
                isActive: true,
                id: { not: base.id },
                OR: [
                    { categoryId: base.categoryId },
                    ...(base.publisherId ? [{ publisherId: base.publisherId }] : []),
                ],
            },
            orderBy: { createdAt: "desc" },
            take: input.limit,
            include: { category: true},
        })
        return items
    })

const getBookBySeriesId = os
    .route({
        method: "GET",
        path: "/books/series/:seriesId",
    })
    .input(z.object({ seriesId: z.string(), excludeBookId: z.string().optional(), limit: z.coerce.number().min(1).max(50).default(20) }))
    .handler(async ({ input }) => {
        const books = await prisma.product.findMany({
            where: {
                seriesId: input.seriesId, isActive: true
                , ...(input.excludeBookId ? { id: { not: input.excludeBookId } } : {})
            },
            include: {
                category: true,
            },
            take: input.limit,
            orderBy: { createdAt: "desc" },
        })
        return books
    })

const getVariantById = os
    .route({
        method: "GET",
        path: "/books/variants/:variantId",
    })
    .input(z.object({ variantId: z.string() }))
    .handler(async ({ input }) => {
        const variant = await prisma.productVariant.findFirst({
            where: { id: input.variantId, isActive: true },
            include: {
                product: true,
            },
        })
        if (!variant) throw new Error("Variant not found")
        return variant
    })


    //cud book

export const bookRoutes = os.router({
    getLatestBooks,
    getBookById,
    listBooks,
    getRelatedBooks,
    getBookBySeriesId,
    getVariantById,

})