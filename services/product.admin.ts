import { prisma } from "@/lib/db";
import z from "zod";
import { orpcWithAuth } from "@/lib/orpc/base";

const createProduct = orpcWithAuth
  .route({
    method: "POST",
    path: "/products",
  })
  .input(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      displayPrice: z.number(),
      thumbnailUrl: z.string().optional(),
      categoryId: z.string(),
      brandId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.product.create({
      data: {
        title: input.title,
        description: input.description,
        displayPrice: input.displayPrice,
        thumbnailUrl: input.thumbnailUrl,
        categoryId: input.categoryId,
        isActive: false,
        createdAt: nowVN().toDate(),
        brandId: input.brandId,
      },
    });
    return product;
  });

const updateProduct = orpcWithAuth
  .route({
    method: "PUT",
    path: "/products/:id",
  })
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      displayPrice: z.number().optional(),
      thumbnailUrl: z.string().optional(),
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.product.update({
      where: { id: input.id },
      data: {
        title: input.title,
        description: input.description,
        displayPrice: input.displayPrice,
        thumbnailUrl: input.thumbnailUrl,
        categoryId: input.categoryId,
        brandId: input.brandId,
      },
    });
    return product;
  });

const deactivateProduct = orpcWithAuth
  .route({
    method: "POST",
    path: "/products/:id/deactivate",
  })
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.product.update({
      where: { id: input.id },
      data: {
        isActive: false,
      },
    });
    return product;
  });

const activateProduct = orpcWithAuth
  .route({
    method: "POST",
    path: "/products/:id/activate",
  })
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    // product must have at least one variant
    const product = await prisma.product.findUnique({
      where: { id: input.id },
      include: { variants: true },
    });
    if (!product) throw new Error("Product not found");
    if (product.variants.length === 0) {
      return { success: false, message: "Sách phải có ít nhất một phiên bản" };
    }
    await prisma.product.update({
      where: { id: input.id },
      data: {
        isActive: true,
      },
    });
    return { success: true, message: "Product activated successfully" };
  });

const addAttribute = orpcWithAuth
  .route({
    method: "POST",
    path: "/products/:id/attributes",
  })
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      value: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.attribute.create({
      data: {
        name: input.name,
        value: input.value,
        productId: input.id,
      },
    });
    return product;
  });

