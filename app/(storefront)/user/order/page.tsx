import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { OrderCard } from "./component";
import { OrderStatusType } from "@/lib/enum";
type Order = Outputs["orderRoutes"]["getMyOrders"];
const OrderHistory = async () => {
  const orders = await $client!.orderRoutes.getMyOrders({
    page: 1,
    limit: 20,
  });
  console.log(orders);
  const filterOrders = (status: OrderStatusType | "all") => {
    if (status === "all") return orders;
    return orders.filter((order) => order.status === status);
  };
  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Lịch sử đơn hàng</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Lịch sử đơn hàng</h1>
        <p className="text-muted-foreground">Theo dõi và quản lý các đơn hàng của bạn</p>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="relative overflow-hidden">
          <TabsList className="w-full justify-start overflow-hidden overflow-x-auto flex-nowrap glass shadow-soft p-1.5 rounded-2xl border-0">
            <TabsTrigger
              value="all"
              className="min-w-max rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all px-6 py-2.5 font-medium"
            >
              Tất cả ({orders.length})
            </TabsTrigger>
            <TabsTrigger
              value="PENDING"
              className="min-w-max rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all px-6 py-2.5 font-medium"
            >
              <Clock className="w-4 h-4 mr-2" />
              Đang xử lý ({filterOrders("PENDING").length})
            </TabsTrigger>
            <TabsTrigger
              value="SHIPPING"
              className="min-w-max rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all px-6 py-2.5 font-medium"
            >
              <Truck className="w-4 h-4 mr-2" />
              Đang giao ({filterOrders("SHIPPING").length})
            </TabsTrigger>
            <TabsTrigger
              value="DELIVERED"
              className="min-w-max rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all px-6 py-2.5 font-medium"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Đã giao ({filterOrders("DELIVERED").length})
            </TabsTrigger>
            <TabsTrigger
              value="CANCELLED"
              className="min-w-max rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all px-6 py-2.5 font-medium"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Đã hủy ({filterOrders("CANCELLED").length})
            </TabsTrigger>
          </TabsList>
        </div>

        {["all", "PENDING", "SHIPPING", "DELIVERED", "CANCELLED"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterOrders(status as OrderStatusType).length > 0 ? (
              filterOrders(status as OrderStatusType).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Không có đơn hàng nào</h3>
                <p className="text-muted-foreground mb-6">
                  Bạn chưa có đơn hàng nào trong danh mục này
                </p>
                <Button asChild>
                  <Link href="/">Tiếp tục mua sắm</Link>
                </Button>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
};

export default OrderHistory;
