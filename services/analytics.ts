import { prisma } from "@/lib/db";
import z from "zod";
import { orpcWithAuth } from "@/lib/orpc/base";

const getOverviewStats = orpcWithAuth
  .route({
    method: "GET",
    path: "/analytics/overview",
  })
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )
  .handler(async ({ input }) => {
    const [revenue, productCount] = await Promise.all([
      prisma.order.aggregate({
        where: { status: "DELIVERED", createdAt: { gte: input.startDate, lte: input.endDate } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.product.count({
        where: { isActive: true },
      }),
    ]);

    return {
      totalRevenue: revenue._sum.totalAmount ?? BigInt(0),
      totalOrders: revenue._count,
      totalProducts: productCount,
    };
  });

const getMonthlyRevenue = orpcWithAuth
  .route({
    method: "GET",
    path: "/analytics/monthly-revenue",
  })
  .input(
    z.object({
      year: z.number(),
    }),
  )
  .handler(async ({ input }) => {
    const startDate = new Date(input.year, 0, 1);
    const endDate = new Date(input.year, 11, 31, 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Group by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: BigInt(0),
      orders: 0,
    }));

    orders.forEach((order) => {
      const month = order.createdAt.getMonth();
      monthlyData[month].revenue += order.totalAmount;
      monthlyData[month].orders += 1;
    });

    return monthlyData;
  });

const getTopSellingProducts = orpcWithAuth
  .route({
    method: "GET",
    path: "/analytics/top-selling-products",
  })
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
      limit: z.number().optional().default(8),
    }),
  )
  .handler(async ({ input }) => {
    const topSellingProducts = await prisma.orderItem.groupBy({
      by: ["variantId"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: input.limit,
      where: {
        order: {
          status: "DELIVERED",
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
      revenue: product._sum.lineTotal ?? BigInt(0),
    }));
  });

const getRevenueByCategory = orpcWithAuth
  .route({
    method: "GET",
    path: "/analytics/revenue-by-category",
  })
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )
  .handler(async ({ input }) => {
    const orders = await prisma.orderItem.findMany({
      where: {
        order: {
          status: "DELIVERED",
          createdAt: { gte: input.startDate, lte: input.endDate },
        },
      },
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Group by category
    const categoryMap = new Map<string, { name: string; revenue: bigint; count: number }>();

    orders.forEach((item) => {
      const categoryId = item.variant.product.category.id;
      const categoryName = item.variant.product.category.name;

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          name: categoryName,
          revenue: BigInt(0),
          count: 0,
        });
      }

      const category = categoryMap.get(categoryId)!;
      category.revenue += item.lineTotal;
      category.count += item.quantity;
    });

    return Array.from(categoryMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      revenue: data.revenue,
      count: data.count,
    }));
  });

const analyticsRoutes = {
  getOverviewStats,
  getMonthlyRevenue,
  getTopSellingProducts,
  getRevenueByCategory,
};

export default analyticsRoutes;
