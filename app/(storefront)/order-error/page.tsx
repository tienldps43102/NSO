import { XCircle, RotateCcw, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const PaymentFailed = () => {
  const errorDetails = {
    errorCode: "ERR-PAY-001",
    reason: "Giao dịch bị hủy bởi người dùng",
    timestamp: new Date().toLocaleString("vi-VN"),
  };

  return (
    <div className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Failed Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <XCircle className="w-14 h-14 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Thanh toán thất bại</h1>
          <p className="text-muted-foreground text-lg">
            Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng thử lại.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="mb-8 text-left border-destructive/30">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Chi tiết lỗi</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã lỗi:</span>
                <span className="font-mono text-sm text-destructive">{errorDetails.errorCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lý do:</span>
                <span className="font-medium text-foreground">{errorDetails.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời gian:</span>
                <span className="font-medium text-foreground">{errorDetails.timestamp}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/checkout">
              <RotateCcw className="w-5 h-5" />
              Thử lại thanh toán
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-5 h-5" />
              Về trang chủ
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="gap-2">
            <Link href="/contact">
              <MessageCircle className="w-5 h-5" />
              Liên hệ hỗ trợ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
