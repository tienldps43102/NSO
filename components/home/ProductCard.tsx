"use client";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";

interface ProductCardProps {
  product: Outputs["productRoutes"]["getLatestProducts"][0];
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCard({ product, className, style }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
        className,
      )}
      style={style}
    >
      {/* Cover Image */}
      <div className="relative aspect-2/3 bg-white overflow-hidden bg-muted">
        <Image
          src={product.thumbnailUrl || ""}
          fill
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 min-h-10 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">{product?.category?.name}</p>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-primary">{formatPrice(Number(product.displayPrice))}</span>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            aria-label={`Thêm ${product.title} vào giỏ hàng`}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

interface ProductCardSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCardSkeleton({ className, style }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn("relative bg-card rounded-2xl overflow-hidden shadow-card", className)}
      style={style}
    >
      {/* Cover Image */}
      <div className="relative aspect-2/3 overflow-hidden bg-muted">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Title (2 lines) */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />

        {/* Category */}
        <Skeleton className="h-3 w-1/2 mb-3" />

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-3">
          {/* Price */}
          <Skeleton className="h-5 w-20" />

          {/* Cart Button */}
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}
