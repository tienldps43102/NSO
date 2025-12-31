import { prisma } from "@/lib/db";
import { orpcWithAuth } from "@/lib/orpc/base";
import z from "zod";
import { computeSkipTake, paginationInput } from "./shared";

function generateOrderCode(createDate:Date): string {
    // DH-DDMMYYYY-XXXX(random 4 digits)
    const dd = String(createDate.getDate()).padStart(2, '0');
    const mm = String(createDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = createDate.getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // random 4 digits
    return `DH-${dd}${mm}${yyyy}-${randomDigits}`;
}


const createOrder = orpcWithAuth
    .route({
        method: "POST",
        path: "/orders",
    })
    .input(z.object({
        addressId: z.string().min(1).max(36),
        paymentMethod: z.enum(["COD", "VNPAY","MOMO"]),
        variantIds: z.array(z.string().min(1).max(36)).min(1),
        note: z.string().max(500).optional(),
    }))
    .handler(async ({ input, context }) => {
        const userId = context.session.user.id;
        // Implementation for creating an order goes here
        // select all cart items for the user with variantIds in input.variantIds
        const cartItems = await prisma.cartItem.findMany({
            where: {
                userId,
                variantId: {
                    in: input.variantIds,
                    
                },
                variant:{
                    isActive: true,
                    product:{
                        isActive: true,
                    }
                }
            },
            select:{
                variantId: true,
                quantity: true,
            }
        });
        const variants = await prisma.productVariant.findMany({
            where:{
                id:{
                    in: cartItems.map(item => item.variantId),
                }
            },
            select:{
                id: true,
                price: true,
                stockQuantity: true,
            }
        });
        const variantQuantityMap = new Map<string, number>();
        cartItems.forEach(item => {
            variantQuantityMap.set(item.variantId, item.quantity);
        });
        // kiểm tra từng cái xem có đủ hàng ko
        for(const variant of variants){
            const quantityInCart = variantQuantityMap.get(variant.id) || 0;
            if(quantityInCart > variant.stockQuantity){
                return { success: false, message: `Số lượng sản phẩm với biến thể ${variant.id} vượt quá số lượng tồn kho` };
            }
        }
        // Tính tổng tiền
        let totalAmount = 0;
        for(const variant of variants){
            const quantityInCart = variantQuantityMap.get(variant.id) || 0;
            totalAmount += Number(variant.price.times(quantityInCart));
        }
        // Tạo đơn hàng
        const newOrder = await prisma.order.create({
            data:{
                userId,
                addressId: input.addressId,
                paymentMethod: input.paymentMethod,
                totalAmount,
                status: "PENDING",
                orderCode : generateOrderCode(new Date()),
                createdAt: new Date(),
                paymentStatus:  "PENDING",
                subtotalAmount: totalAmount,
                note: input.note,
            }
        });
        // Tạo order items
        for(const variant of variants){
            const quantityInCart = variantQuantityMap.get(variant.id) || 0;
            await prisma.orderItem.create({
                data:{
                    orderId: newOrder.id,
                    variantId: variant.id,
                    quantity: quantityInCart,
                    lineTotal: variant.price.times(quantityInCart),
                    unitPrice: variant.price,
                }
            });
            // Cập nhật lại số lượng tồn kho
            await prisma.productVariant.update({
                where:{ id: variant.id },
                data:{
                    stockQuantity: {
                        decrement: quantityInCart,
                    }
                }
            });
        }
        // Xoá các mục trong giỏ hàng đã đặt
        await prisma.cartItem.deleteMany({
            where:{
                userId,
                variantId:{
                    in: input.variantIds,
                }
            }
        });
        // Xử lý thanh toán nếu paymentMethod là ONLINE
        if(input.paymentMethod !== "COD"){
            // Todo: Tích hợp với cổng thanh toán để tạo URL thanh toán
            const payURL = `https://payment-gateway.com/pay?orderId=${newOrder.id}&amount=${totalAmount}`;
            return { success: true, payURL };
        }
        return { success: true, payURL: null };
    }
    );
const cancelOrder = orpcWithAuth
    .route({
        method: "PATCH",
        path: "/orders/cancel",
    })
    .input(z.object({
        orderId: z.string().min(1).max(36),
    }))
    .handler(async ({ input, context }) => {
        const userId = context.session.user.id;
        const order = await prisma.order.findUnique({
            where: { id: input.orderId },
        });
        if (!order || order.userId !== userId) {
            throw new Error("Order not found or unauthorized");
        }
        if (order.status !== "PENDING") {
            throw new Error("Only pending orders can be canceled");
        }
        const canceledOrder = await prisma.order.update({
            where: { id: input.orderId },
            data: { status: "CANCELED" },
        });
        // Khôi phục lại số lượng tồn kho
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId: input.orderId },
        });
        for (const item of orderItems) {
            await prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                    stockQuantity: {
                        increment: item.quantity,
                    }
                }
            });
        }
        return canceledOrder;
    }
    );

const getMyOrders = orpcWithAuth
    .route({
        method: "GET",
        path: "/orders/me",
    })
    .input(paginationInput)
    .handler(async ({ context, input }) => {
                const { skip, take } = computeSkipTake(input.page, input.limit)
        
        const userId = context.session.user.id;
        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take,
        });
        return orders;
    }
    );

const getOrderById = orpcWithAuth
    .route({
        method: "GET",
        path: "/orders/:id",
    })
    .input(z.object({
        id: z.string().min(1).max(36),
    }))
    .handler(async ({ context, input }) => {
        const userId = context.session.user.id;
        const order = await prisma.order.findFirst({
            where: { id: input.id, userId },
            include: {
                orderItems: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            }
                        }
                    }
                }
            }
        });
        if (!order) {
            throw new Error("Order not found or unauthorized");
        }
        return order;
    }
    );
    
export const orderRoutes = {
    createOrder,
    cancelOrder,
    getMyOrders,
    getOrderById,
};