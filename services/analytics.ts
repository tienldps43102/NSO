import { prisma } from "@/lib/db";
import z from "zod";
import { orpcWithAuth } from "@/lib/orpc/base";

const getTotalRevenue = orpcWithAuth
  .route({
    method: "GET",
    path: "/analytics/revenue",
  })
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )
  .handler(async ({ input }) => {
    const revenue = await prisma.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: input.startDate, lte: input.endDate } },
      _sum: { totalAmount: true },
      _count: true,
    });

    return revenue;
  });

const getMonthlyRevenue = orpcWithAuth
  .route({
    method: "GET",
    path: "/analytics/monthly-revenue",
  })
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )

  .handler(async ({ input }) => {
    const monthlyRevenue = await prisma.order.groupBy({
      by: ["createdAt"],
      where: { status: "COMPLETED", createdAt: { gte: input.startDate, lte: input.endDate } },
      _sum: { totalAmount: true },
      _count: true,
    });
    return monthlyRevenue;
  });
//   Top sản phẩm bán chạy:

//   typescriptawait prisma.orderItem.groupBy({
//     by: ['variantId'],
//     _sum: { quantity: true, lineTotal: true },
//     orderBy: { _sum: { quantity: 'desc' } },
//     take: 8
//   })
//   // Sau đó join với ProductVariant và Product để lấy thông tin
const getTopSellingProducts = orpcWithAuth
  .route({
    method: "GET",
    path: "/analytics/top-selling-products",
  })
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )
  .output(
    z.array(
      z.object({
        product: z.object({
          id: z.string(),
          title: z.string(),
          thumbnailUrl: z.string().nullable(),
        }),
        sold: z.number(),
      }),
    ),
  )
  .handler(async ({ input }) => {
    const topSellingProducts = await prisma.orderItem.groupBy({
      by: ["variantId"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
      where: {
        order: {
          status: "COMPLETED",
          createdAt: { gte: input.startDate, lte: input.endDate },
        },
      },
    });
    const products = await prisma.productVariant.findMany({
      where: { id: { in: topSellingProducts.map((product) => product.variantId) } },
      include: {
        product: true,
      },
    });
    return topSellingProducts.map((product) => ({
      product: {
        id: product.variantId,
        title: products.find((p) => p.id === product.variantId)?.product.title ?? "",
        thumbnailUrl:
          products.find((p) => p.id === product.variantId)?.product.thumbnailUrl ?? null,
      },
      sold: product._sum.quantity ?? 0,
    }));
  });

const analyticsRoutes = {
  getTotalRevenue,
  getMonthlyRevenue,
  getTopSellingProducts,
};

export default analyticsRoutes;