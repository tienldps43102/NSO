// model Attribute {
//     id    String @id @default(ulid()) @db.VarChar(36)
//     productId String @map("product_id") @db.VarChar(36)
//     name  String @db.VarChar(200)
//     value String @db.VarChar(200)
  
//     product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
//     @@map("attributes")
//   }
  
  
  
//   model Series {
//     id          String  @id @default(ulid()) @db.VarChar(36)
//     name        String  @db.VarChar(200)
//     description String?
  
//     products    Product[]
  
//     @@map("series")
//   }
  
//   model Product {
//     id              String    @id @default(ulid()) @db.VarChar(36)
//     title           String    @db.VarChar(300)
//     isbn10          String?   @unique @db.VarChar(20)
//     description     String?
//     isbn13          String?   @unique @db.VarChar(20)
//     publisherId     String?   @map("publisher_id") @db.VarChar(36)
//     publicationDate DateTime? @map("publication_date") @db.Date
//     pageCount       Int?      @map("page_count")
//     displayPrice    Decimal   @map("display_price") @db.Decimal(12, 2)
//     thumbnailUrl    String?   @map("thumbnail_url")
//     isActive        Boolean   @default(true) @map("is_active")
//     createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
//     updatedAt       DateTime  @default(now()) @map("updated_at") @db.Timestamptz(6)
//     seriesId        String?   @map("series_id") @db.VarChar(36)
//     categoryId      String    @map("category_id") @db.VarChar(36)
  
//     publisher Publisher?       @relation(fields: [publisherId], references: [id], onDelete: SetNull)
//     variants  ProductVariant[]
//     series    Series?        @relation(fields: [seriesId], references: [id], onDelete: SetNull)
//     category  Category         @relation(fields: [categoryId], references: [id], onDelete: Restrict)
//     authors   Author[]         @relation("ProductAuthors")
//     attributes Attribute[]
//     images    ProductImage[]
    
  
//     @@index([isActive], map: "idx_products_active")
//     @@map("products")
//   }
  
//   model ProductImage {
//     id        String @id @default(ulid()) @db.VarChar(36)
//     productId String @map("product_id") @db.VarChar(36)
//     variantId String? @map("variant_id") @db.VarChar(36)
//     url       String
      
//     product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
//     @@index([variantId], map: "idx_product_images_product")
//     @@map("product_images")
//   }
  
//   model ProductVariant {
//     id            String   @id @default(ulid()) @db.VarChar(36)
//     productId     String   @map("product_id") @db.VarChar(36)
//     sku           String   @unique @db.VarChar(80)
//     variantName   String   @map("variant_name") @db.VarChar(200)
//     price         Decimal  @db.Decimal(12, 2)
//     stockQuantity Int      @default(0) @map("stock_quantity")
//     isActive      Boolean  @default(true) @map("is_active")
//     createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
//     updatedAt     DateTime @default(now()) @map("updated_at") @db.Timestamptz(6)
  
//     product   Product               @relation(fields: [productId], references: [id], onDelete: Cascade)
//     cartItems CartItem[]
  
//     @@unique([productId, variantName])
//     @@index([productId], map: "idx_variants_product")
//     @@index([isActive], map: "idx_variants_active")
//     @@map("product_variants")
//     orderItems OrderItem[]
//   }

import { prisma } from "@/lib/db"
import z from "zod"
import { computeSkipTake, paginationInput } from "./shared"
import { orpcWithAuth } from "@/lib/orpc/base"

