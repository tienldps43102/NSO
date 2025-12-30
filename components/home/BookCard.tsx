"use client";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

interface BookCardProps {
  book: Outputs["bookRoutes"]["getLatestBooks"][0];
  className?: string;
  style?: React.CSSProperties;
}

export function BookCard({ book, className, style }: BookCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <Link
      href={`/products/${book.id}`}
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
        className
      )}
      style={style}
    >
      {/* Cover Image */}
      <div className="relative aspect-2/3 overflow-hidden bg-muted">
        <img
          src={book.thumbnailUrl!}
          alt={book.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />



        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 min-h-10 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">{book?.category?.name}</p>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-primary">{formatPrice(Number(book.displayPrice))}</span>

          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            aria-label={`Thêm ${book.title} vào giỏ hàng`}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

interface BookCardSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function BookCardSkeleton({ className, style }: BookCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative bg-card rounded-2xl overflow-hidden shadow-card",
        className
      )}
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

