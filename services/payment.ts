import { prisma } from "@/lib/db";

export function updatePaymentStatus(orderId: string, status: "PENDING" | "SUCCESS" | "FAILED") {
    return prisma.order.update({
        where: { id: orderId },
        data: { 
            paymentStatus: status,
            paymentAt: new Date(),
         },
    })
}