const createBook = orpcWithAuth.route({
    method: "POST",
    path: "/books",
    
}).input(z.object({
    title: z.string(),
    description: z.string().optional(),
    isbn10: z.string().optional(),
    isbn13: z.string().optional(),
    publisherId: z.string().optional(),
    publicationDate: z.date().optional(),
    pageCount: z.number().optional(),
    displayPrice: z.number(),
    thumbnailUrl: z.string().optional(),
    seriesId: z.string().optional(),
    categoryId: z.string(),
    authors: z.array(z.string()),
    
})).handler(async ({ input }) => {
    const book = await prisma.product.create({ data: {
        title: input.title,
        description: input.description,
        isbn10: input.isbn10,
        isbn13: input.isbn13,
        publisherId: input.publisherId,
        publicationDate: input.publicationDate,
        pageCount: input.pageCount,
        displayPrice: input.displayPrice,
        thumbnailUrl: input.thumbnailUrl,
        seriesId: input.seriesId,
        categoryId: input.categoryId,
        authors: {
            connect: input.authors.map(author => ({
                id: author,
            })),
        },
        isActive:false,
        createdAt: new Date(),
    }})
    return book
})

const updateBook = orpcWithAuth.route({
    method: "PUT",
    path: "/books/:id",
}).input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    isbn10: z.string().optional(),
    isbn13: z.string().optional(),
    publisherId: z.string().optional(),
    publicationDate: z.date().optional(),
    pageCount: z.number().optional(),
    displayPrice: z.number().optional(),
    thumbnailUrl: z.string().optional(),
    seriesId: z.string().optional(),
    categoryId: z.string().optional(),
    removeAuthors: z.array(z.string()).optional(),
    addAuthors: z.array(z.string()).optional(),
   
})).handler(async ({ input }) => {
    const book = await prisma.product.update({ where: { id: input.id }, data: {
        title: input.title,
        description: input.description,
        isbn10: input.isbn10,
        isbn13: input.isbn13,
        publisherId: input.publisherId,
        publicationDate: input.publicationDate,
        pageCount: input.pageCount,
        displayPrice: input.displayPrice,
        thumbnailUrl: input.thumbnailUrl,
        seriesId: input.seriesId,
        categoryId: input.categoryId,
    }})
    if (input.removeAuthors) {
        await prisma.product.update({ where: { id: input.id }, data: {
            authors: {
                disconnect: input.removeAuthors.map(author => ({ id: author })),
            },
        }})
    }
    if (input.addAuthors) {
        await prisma.product.update({ where: { id: input.id }, data: {
            authors: {
                connect: input.addAuthors.map(author => ({ id: author })),
            },
        }})
    }
    return book
})

const deactivateBook = orpcWithAuth.route({
    method: "POST",
    path: "/books/:id/deactivate",
}).input(z.object({
    id: z.string(),
})).handler(async ({ input }) => {
    const book = await prisma.product.update({ where: { id: input.id }, data: {
        isActive: false,
    }})
    return book
})

const activateBook = orpcWithAuth.route({
    method: "POST",
    path: "/books/:id/activate",
}).input(z.object({
    id: z.string(),
})).handler(async ({ input }) => {
    // book must have at least one variant
    const book = await prisma.product.findUnique({ where: { id: input.id }, include: { variants: true } })
    if (!book) throw new Error("Book not found")
    if (book.variants.length === 0) throw new Error("Book must have at least one variant")
    await prisma.product.update({ where: { id: input.id }, data: {
        isActive: true,
    }})
    return { message: "Book activated successfully" }
})

const addAttribute = orpcWithAuth.route({
    method: "POST",
    path: "/books/:id/attributes",
}).input(z.object({
    id: z.string(),
    name: z.string(),
    value: z.string(),
})).handler(async ({ input }) => {
    const book = await prisma.attribute.create({ data: {
        name: input.name,
        value: input.value,
        productId: input.id,
    }})
    return book
})

const updateAttribute = orpcWithAuth.route({    
    method: "PUT",
    path: "/books/:id/attributes/:attributeId",
}).input(z.object({
    id: z.string(),
    attributeId: z.string(),
    name: z.string().optional(),
    value: z.string().optional(),
})).handler(async ({ input }) => {
    const book = await prisma.attribute.update({ where: { id: input.attributeId }, data: {
        name: input.name,
        value: input.value,
    }})
    return book
})

