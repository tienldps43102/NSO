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
  Edit,
  MoreHorizontal,
  Plus,
  FileText,
  Settings,
  BarChart3,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Mock data
const dashboardStats = {
  totalRevenue: 125680000,
  totalOrders: 1234,
  totalUsers: 5678,
  totalProducts: 890,
  revenueChange: 12.5,
  ordersChange: 8.2,
  usersChange: 15.3,
  productsChange: -2.1,
};

const recentOrders = [
  {
    id: "ORD-2024-001234",
    customer: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    total: 450000,
    status: "processing",
    date: "2024-01-15T10:30:00",
    items: 3,
  },
  {
    id: "ORD-2024-001233",
    customer: "Trần Thị B",
    email: "tranthib@email.com",
    total: 280000,
    status: "shipping",
    date: "2024-01-15T09:15:00",
    items: 2,
  },
  {
    id: "ORD-2024-001232",
    customer: "Lê Văn C",
    email: "levanc@email.com",
    total: 720000,
    status: "delivered",
    date: "2024-01-14T16:45:00",
    items: 5,
  },
  {
    id: "ORD-2024-001231",
    customer: "Phạm Thị D",
    email: "phamthid@email.com",
    total: 150000,
    status: "cancelled",
    date: "2024-01-14T14:20:00",
    items: 1,
  },
  {
    id: "ORD-2024-001230",
    customer: "Hoàng Văn E",
    email: "hoangvane@email.com",
    total: 890000,
    status: "processing",
    date: "2024-01-14T11:00:00",
    items: 4,
  },
];

const topProducts = [
  { id: 1, name: "Jujutsu Kaisen - Tập 20", sold: 156, revenue: 15600000, stock: 45 },
  { id: 2, name: "One Piece - Tập 105", sold: 142, revenue: 14200000, stock: 32 },
  { id: 3, name: "Chainsaw Man - Tập 15", sold: 128, revenue: 12800000, stock: 28 },
  { id: 4, name: "Spy x Family - Tập 12", sold: 115, revenue: 11500000, stock: 56 },
  { id: 5, name: "Blue Lock - Tập 22", sold: 98, revenue: 9800000, stock: 41 },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "processing":
      return {
        label: "Đang xử lý",
        variant: "secondary" as const,
        icon: Clock,
      };
    case "shipping":
      return {
        label: "Đang giao",
        variant: "default" as const,
        icon: Truck,
      };
    case "delivered":
      return {
        label: "Đã giao",
        variant: "outline" as const,
        icon: CheckCircle2,
      };
    case "cancelled":
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
  change,
  icon: Icon,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
}) => (
  <Card className="bg-card/60 backdrop-blur-md border-border/40">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
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
      <div className="flex items-center text-xs mt-1">
        {change >= 0 ? (
          <>
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-500">+{change}%</span>
          </>
        ) : (
          <>
            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            <span className="text-red-500">{change}%</span>
          </>
        )}
        <span className="text-muted-foreground ml-1">so với tháng trước</span>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan về hoạt động kinh doanh
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="bg-card/60 backdrop-blur-md border-border/40">
            <FileText className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={formatPrice(dashboardStats.totalRevenue)}
          change={dashboardStats.revenueChange}
          icon={DollarSign}
        />
        <StatCard
          title="Đơn hàng"
          value={dashboardStats.totalOrders}
          change={dashboardStats.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard
          title="Khách hàng"
          value={dashboardStats.totalUsers}
          change={dashboardStats.usersChange}
          icon={Users}
        />
        <StatCard
          title="Sản phẩm"
          value={dashboardStats.totalProducts}
          change={dashboardStats.productsChange}
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
                {recentOrders.length} đơn hàng mới nhất
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="bg-card/60 backdrop-blur-md border-border/40" asChild>
              <Link href="/admin/orders">
                Xem tất cả
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
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
                          <div className="font-medium">{order.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(order.date)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.items} sản phẩm
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Cập nhật
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
              {topProducts.map((product, index) => (
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
              ))}
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
              <Button variant="outline" size="sm" className="justify-start bg-card/60 backdrop-blur-md border-border/40">
                <Package className="h-4 w-4 mr-2" />
                Sản phẩm
              </Button>
              <Button variant="outline" size="sm" className="justify-start bg-card/60 backdrop-blur-md border-border/40">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Đơn hàng
              </Button>
              <Button variant="outline" size="sm" className="justify-start bg-card/60 backdrop-blur-md border-border/40">
                <Users className="h-4 w-4 mr-2" />
                Khách hàng
              </Button>
              <Button variant="outline" size="sm" className="justify-start bg-card/60 backdrop-blur-md border-border/40">
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
