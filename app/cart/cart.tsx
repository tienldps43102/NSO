"use client"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
interface CartProps {
    cartItems: Outputs['cartRoutes']['getMyCartItems']
}
import { useLocalStorage } from 'usehooks-ts'
import useCartSelection from "@/hooks/use-cart-selection";
import { checkout } from "./actions";
export default function Cart({ cartItems: initialCartItems }: CartProps) {
    const { value: selectedItems, addItemToSelection, removeItemFromSelection, clearSelection, setSelection } = useCartSelection()
    const { data: cartItems } = useQuery($orpcQuery!.cartRoutes.getMyCartItems.queryOptions({
        initialData: initialCartItems,
    }))

    // Check if all items are selected
    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length
    const isSomeSelected = selectedItems.length > 0 && selectedItems.length < cartItems.length

    // Handle select all toggle
    const handleSelectAll = () => {
        if (isAllSelected) {
            clearSelection()
        } else {
            setSelection(cartItems.map(item => item.variant.id))
        }
    }

    // Handle individual item selection
    const handleItemSelection = (variantId: string) => {
        if (selectedItems.includes(variantId)) {
            removeItemFromSelection(variantId)
        } else {
            addItemToSelection(variantId)
        }
    }


    const queryClient = useQueryClient()
    const { mutate: removeCartItem } = useMutation($orpcQuery!.cartRoutes.removeCartItem.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries($orpcQuery!.cartRoutes.getMyCartItems.queryOptions())
            toast.success("Xóa sản phẩm khỏi giỏ hàng thành công")

        }
    }))
    const { mutate: clearMyCart } = useMutation($orpcQuery!.cartRoutes.clearMyCart.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries($orpcQuery!.cartRoutes.getMyCartItems.queryOptions())
            toast.success("Xóa tất cả sản phẩm khỏi giỏ hàng thành công")
        }
    }))
    const { mutate: updateCartItem, isPending: isUpdatingCartItem } = useMutation($orpcQuery!.cartRoutes.updateCartItem.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries($orpcQuery!.cartRoutes.getMyCartItems.queryOptions())
            toast.success("Cập nhật số lượng sản phẩm trong giỏ hàng thành công")
        }
    }))
    const handleUpdateCartItem = (variantId: string, newQuantity: number) => {
        updateCartItem({ variantId, newQuantity })
    }

    const selectedItemsTotal = selectedItems.reduce((sum, variantId) => {
        const item = cartItems.find(item => item.variant.id === variantId)
        if (item) {
            return sum + item.quantity
        }
        return sum
    }, 0)
    const selectedItemsTotalPrice = selectedItems.reduce((sum, variantId) => {
        const item = cartItems.find(item => item.variant.id === variantId)
        if (item) {
            return sum + Number(item.variant.price) * item.quantity
        }
        return sum
    }, 0)
    const validSelectedItems = selectedItems.filter(variantId => {
        const item = cartItems.find(item => item.variant.id === variantId)
        return item && item.quantity > 0
    })
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
                        {/* Select All Header */}
                        <div className="flex items-center justify-between p-4 bg-card/40 backdrop-blur-sm border border-border/40 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <span className="text-sm font-medium">
                                    {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                    {selectedItems.length > 0 && ` (${selectedItems.length} đã chọn)`}
                                </span>
                            </div>
                            {selectedItems.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        selectedItems.forEach(variantId => {
                                            removeCartItem({ variantId })
                                        })
                                        clearSelection()
                                    }}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Xóa đã chọn
                                </Button>
                            )}
                        </div>

                        {cartItems.map((item) => (
                            <div
                                key={item.variant.id}
                                className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-4 lg:p-5 flex gap-4"
                            >
                                {/* Checkbox */}
                                <div className="flex items-start pt-2">
                                    <Checkbox
                                        checked={selectedItems.includes(item.variant.id)}
                                        onCheckedChange={() => handleItemSelection(item.variant.id)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                </div>

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
                                                disabled={item.quantity <= 1 || isUpdatingCartItem}
                                                onClick={() => handleUpdateCartItem(item.variant.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                readOnly
                                                className="w-12 h-8 text-center border-0 bg-transparent p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={item.variant.stockQuantity <= item.quantity || isUpdatingCartItem}
                                                onClick={() => handleUpdateCartItem(item.variant.id, item.quantity + 1)}
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
                    <form className="lg:col-span-1" action={checkout}>
                        <input type="hidden" name="selected_variant_ids" value={validSelectedItems.join(',')} />
                        <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-5 lg:p-6 lg:sticky lg:top-24">
                            <h2 className="text-lg font-bold text-foreground mb-5">
                                Tóm tắt đơn hàng
                            </h2>



                            {/* Pricing Breakdown */}
                            <div className="space-y-3 border-t border-border/40 pt-5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tạm tính</span>
                                    <span className="text-foreground">
                                        {formatPrice(selectedItemsTotalPrice)}
                                    </span>
                                </div>

                                <div className="flex justify-between font-bold text-lg border-t border-border/40 pt-3 mt-3">
                                    <span className="text-foreground">Tổng cộng</span>
                                    <span className="text-primary">{formatPrice(selectedItemsTotalPrice)}</span>
                                </div>

                            </div>

                            {/* Checkout Button */}
                            <Button className="w-full mt-5" size="lg" disabled={validSelectedItems.length === 0} type="submit">
                                Tiến hành thanh toán
                            </Button>

                            {/* Secure Payment Note */}
                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                <span>Thanh toán an toàn & bảo mật</span>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
