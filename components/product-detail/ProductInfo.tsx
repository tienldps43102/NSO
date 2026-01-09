"use client";
import React, { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
interface Variant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

interface ProductInfoProps {
  productDetail: Outputs["productRoutes"]["getProductById"];
  className?: string;
}
import { toast } from "sonner";

export function ProductInfo({ productDetail, className }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(productDetail.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const isOneVariant = productDetail.variants.length === 1;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };
  const queryClient = useQueryClient();
  const { mutate: addToCart } = useMutation(
    $orpcQuery!.cartRoutes.addToCart.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: $orpcQuery!.cartRoutes.countMyCartItems.queryKey(),
        });
        if (data.success) {
          toast.success("Thêm vào giỏ hàng thành công");
        } else {
          toast.error("Thêm vào giỏ hàng thất bại", {
            description: data?.message,
          });
        }
      },
    }),
  );

  const handleAddToCart = () => {
    if (!selectedVariant?.id) return;
    addToCart({
      variantId: selectedVariant?.id,
      quantity: quantity,
    });
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Status Tags */}

      <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
        {productDetail.title}
      </h1>

      {/* Metadata */}
      <div className="flex flex-col items-start gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>
          Hãng:{" "}
          <Link
            key={productDetail.brand?.id}
            href={`/brand/${productDetail.brand?.id}`}
            className="text-primary hover:underline font-medium"
          >
            {productDetail.brand?.name}
          </Link>
        </span>
        <span>
          Danh mục:{" "}
          <Link
            key={productDetail.category?.id}
            href={`/category/${productDetail.category?.id}`}
            className="text-primary hover:underline font-medium"
          >
            {productDetail.category?.name}
          </Link>
        </span>
      </div>

      {/* Price Block */}
      <div className="bg-accent/50 rounded-xl p-4 space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(Number(selectedVariant?.price || 0) || 0)}
          </span>
        </div>
      </div>

      {/* Variant Selector */}
      {!isOneVariant && (
        <div className="space-y-3">
          <span className="text-sm font-medium text-foreground">Phiên bản:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {productDetail.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stockQuantity === 0}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                  selectedVariant.id === variant.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 text-foreground",
                  variant.stockQuantity === 0 && "opacity-50 cursor-not-allowed",
                )}
              >
                {variant.variantName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Quantity Selector */}
        <div className="flex items-center border border-border rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-r-none"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-l-none"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Add to Cart */}
        <Button variant="outline" className="flex-1 gap-2" size={"lg"} onClick={handleAddToCart}>
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </Button>

        {/* Buy Now */}
        <Button className="flex-1 gap-2" size={"lg"}>
          <Zap className="w-4 h-4" />
          Mua ngay
        </Button>
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Thông tin chi tiết</h3>
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <tbody>
              {(showAllAttributes
                ? productDetail.attributes
                : productDetail.attributes.slice(0, 6)
              ).map((detail, index) => (
                <tr
                  key={detail.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    index % 2 === 0 ? "bg-muted/30" : "bg-background",
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-muted-foreground w-1/3">
                    {detail.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{detail.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {productDetail.attributes.length > 6 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAllAttributes(!showAllAttributes)}
          >
            {showAllAttributes
              ? "Thu gọn"
              : `Xem thêm (${productDetail.attributes.length - 6} thông tin)`}
          </Button>
        )}
      </div>
    </div>
  );
}
