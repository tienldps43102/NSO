import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { toPlain } from "@/lib/toPlain";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  badges?: string[];
  inStock: boolean;
  lowStock?: boolean;
}



export default async  function Cart() {
  const cartItems = toPlain(await $client!.cartRoutes.getMyCartItems())




  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0
  );
//   const shippingFee = subtotal > 300000 ? 0 : 30000;
//   const discount = appliedCoupon ? Math.floor(subtotal * 0.1) : 0;
  const total = subtotal 
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
  

      <div className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="hover:text-primary">
                  Trang chủ
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Giỏ hàng</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Giỏ hàng của bạn
          </h1>
          <Badge variant="secondary" className="text-sm">
            {totalItems} sản phẩm
          </Badge>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Button asChild>
              <Link href="/">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.variant.id}
                  className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-4 lg:p-5 flex gap-4"
                >
                  {/* Product Image */}
                  <Link href={`/book/${item.variant.product.id}`} className="shrink-0">
                    <Image
                      src={item.variant.product.thumbnailUrl!}
                      alt={item.variant.product.title}
                      className="w-20 h-28 lg:w-24 lg:h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                      width={96}
                      height={128}
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/book/${item.variant.product.id}`}
                          className="font-semibold text-foreground hover:text-primary line-clamp-2 transition-colors"
                        >
                          {item.variant.product.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.variant.variantName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                  

                    {/* Bottom Row: Quantity & Price */}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 bg-background/50 border border-border/40 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                       
                          className="w-12 h-8 text-center border-0 bg-transparent p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          {formatPrice(Number(item.variant.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping Link */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-5 lg:p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-foreground mb-5">
                  Tóm tắt đơn hàng
                </h2>

                {/* Coupon Code */}
                {/* <div className="mb-5">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Mã giảm giá
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nhập mã..."
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="pl-9 bg-background/50"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim()}
                    >
                      Áp dụng
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Đã áp dụng mã: {appliedCoupon} (-10%)
                    </p>
                  )}
                </div> */}

                {/* Pricing Breakdown */}
                <div className="space-y-3 border-t border-border/40 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="text-foreground">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="text-foreground">
                      {shippingFee === 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          Miễn phí
                        </span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="text-green-600 dark:text-green-400">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )} */}
                  <div className="flex justify-between font-bold text-lg border-t border-border/40 pt-3 mt-3">
                    <span className="text-foreground">Tổng cộng</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  {/* {shippingFee > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Miễn phí vận chuyển cho đơn hàng từ 300.000đ
                    </p>
                  )} */}
                </div>

                {/* Checkout Button */}
                <Button className="w-full mt-5" size="lg">
                  Tiến hành thanh toán
                </Button>

                {/* Secure Payment Note */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

  );
}
