import { Package, ChevronRight, Calendar, Truck, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          label: "Đã giao",
          icon: CheckCircle,
          variant: "default" as const,
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        };
      case "shipping":
        return {
          label: "Đang giao",
          icon: Truck,
          variant: "secondary" as const,
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      case "processing":
        return {
          label: "Đang xử lý",
          icon: Clock,
          variant: "outline" as const,
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          icon: XCircle,
          variant: "destructive" as const,
          className: "bg-red-500/10 text-red-600 border-red-500/20",
        };
      default:
        return {
          label: "Không xác định",
          icon: Package,
          variant: "outline" as const,
          className: "",
        };
    }
  };
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("vi-VN");
  }
  function formatPrice(price: number) {
    return price.toLocaleString("vi-VN") + "₫";
  }
  type Order = Outputs["orderRoutes"]["getMyOrders"][number];
export const OrderCard = ({ order }: { order:Order }) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{order.id}</p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(order.createdAt.toISOString())}</span>
                </div>
              </div>
            </div>
            <Badge className={`${statusConfig.className} flex items-center gap-1.5 px-3 py-1`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Order Items */}
          <div className="p-4 space-y-3">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex gap-3">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-16 h-20 object-cover rounded-md border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                  <p className="text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-sm text-muted-foreground">
                +{order.items.length - 2} sản phẩm khác
              </p>
            )}
          </div>

          {/* Order Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/20 border-t">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Thanh toán: <span className="text-foreground font-medium">{order.paymentMethod}</span>
              </p>
              <p className="text-lg font-bold text-foreground">
                Tổng: <span className="text-primary">{formatPrice(order.total)}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Chi tiết
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };