"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Settings,
  BarChart3,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { useMemo } from "react";

type OverviewStats = Outputs["analyticsRoutes"]["getOverviewStats"];
type RecentOrders = Outputs["analyticsRoutes"]["getRecentOrders"];
type DashboardTopProducts = Outputs["analyticsRoutes"]["getDashboardTopProducts"];


const formatPrice = (price: number | bigint) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price));
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Chờ xử lý",
        variant: "secondary" as const,
        icon: Clock,
      };
    case "PROCESSING":
      return {
        label: "Đang xử lý",
        variant: "secondary" as const,
        icon: Clock,
      };
    case "SHIPPING":
      return {
        label: "Đang giao",
        variant: "default" as const,
        icon: Truck,
      };
    case "DELIVERED":
      return {
        label: "Đã giao",
        variant: "outline" as const,
        icon: CheckCircle2,
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        variant: "destructive" as const,
        icon: XCircle,
      };
    default:
      return {
        label: status,
        variant: "secondary" as const,
        icon: Clock,
      };
  }
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
}) => (
  <Card className="bg-card/60 backdrop-blur-md border-border/40">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {prefix}
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
        {suffix}
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  // Calculate date range for current month
  const dateRange = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = now;
    return { startDate, endDate };
  }, []);

  // Fetch overview stats
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery<OverviewStats>(
    orpcQuery.analyticsRoutes.getOverviewStats.queryOptions({
      input: dateRange,
    }),
  );

  // Fetch recent orders
  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery<RecentOrders>(
    orpcQuery.analyticsRoutes.getRecentOrders.queryOptions({
      input: { limit: 5 },
    }),
  );

  // Fetch top products
  const { data: topProducts, isLoading: isLoadingTopProducts } = useQuery<DashboardTopProducts>(
    orpcQuery.analyticsRoutes.getDashboardTopProducts.queryOptions({
      input: { limit: 5 },
    }),
  );

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Tổng quan về hoạt động kinh doanh</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={isLoadingOverview ? "..." : formatPrice(overviewData?.totalRevenue ?? 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Đơn hàng"
          value={isLoadingOverview ? "..." : overviewData?.totalOrders ?? 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="Khách hàng"
          value={isLoadingOverview ? "..." : overviewData?.totalUsers ?? 0}
          icon={Users}
        />
        <StatCard
          title="Sản phẩm"
          value={isLoadingOverview ? "..." : overviewData?.totalProducts ?? 0}
          icon={Package}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 bg-card/60 backdrop-blur-md border-border/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>
                {isLoadingOrders
                  ? "Đang tải..."
                  : `${recentOrders?.length ?? 0} đơn hàng mới nhất`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-card/60 backdrop-blur-md border-border/40"
              asChild
            >
              <Link href="/admin/orders">
                Xem tất cả
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                Đang tải dữ liệu...
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.orderCode}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {order.itemCount} sản phẩm
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link href={`/admin/orders?q=${order.orderCode}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                Chưa có đơn hàng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Products */}
          <Card className="bg-card/60 backdrop-blur-md border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sản phẩm bán chạy
              </CardTitle>
              <CardDescription>Top 5 sản phẩm trong tháng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingTopProducts ? (
                <div className="flex items-center justify-center h-24 text-muted-foreground">
                  Đang tải dữ liệu...
                </div>
              ) : topProducts && topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Đã bán: {product.sold} | Kho: {product.stock}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-24 text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/60 backdrop-blur-md border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Thao tác nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-card/60 backdrop-blur-md border-border/40"
              >
                <Package className="h-4 w-4 mr-2" />
                Sản phẩm
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-card/60 backdrop-blur-md border-border/40"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Đơn hàng
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-card/60 backdrop-blur-md border-border/40"
              >
                <Users className="h-4 w-4 mr-2" />
                Khách hàng
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-card/60 backdrop-blur-md border-border/40"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Thống kê
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
