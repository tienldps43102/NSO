"use client"
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from '@/lib/utils';
import { useFormContext } from "react-hook-form";
import { CheckoutFormSchema, checkoutFormSchema } from "./form";
interface OrderInfoProps {
    selectedItems: Outputs['cartRoutes']['getMyCartItemsByIds']
}

export default function OrderInfo({ selectedItems }: OrderInfoProps) {
    const form = useFormContext<CheckoutFormSchema>()
    const subtotal = selectedItems.reduce((acc, item) => acc + Number(item.variant.price) * item.quantity, 0);
    return (
        <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    Đơn hàng của bạn
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                    {selectedItems.map((item) => (
                        <div key={item.variantId} className="flex gap-3">
                            <div className="relative shrink-0">
                                <img
                                    src={item.variant.product.thumbnailUrl!}
                                    alt={item.variant.product.title}
                                    className="w-16 h-20 object-cover rounded-md border border-border"
                                />
                                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-foreground line-clamp-2">
                                    {item.variant.product.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">{item.variant.variantName}</p>
                                <p className="text-sm font-semibold text-primary mt-1">
                                    {formatPrice(Number(item.variant.price) * item.quantity)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator className="my-4" />

                {/* Pricing Breakdown */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tạm tính</span>
                        <span className="text-foreground">{formatPrice(subtotal)}</span>
                    </div>
              
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-foreground">
                        Tổng cộng
                    </span>
                    <span className="text-xl font-bold text-primary">
                        {formatPrice(subtotal)}
                    </span>
                </div>

                {/* Place Order Button */}
                <Button className="w-full h-12 text-base font-semibold" type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đặt hàng'}
                </Button>

                {/* Secure Payment Note */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Thanh toán an toàn & bảo mật</span>
                </div>
            </div>
        </div>
    )
}