const updateAttribute = orpcWithAuth
  .route({
    method: "PUT",
    path: "/products/:id/attributes/:attributeId",
  })
  .input(
    z.object({
      id: z.string(),
      attributeId: z.string(),
      name: z.string().optional(),
      value: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.attribute.update({
      where: { id: input.attributeId },
      data: {
        name: input.name,
        value: input.value,
      },
    });
    return product;
  });

const deleteAttribute = orpcWithAuth
  .route({
    method: "DELETE",
    path: "/products/:id/attributes/:attributeId",
  })
  .input(
    z.object({
      id: z.string(),
      attributeId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.attribute.delete({ where: { id: input.attributeId } });
    return product;
  });

const bulkUpdateAttributes = orpcWithAuth
  .route({
    method: "PUT",
    path: "/products/:id/attributes/bulk",
  })
  .input(
    z.object({
      newAttributes: z.array(z.object({ name: z.string(), value: z.string() })),
      removedAttributes: z.array(z.string()),
      updatedAttributes: z.array(
        z.object({ id: z.string(), name: z.string().optional(), value: z.string().optional() }),
      ),
      id: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    // add new attributes
    const newAttributes = await prisma.attribute.createMany({
      data: input.newAttributes.map((attribute) => ({
        name: attribute.name,
        value: attribute.value,
        productId: input.id,
      })),
    });
    // update attributes
    for (const attribute of input.updatedAttributes) {
      await prisma.attribute.update({
        where: { id: attribute.id },
        data: { name: attribute.name, value: attribute.value },
      });
    }
    // delete attributes
    for (const attribute of input.removedAttributes) {
      await prisma.attribute.delete({ where: { id: attribute } });
    }
    return { success: true, message: "Attributes updated successfully" };
  });
const addImage = orpcWithAuth
  .route({
    method: "POST",
    path: "/products/:id/images",
  })
  .input(
    z.object({
      id: z.string(),
      image: z.string(),
      variantId: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.productImage.create({
      data: {
        url: input.image,
        variantId: input.variantId,
        productId: input.id,
      },
    });
    return product;
  });

const updateImage = orpcWithAuth
  .route({
    method: "PUT",
    path: "/products/:id/images/:imageId",
  })
  .input(
    z.object({
      id: z.string(),
      imageId: z.string(),
      image: z.string().optional(),
      variantId: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.productImage.update({
      where: { id: input.imageId },
      data: {
        url: input.image,
        variantId: input.variantId,
      },
    });
    return product;
  });

const deleteImage = orpcWithAuth
  .route({
    method: "DELETE",
    path: "/products/:id/images/:imageId",
  })
  .input(
    z.object({
      id: z.string(),
      imageId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.productImage.delete({ where: { id: input.imageId } });
    return product;
  });

const bulkUpdateImages = orpcWithAuth
  .route({
    method: "PUT",
    path: "/products/:id/images/bulk",
  })
  .input(
    z.object({
      id: z.string(),
      newImages: z.array(z.object({ image: z.string(), variantId: z.string().optional() })),
      removedImages: z.array(z.string()),
      updatedImages: z.array(
        z.object({
          id: z.string(),
          image: z.string().optional(),
          variantId: z.string().optional(),
        }),
      ),
    }),
  )
  .handler(async ({ input }) => {
    // add new images
    const newImages = await prisma.productImage.createMany({
      data: input.newImages.map((image) => ({
        url: image.image,
        variantId: image.variantId,
        productId: input.id,
      })),
    });
    // update images
    for (const image of input.updatedImages) {
      await prisma.productImage.update({
        where: { id: image.id },
        data: { url: image.image, variantId: image.variantId },
      });
    }
    // delete images
    for (const image of input.removedImages) {
      await prisma.productImage.delete({ where: { id: image } });
    }
    return { success: true, message: "Images updated successfully" };
  });
import { randomUUID } from "crypto";
import { nowVN } from "@/lib/day";
const addVariant = orpcWithAuth
  .route({
    method: "POST",
    path: "/products/:id/variants",
  })
  .input(
    z.object({
      id: z.string(),
      variantName: z.string(),
      price: z.number(),
      stockQuantity: z.number(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.productVariant.create({
      data: {
        price: input.price,
        sku: randomUUID(),
        variantName: input.variantName,
        productId: input.id,
        isActive: true,
        stockQuantity: input.stockQuantity || 0,
        createdAt: nowVN().toDate(),
      },
    });
    return product;
  });

const updateVariant = orpcWithAuth
  .route({
    method: "PUT",
    path: "/products/:id/variants/:variantId",
  })
  .input(
    z.object({
      id: z.string(),
      variantId: z.string(),
      variantName: z.string().optional(),
      price: z.number().optional(),
      stockQuantity: z.number().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.productVariant.update({
      where: { id: input.variantId },
      data: {
        variantName: input.variantName,
        price: input.price,
        stockQuantity: input.stockQuantity,
      },
    });
    return product;
  });

const addStock = orpcWithAuth
  .route({
    method: "POST",
    path: "/products/:id/variants/:variantId/stock",
  })
  .input(
    z.object({
      id: z.string(),
      variantId: z.string(),
      stockQuantity: z.number(),
    }),
  )
  .handler(async ({ input }) => {
    const product = await prisma.productVariant.update({
      where: { id: input.variantId },
      data: {
        stockQuantity: input.stockQuantity,
      },
    });
    return product;
  });

const toggleActiveVariant = orpcWithAuth
  .route({
    method: "POST",
    path: "/products/:id/variants/:variantId/toggle-active",
  })
  .input(
    z.object({
      id: z.string(),
      variantId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
    });
    if (!existingVariant) throw new Error("Variant not found");
    const newVariant = await prisma.productVariant.update({
      where: { id: input.variantId },
      data: {
        isActive: !existingVariant.isActive,
      },
    });
    return newVariant;
  });

const toggleFeaturedProduct = orpcWithAuth
  .route({
    method: "POST",
    path: "/products/:id/toggle-featured",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const product = await prisma.product.findUnique({ where: { id: input.id } });
    if (!product) throw new Error("Product not found");
    const newProduct = await prisma.product.update({
      where: { id: input.id },
      data: { isFeature: !product.isFeature },
    });
    return newProduct;
  });

export const productAdminRoutes = {
  createProduct,
  updateProduct,
  deactivateProduct,
  activateProduct,
  addAttribute,
  updateAttribute,
  deleteAttribute,
  addImage,
  updateImage,
  deleteImage,
  addVariant,
  bulkUpdateAttributes,
  updateVariant,
  addStock,
  toggleActiveVariant,
  bulkUpdateImages,
  toggleFeaturedProduct,
};
