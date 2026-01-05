"use client";
import { useState } from "react";
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
  AreaChart,
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
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  Zap,
} from "lucide-react";

// Mock data - Doanh thu theo tháng
const revenueData = [
  { month: "T1", revenue: 45000000, orders: 156, profit: 12000000 },
  { month: "T2", revenue: 52000000, orders: 189, profit: 15000000 },
  { month: "T3", revenue: 48000000, orders: 167, profit: 13500000 },
  { month: "T4", revenue: 61000000, orders: 234, profit: 18000000 },
  { month: "T5", revenue: 55000000, orders: 198, profit: 16000000 },
  { month: "T6", revenue: 67000000, orders: 267, profit: 21000000 },
  { month: "T7", revenue: 72000000, orders: 289, profit: 23000000 },
  { month: "T8", revenue: 69000000, orders: 276, profit: 22000000 },
  { month: "T9", revenue: 78000000, orders: 312, profit: 26000000 },
  { month: "T10", revenue: 85000000, orders: 345, profit: 29000000 },
  { month: "T11", revenue: 92000000, orders: 378, profit: 32000000 },
  { month: "T12", revenue: 125000000, orders: 456, profit: 45000000 },
];

// Doanh thu theo ngày trong tuần
const weeklyData = [
  { day: "T2", revenue: 15000000, visitors: 1200 },
  { day: "T3", revenue: 18000000, visitors: 1450 },
  { day: "T4", revenue: 22000000, visitors: 1680 },
  { day: "T5", revenue: 19000000, visitors: 1520 },
  { day: "T6", revenue: 28000000, visitors: 2100 },
  { day: "T7", revenue: 35000000, visitors: 2800 },
  { day: "CN", revenue: 32000000, visitors: 2500 },
];

// Doanh thu theo danh mục
const categoryData = [
  { name: "Manga", value: 45, revenue: 560000000, color: "hsl(var(--primary))" },
  { name: "Light Novel", value: 25, revenue: 310000000, color: "hsl(var(--chart-2))" },
  { name: "Truyện tranh VN", value: 15, revenue: 186000000, color: "hsl(var(--chart-3))" },
  { name: "Sách thiếu nhi", value: 10, revenue: 124000000, color: "hsl(var(--chart-4))" },
  { name: "Khác", value: 5, revenue: 62000000, color: "hsl(var(--chart-5))" },
];

// Top sản phẩm bán chạy
const topProducts = [
  { name: "Jujutsu Kaisen - Tập 20", sold: 1256, revenue: 125600000, growth: 23.5 },
  { name: "One Piece - Tập 105", sold: 1142, revenue: 114200000, growth: 18.2 },
  { name: "Chainsaw Man - Tập 15", sold: 1028, revenue: 102800000, growth: 31.4 },
  { name: "Spy x Family - Tập 12", sold: 915, revenue: 91500000, growth: 12.8 },
  { name: "Blue Lock - Tập 22", sold: 898, revenue: 89800000, growth: 45.2 },
  { name: "Kimetsu no Yaiba - Tập 23", sold: 876, revenue: 87600000, growth: -5.3 },
  { name: "My Hero Academia - Tập 35", sold: 821, revenue: 82100000, growth: 8.7 },
  { name: "Attack on Titan - Tập 34", sold: 789, revenue: 78900000, growth: -12.1 },
];

// Dữ liệu khách hàng
const customerData = [
  { month: "T1", newCustomers: 234, returning: 456 },
  { month: "T2", newCustomers: 289, returning: 512 },
  { month: "T3", newCustomers: 267, returning: 478 },
  { month: "T4", newCustomers: 345, returning: 534 },
  { month: "T5", newCustomers: 312, returning: 567 },
  { month: "T6", newCustomers: 398, returning: 612 },
  { month: "T7", newCustomers: 423, returning: 645 },
  { month: "T8", newCustomers: 401, returning: 678 },
  { month: "T9", newCustomers: 456, returning: 723 },
  { month: "T10", newCustomers: 489, returning: 756 },
  { month: "T11", newCustomers: 523, returning: 801 },
  { month: "T12", newCustomers: 612, returning: 892 },
];

