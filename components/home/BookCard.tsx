"use client";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Book } from "@/lib/data";

interface BookCardProps {
  book: Book;
  className?: string;
  style?: React.CSSProperties;
}

export function BookCard({ book, className, style }: BookCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <article
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
        className
      )}
      style={style}
    >
      {/* Cover Image */}
      <div className="relative aspect-2/3 overflow-hidden bg-muted">
        <img
          src={book.cover}
          alt={book.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badge */}
        {(book.badge || book.discount) && (
          <Badge
            className={cn(
              "absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full z-10",
              book.badge === "HOT" && "bg-primary text-primary-foreground",
              book.badge === "MỚI" && "bg-emerald-500 text-white",
              book.discount && "bg-primary text-primary-foreground"
            )}
          >
            {book.discount ? `-${book.discount}%` : book.badge}
          </Badge>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 min-h-10 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">{book.author}</p>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-primary">{formatPrice(book.price)}</span>
            {book.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(book.originalPrice)}
              </span>
            )}
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
    </article>
  );
}
