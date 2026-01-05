"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { DollarSign, ShoppingCart, Package, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type OverviewStats = Outputs["analyticsRoutes"]["getOverviewStats"];
type MonthlyRevenue = Outputs["analyticsRoutes"]["getMonthlyRevenue"];
type TopSellingProducts = Outputs["analyticsRoutes"]["getTopSellingProducts"];
type RevenueByCategory = Outputs["analyticsRoutes"]["getRevenueByCategory"];

const formatPrice = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

const formatFullPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  description: string;
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <Card className="bg-card/60 backdrop-blur-md border-border/40 hover:shadow-lg transition-shadow">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {/* <div className="flex items-center gap-1">
            {change >= 0 ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{change}%
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                {change}%
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{description}</span>
          </div> */}
        </div>
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {entry.name.includes("revenue") ||
              entry.name.includes("Doanh thu") ||
              entry.name.includes("Lợi nhuận")
                ? formatFullPrice(entry.value)
                : entry.value.toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("year");
  const currentYear = new Date().getFullYear();

  // Calculate date ranges
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    const endDate = now;

    switch (timeRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return { startDate, endDate };
  }, [timeRange]);

  // Fetch overview stats
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery<OverviewStats>(
    orpcQuery.analyticsRoutes.getOverviewStats.queryOptions({
      input: dateRange,
    }),
  );

  // Fetch monthly revenue
  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery<MonthlyRevenue>(
    orpcQuery.analyticsRoutes.getMonthlyRevenue.queryOptions({
      input: { year: currentYear },
    }),
  );

  // Fetch top selling products
  const { data: topProducts, isLoading: isLoadingTopProducts } = useQuery<TopSellingProducts>(
    orpcQuery.analyticsRoutes.getTopSellingProducts.queryOptions({
      input: { ...dateRange, limit: 8 },
    }),
  );

  // Fetch revenue by category
  const { data: categoryRevenue, isLoading: isLoadingCategory } = useQuery<RevenueByCategory>(
    orpcQuery.analyticsRoutes.getRevenueByCategory.queryOptions({
      input: dateRange,
    }),
  );

  // Transform monthly data for charts
  const revenueData = useMemo(() => {
    if (!monthlyData) return [];
    return monthlyData.map((item) => ({
      month: `T${item.month}`,
      revenue: Number(item.revenue),
      orders: item.orders,
    }));
  }, [monthlyData]);

  // Transform category data for pie chart
  const categoryData = useMemo(() => {
    if (!categoryRevenue) return [];
    const total = categoryRevenue.reduce((sum, cat) => sum + Number(cat.revenue), 0);
    return categoryRevenue.map((cat, index) => ({
      name: cat.name,
      value: total > 0 ? Math.round((Number(cat.revenue) / total) * 100) : 0,
      revenue: Number(cat.revenue),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [categoryRevenue]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Phân tích & Báo cáo</h1>
          <p className="text-muted-foreground mt-1">Tổng quan chi tiết về hiệu suất kinh doanh</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-card/60 backdrop-blur-md border-border/40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">30 ngày qua</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          {/* <Button variant="outline" className="bg-card/60 backdrop-blur-md border-border/40">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button> */}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={
            isLoadingOverview
              ? "Đang tải..."
              : formatPrice(Number(overviewData?.totalRevenue ?? 0)) + " ₫"
          }
          change={0}
          icon={DollarSign}
          description={timeRange === "year" ? "năm nay" : "trong khoảng thời gian"}
        />
        <StatCard
          title="Tổng đơn hàng"
          value={
            isLoadingOverview
              ? "Đang tải..."
              : (overviewData?.totalOrders ?? 0).toLocaleString("vi-VN")
          }
          change={0}
          icon={ShoppingCart}
          description={timeRange === "year" ? "năm nay" : "trong khoảng thời gian"}
        />
        <StatCard
          title="Tổng sản phẩm"
          value={
            isLoadingOverview
              ? "Đang tải..."
              : (overviewData?.totalProducts ?? 0).toLocaleString("vi-VN")
          }
          change={0}
          icon={Package}
          description="đang hoạt động"
        />
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-card/60 backdrop-blur-md border border-border/40 p-1">
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Doanh thu
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Package className="h-4 w-4 mr-2" />
            Sản phẩm
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue Trend */}
            <Card className="lg:col-span-2 bg-card/60 backdrop-blur-md border-border/40">
              <CardHeader>
                <CardTitle>Xu hướng doanh thu & Lợi nhuận</CardTitle>
                <CardDescription>Biểu đồ doanh thu và lợi nhuận theo tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  {isLoadingMonthly ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Đang tải dữ liệu...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis tickFormatter={formatPrice} className="text-xs" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Doanh thu"
                          stroke="hsl(var(--primary))"
                          fill="url(#revenueGradient)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          name="Số đơn hàng"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Category */}
            <Card className="bg-card/60 backdrop-blur-md border-border/40">
              <CardHeader>
                <CardTitle>Doanh thu theo danh mục</CardTitle>
                <CardDescription>Phân bố doanh thu theo loại sách</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCategory ? (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Đang tải dữ liệu...
                  </div>
                ) : categoryData.length > 0 ? (
                  <>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name, item) => [
                              `${value ?? 0}% (${formatFullPrice(item.payload.revenue)})`,
                              name ?? item.name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {categoryData.map((cat, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span>{cat.name}</span>
                          </div>
                          <span className="font-medium">{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Chưa có dữ liệu
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card className="bg-card/60 backdrop-blur-md border-border/40">
              <CardHeader>
                <CardTitle>Top sản phẩm bán chạy</CardTitle>
                <CardDescription>8 sản phẩm có doanh số cao nhất</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTopProducts ? (
                  <div className="flex items-center justify-center h-24 text-muted-foreground">
                    Đang tải dữ liệu...
                  </div>
                ) : topProducts && topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.product.id} className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.product.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Đã bán: {product.sold.toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatFullPrice(Number(product.revenue))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 text-muted-foreground">
                    Chưa có dữ liệu
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Sales by Category Bar Chart */}
          <Card className="bg-card/60 backdrop-blur-md border-border/40">
            <CardHeader>
              <CardTitle>Doanh số theo danh mục</CardTitle>
              <CardDescription>So sánh doanh thu theo từng danh mục</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCategory ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Đang tải dữ liệu...
                </div>
              ) : categoryRevenue && categoryRevenue.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={categoryRevenue
                        .map((cat) => ({
                          category: cat.name,
                          revenue: Number(cat.revenue),
                          count: cat.count,
                        }))
                        .sort((a, b) => b.revenue - a.revenue)}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis type="number" tickFormatter={formatPrice} />
                      <YAxis dataKey="category" type="category" width={120} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "revenue" ? formatFullPrice(Number(value)) : value,
                          name === "revenue" ? "Doanh thu" : "Số lượng",
                        ]}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
      </Tabs>
    </>
  );
};

export default AdminAnalytics;
