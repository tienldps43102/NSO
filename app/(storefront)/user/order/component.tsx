"use client";

import {
  Package,
  ChevronRight,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
const getStatusConfig = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return {
        label: "Đã giao",
        icon: CheckCircle,
        variant: "default" as const,
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      };
    case "SHIPPING":
      return {
        label: "Đang giao",
        icon: Truck,
        variant: "secondary" as const,
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      };
    case "PENDING":
      return {
        label: "Đang xử lý",
        icon: Clock,
        variant: "outline" as const,
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      };
    case "CANCELLED":
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

type Order = Outputs["orderRoutes"]["getMyOrders"][number];

export const OrderCard = ({ order }: { order: Order }) => {
  const [open, setOpen] = useState(false);
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-hover transition-all duration-300 shadow-card rounded-2xl border-0">
        <CardContent className="p-0">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 glass border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-soft">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">{order.orderCode}</p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(order.createdAt.toISOString())}</span>
                </div>
              </div>
            </div>
            <Badge
              className={`${statusConfig.className} flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold border`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Order Items */}
          <div className="p-5 space-y-4 bg-card/50">
            {order.orderItems.slice(0, 2).map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <img
                  src={item.variant.product.thumbnailUrl!}
                  alt={item.variant.product.title}
                  className="w-16 h-20 object-cover rounded-xl border-2 shadow-soft"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {item.variant.product.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Số lượng: {item.quantity}</p>
                  <p className="text-sm font-bold text-primary mt-1">
                    {formatPrice(Number(item.variant.price) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
            {order.orderItems.length > 2 && (
              <p className="text-sm text-muted-foreground text-center py-2 px-4 rounded-lg bg-muted/30">
                +{order.orderItems.length - 2} sản phẩm khác
              </p>
            )}
          </div>

          {/* Order Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 glass border-t">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Thanh toán:{" "}
                <span className="text-foreground font-semibold">{order.paymentMethod}</span>
              </p>
              <p className="text-xl font-bold text-foreground">
                Tổng: <span className="text-primary">{formatPrice(Number(order.totalAmount))}</span>
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2 rounded-full shadow-soft hover:shadow-hover transition-all px-6 py-5"
                  size="sm"
                >
                  <Eye className="w-4 h-4" />
                  Chi tiết
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-hover">
                <OrderDetailModal order={order} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const OrderDetailModal = ({ order }: { order: Order }) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-foreground mb-2">
              Chi tiết đơn hàng
            </DialogTitle>
            <DialogDescription className="text-base">
              Mã đơn hàng: <span className="font-semibold text-foreground">{order.orderCode}</span>
            </DialogDescription>
          </div>
          <Badge
            className={`${statusConfig.className} flex items-center gap-2 px-4 py-2 rounded-full font-semibold border`}
          >
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </Badge>
        </div>
      </DialogHeader>

      <Separator className="my-4" />

      {/* Order Info */}
      <div className="space-y-4">
        <div className="glass p-5 rounded-2xl space-y-3 shadow-soft">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Thông tin đơn hàng
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Ngày đặt:</p>
              <p className="font-semibold">{formatDate(order.createdAt.toISOString())}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trạng thái thanh toán:</p>
              <p className="font-semibold">{order.paymentStatus}</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="glass p-5 rounded-2xl space-y-3 shadow-soft">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Phương thức thanh toán
          </h3>
          <p className="font-semibold text-foreground">{order.paymentMethod}</p>
        </div>

        {/* Note */}
        {order.note && (
          <div className="glass p-5 rounded-2xl space-y-3 shadow-soft">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Ghi chú
            </h3>
            <p className="text-sm text-muted-foreground">{order.note}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="glass p-5 rounded-2xl space-y-4 shadow-soft">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Sản phẩm ({order.orderItems.length})
          </h3>
          <div className="space-y-3">
            {order.orderItems.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-xl bg-card/50 hover:bg-muted/30 transition-colors border"
              >
                <img
                  src={item.variant.product.thumbnailUrl!}
                  alt={item.variant.product.title}
                  className="w-20 h-24 object-cover rounded-xl border-2 shadow-soft"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-2">
                    {item.variant.product.title}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Đơn giá:{" "}
                      <span className="font-semibold text-foreground">
                        {formatPrice(Number(item.unitPrice))}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Số lượng:{" "}
                      <span className="font-semibold text-foreground">{item.quantity}</span>
                    </p>
                    <p className="text-base font-bold text-primary">
                      Thành tiền: {formatPrice(Number(item.lineTotal))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass p-5 rounded-2xl space-y-3 shadow-soft border-2 border-primary/20">
          <h3 className="font-bold text-lg">Tổng kết đơn hàng</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span className="font-semibold">{formatPrice(Number(order.subtotalAmount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển:</span>
              <span className="font-semibold">{formatPrice(Number(order.shippingFee || 0))}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Tổng cộng:</span>
              <span className="font-bold text-primary text-xl">
                {formatPrice(Number(order.totalAmount))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
