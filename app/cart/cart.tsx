"use client"
import React from 'react'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
interface CartProps {
    cartItems: Outputs['cartRoutes']['getMyCartItems']
}
export default function Cart({ cartItems: initialCartItems }: CartProps) {
    const { data: cartItems } = useQuery($orpcQuery!.cartRoutes.getMyCartItems.queryOptions({
        initialData: initialCartItems,
    }))
    const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.variant.price) * item.quantity,
        0
    );

    const total = subtotal
    const queryClient = useQueryClient()
    const {mutate:removeCartItem} = useMutation($orpcQuery!.cartRoutes.removeCartItem.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries($orpcQuery!.cartRoutes.getMyCartItems.queryOptions())
                toast.success("Xóa sản phẩm khỏi giỏ hàng thành công")
           
        }
    }))
    const {mutate:clearMyCart} = useMutation($orpcQuery!.cartRoutes.clearMyCart.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries($orpcQuery!.cartRoutes.getMyCartItems.queryOptions())
            toast.success("Xóa tất cả sản phẩm khỏi giỏ hàng thành công")
        }
    }))
    return (
        <div>
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
                                            onClick={() => removeCartItem({ variantId: item.variant.id })}
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
                                                disabled={item.variant.stockQuantity <= item.quantity}
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



                            {/* Pricing Breakdown */}
                            <div className="space-y-3 border-t border-border/40 pt-5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tạm tính</span>
                                    <span className="text-foreground">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between font-bold text-lg border-t border-border/40 pt-3 mt-3">
                                    <span className="text-foreground">Tổng cộng</span>
                                    <span className="text-primary">{formatPrice(total)}</span>
                                </div>

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
    )
}