const deleteAttribute = orpcWithAuth.route({
    method: "DELETE",
    path: "/books/:id/attributes/:attributeId",
}).input(z.object({
    id: z.string(),
    attributeId: z.string(),
})).handler(async ({ input }) => {
    const book = await prisma.attribute.delete({ where: { id: input.attributeId } })
    return book
})

const addImage = orpcWithAuth.route({
    method: "POST",
    path: "/books/:id/images",
}).input(z.object({
    id: z.string(),
    image: z.string(),
    variantId: z.string().optional(),
})).handler(async ({ input }) => {
    const book = await prisma.productImage.create({ data: {
        url: input.image,
        variantId: input.variantId,
        productId: input.id,
    }})
    return book
})

const updateImage = orpcWithAuth.route({
    method: "PUT",
    path: "/books/:id/images/:imageId",
}).input(z.object({
    id: z.string(),
    imageId: z.string(),
    image: z.string().optional(),
    variantId: z.string().optional(),
})).handler(async ({ input }) => {
    const book = await prisma.productImage.update({ where: { id: input.imageId }, data: {
        url: input.image,
        variantId: input.variantId,
    }})
    return book
})


const deleteImage = orpcWithAuth.route({
    method: "DELETE",
    path: "/books/:id/images/:imageId",
}).input(z.object({
    id: z.string(),
    imageId: z.string(),
})).handler(async ({ input }) => {
    const book = await prisma.productImage.delete({ where: { id: input.imageId } })
    return book
})
import { randomUUID } from "crypto"
const addVariant = orpcWithAuth.route({
    method: "POST",
    path: "/books/:id/variants",
}).input(z.object({
    id: z.string(),
    variantName: z.string(),
    price: z.number(),
    stockQuantity: z.number(),
})).handler(async ({ input }) => {
    const book = await prisma.productVariant.create({ data: {
        price: input.price,
        sku: randomUUID(),
        variantName: input.variantName,
        productId: input.id,
        isActive: true,
        stockQuantity: input.stockQuantity||0,
        createdAt: new Date(),
    }})
    return book
})

const updateVariant = orpcWithAuth.route({
    method: "PUT",
    path: "/books/:id/variants/:variantId",
}).input(z.object({
    id: z.string(),
    variantId: z.string(),
    variantName: z.string().optional(),
    price: z.number().optional(),
    stockQuantity: z.number().optional(),
})).handler(async ({ input }) => {
    const book = await prisma.productVariant.update({ where: { id: input.variantId }, data: {
        variantName: input.variantName,
        price: input.price,
        stockQuantity: input.stockQuantity,
    }})
    return book
})

const addStock = orpcWithAuth.route({
    method: "POST",
    path: "/books/:id/variants/:variantId/stock",
}).input(z.object({
    id: z.string(),
    variantId: z.string(),
    stockQuantity: z.number(),
})).handler(async ({ input }) => {
    const book = await prisma.productVariant.update({ where: { id: input.variantId }, data: {
        stockQuantity: input.stockQuantity,
    }})
    return book
})


const toggleActiveVariant = orpcWithAuth.route({
    method: "POST",
    path: "/books/:id/variants/:variantId/toggle-active",
}).input(z.object({
    id: z.string(),
    variantId: z.string(),
})).handler(async ({ input }) => {
    const existingVariant = await prisma.productVariant.findUnique({ where: { id: input.variantId } })
    if (!existingVariant) throw new Error("Variant not found")
    const newVariant = await prisma.productVariant.update({ where: { id: input.variantId }, data: {
        isActive: !existingVariant.isActive,
    }})
    return newVariant
})

export const bookAdminRoutes = {
    createBook,
    updateBook,
    deactivateBook,
    activateBook,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    addImage,
    updateImage,
    deleteImage,
    addVariant,
    updateVariant,
    addStock,
    toggleActiveVariant,
}