import { CheckCircle, Package, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { formatPrice } from "@/lib/utils";

const PaymentSuccess = async () => {
  const cookieStore = await cookies();
  const lastOrderId = cookieStore.get("last_order_id")?.value;
  if (!lastOrderId) {
    redirect("/", RedirectType.replace);
  }
  const order = await $client?.orderRoutes.getOrderById({ id: lastOrderId });
  return (
    <div className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle className="w-14 h-14 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground text-lg">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-8 text-left">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Thông tin đơn hàng</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-medium text-primary">{order?.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span className="font-medium text-foreground">
                  {order?.createdAt?.toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức thanh toán:</span>
                <span className="font-medium text-foreground">{order?.paymentMethod}</span>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg">
                <span className="font-semibold text-foreground">Tổng cộng:</span>
                <span className="font-bold text-primary">
                  {formatPrice(Number(order?.totalAmount))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Note */}
        {/* <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
                    <p className="text-sm text-muted-foreground">
                        📧 Một email xác nhận đã được gửi đến địa chỉ email của bạn với chi tiết đơn hàng.
                        Bạn có thể theo dõi trạng thái đơn hàng trong phần "Đơn hàng của tôi".
                    </p>
                </div> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-5 h-5" />
              Về trang chủ
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/user/orders">
              <Package className="w-5 h-5" />
              Xem đơn hàng
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="gap-2">
            <Link href="/">
              <FileText className="w-5 h-5" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
