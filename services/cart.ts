import { prisma } from "@/lib/db";
import { orpcWithAuth } from "@/lib/orpc/base";
import z from "zod";


const addToCart = orpcWithAuth
    .route({
        method: "POST",
        path: "/cart/items",
    })
    .input(z.object({
        variantId: z.string().min(1).max(36),
        quantity: z.number().min(1),
    })
    )
    .handler(async ({ input, context }) => {
        const userId = context.session.user.id;
        let quantityToAdd = input.quantity;
        const existingCartItem = await prisma.cartItem.findFirst({
            where: {
                userId,
                variantId: input.variantId,
            },
        });
        if (existingCartItem) {
            quantityToAdd += existingCartItem.quantity;
        }
        // Ensure quantity does not greater than stock
        const variant = await prisma.productVariant.findUnique({
            where: { id: input.variantId },
            select: { stockQuantity: true, isActive: true, },
        });
        if (!variant || !variant.isActive) {
            return { success: false, message: "Biến thể sản phẩm không tồn tại hoặc không hoạt động" };
        }
        if (quantityToAdd > variant.stockQuantity) {
            return { success: false, message: "Số lượng trong giỏ hàng vượt quá số lượng tồn kho" };
        }
        if (existingCartItem) {
            await prisma.cartItem.update({
                where: {
                    userId_variantId: {
                        userId,
                        variantId: input.variantId,
                    }
                },
                data: { quantity: quantityToAdd },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    userId,
                    variantId: input.variantId,
                    quantity: quantityToAdd,
                },
            });
        }
        return { success: true };

    }
    );
const countMyCartItems = orpcWithAuth
    .route({
        method: "GET",
        path: "/cart/items/count",
    })
    .handler(async ({ context }) => {
        const userId = context.session.user.id;
        const itemCount = await prisma.cartItem.count({
            where: { userId },
        });

        return { itemCount };
    }
    );

const getMyCartItems = orpcWithAuth
    .route({
        method: "GET",
        path: "/cart/items",
    })
    .handler(async ({ context }) => {
        const userId = context.session.user.id;

        const cartItems = await prisma.cartItem.findMany({
            where: {
                userId,
                variant: {
                    product: { isActive: true },
                    isActive: true,
                },
            },
            include: {
                variant: {
                    select: {
                        id: true,
                        price: true,
                        variantName: true,
                        stockQuantity: true,
                        sku: true,
                        product: {
                            select: {
                                id: true,
                                title: true,
                                displayPrice: true,
                                thumbnailUrl: true,
                            },
                        },
                    },
                },
            },
        })

        return cartItems;
    });
const clearMyCart = orpcWithAuth
    .route({
        method: "DELETE",
        path: "/cart",
    })
    .handler(async ({ context }) => {
        const userId = context.session.user.id;

        await prisma.cartItem.deleteMany({
            where: { userId },
        });
        return { success: true };
    }
    );

const removeCartItem = orpcWithAuth
    .route({
        method: "DELETE",
        path: "/cart/items",
    })
    .input(z.object({
        variantId: z.string().min(1).max(36),
    }))
    .handler(async ({ input, context }) => {
        const userId = context.session.user.id;

        await prisma.cartItem.deleteMany({
            where: { userId, variantId: input.variantId },
        });
        return { success: true };
    }
    );

const updateCartItem = orpcWithAuth
    .route({
        method: "PUT",
        path: "/cart/items",
    })
    .input(z.object({
        variantId: z.string().min(1).max(36),
        newQuantity: z.number().min(1),
    }))
    .handler(async ({ input, context }) => {
        const userId = context.session.user.id;
        const cartItem = await prisma.cartItem.findUnique({
            where: { userId_variantId: { userId, variantId: input.variantId } },
            include: {
                variant: {
                    select: { stockQuantity: true },
                },
            },
        });
        if (!cartItem) {
            return { success: false, message: "Sản phẩm không tồn tại trong giỏ hàng" };
        }
        if (input.newQuantity > cartItem.variant.stockQuantity) {
            return { success: false, message: "Số lượng trong giỏ hàng vượt quá số lượng tồn kho" };
        }
        await prisma.cartItem.update({
            where: { userId_variantId: { userId, variantId: input.variantId } },
            data: { quantity: input.newQuantity },
        });
        return { success: true };
    }
    );

const getMyCartItemsByIds = orpcWithAuth
    .route({
        method: "GET",
        path: "/cart/items/ids",
    })
    .input(z.object({
        variantIds: z.array(z.string().min(1).max(36)),
    }))
    .handler(async ({ input, context }) => {
        const userId = context.session.user.id;
        const cartItems = await prisma.cartItem.findMany({
            where: { userId, variantId: { in: input.variantIds } },
            include: {
                variant: {
                    select: {
                        id: true,
                        product: { select: { thumbnailUrl: true, title: true } },
                        variantName: true,
                        price: true,
                    },
                },
            },
        });
        return cartItems;
    }
    );

export const cartRoutes = {
    addToCart,
    countMyCartItems,
    getMyCartItems,
    clearMyCart,
    removeCartItem,
    updateCartItem,
    getMyCartItemsByIds,
};