// Traffic sources
const trafficData = [
  { name: "Tìm kiếm tự nhiên", value: 42, color: "hsl(var(--primary))" },
  { name: "Mạng xã hội", value: 28, color: "hsl(var(--chart-2))" },
  { name: "Trực tiếp", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Quảng cáo", value: 12, color: "hsl(var(--chart-4))" },
];

// Hourly data
const hourlyData = [
  { hour: "00h", orders: 12, revenue: 1200000 },
  { hour: "02h", orders: 5, revenue: 500000 },
  { hour: "04h", orders: 3, revenue: 300000 },
  { hour: "06h", orders: 8, revenue: 800000 },
  { hour: "08h", orders: 25, revenue: 2500000 },
  { hour: "10h", orders: 45, revenue: 4500000 },
  { hour: "12h", orders: 52, revenue: 5200000 },
  { hour: "14h", orders: 48, revenue: 4800000 },
  { hour: "16h", orders: 56, revenue: 5600000 },
  { hour: "18h", orders: 67, revenue: 6700000 },
  { hour: "20h", orders: 78, revenue: 7800000 },
  { hour: "22h", orders: 42, revenue: 4200000 },
];

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

const StatCard = ({ title, value, change, icon: Icon, description }: StatCardProps) => (
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
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
          value="849M ₫"
          change={24.5}
          icon={DollarSign}
          description="so với năm trước"
        />
        <StatCard
          title="Tổng đơn hàng"
          value="3,267"
          change={18.2}
          icon={ShoppingCart}
          description="so với năm trước"
        />
        <StatCard
          title="Tống sản phẩm"
          value="1,234"
          change={32.1}
          icon={Package}
          description="so với năm trước"
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
                        dataKey="profit"
                        name="Lợi nhuận"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
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
              </CardContent>
            </Card>
          </div>

          {/* Weekly & Hourly */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card/60 backdrop-blur-md border-border/40">
              <CardHeader>
                <CardTitle>Doanh thu theo ngày trong tuần</CardTitle>
                <CardDescription>So sánh doanh thu và lượt truy cập</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis yAxisId="left" tickFormatter={formatPrice} className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="revenue"
                        name="Doanh thu"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="visitors"
                        name="Lượt truy cập"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border-border/40">
              <CardHeader>
                <CardTitle>Đơn hàng theo giờ</CardTitle>
                <CardDescription>Phân tích thời điểm mua sắm cao điểm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyData}>
                      <defs>
                        <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        name="Đơn hàng"
                        stroke="hsl(var(--chart-2))"
                        fill="url(#ordersGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 bg-card/60 backdrop-blur-md border-border/40">
              <CardHeader>
                <CardTitle>Top sản phẩm bán chạy</CardTitle>
                <CardDescription>8 sản phẩm có doanh số cao nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Đã bán: {product.sold.toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatFullPrice(product.revenue)}</p>
                        <div className="flex items-center justify-end gap-1">
                          {product.growth >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span
                            className={`text-xs ${
                              product.growth >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {product.growth >= 0 ? "+" : ""}
                            {product.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border-border/40">
              <CardHeader>
                <CardTitle>Hiệu suất sản phẩm</CardTitle>
                <CardDescription>Tổng quan nhanh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tổng sản phẩm</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đang bán</span>
                    <span className="font-medium text-green-500">1,089</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hết hàng</span>
                    <span className="font-medium text-red-500">45</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sắp hết</span>
                    <span className="font-medium text-yellow-500">100</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Cảnh báo tồn kho</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm">
                      <span className="font-medium">Blue Lock - Tập 22</span>
                      <span className="block text-xs">Còn 5 cuốn</span>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-600 text-sm">
                      <span className="font-medium">Spy x Family - Tập 11</span>
                      <span className="block text-xs">Hết hàng</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales by Category Bar Chart */}
          <Card className="bg-card/60 backdrop-blur-md border-border/40">
            <CardHeader>
              <CardTitle>Doanh số theo danh mục</CardTitle>
              <CardDescription>So sánh số lượng bán được theo từng danh mục</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { category: "Manga", sold: 15600, revenue: 1560000000 },
                      { category: "Light Novel", sold: 8900, revenue: 890000000 },
                      { category: "Truyện tranh VN", sold: 5400, revenue: 324000000 },
                      { category: "Sách thiếu nhi", sold: 3200, revenue: 192000000 },
                      { category: "Tiểu thuyết", sold: 2100, revenue: 168000000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" tickFormatter={formatPrice} />
                    <YAxis dataKey="category" type="category" width={120} />
                    <Tooltip
                      formatter={(value, name, item) => [
                        formatFullPrice(item.payload.revenue),
                        "Doanh thu",
                      ]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
      </Tabs>
    </>
  );
};

export default AdminAnalytics;
