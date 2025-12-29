import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from 'next/link';
interface Variant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

interface ProductInfoProps {
  title: string;
  author: string;
  authorId: string;
  productCode: string;
  rating: number;
  reviewCount: number;
  variants: Variant[];
  isNewRelease?: boolean;
  inStock?: boolean;
  className?: string;
  details: any[];

}

export function ProductInfo({
  title,
  author,
  authorId,
  variants,
  inStock = true,
  className,
  details,
}: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };




  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Status Tags */}
     

      <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
        {title}
      </h1>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>
          Tác giả:{" "}
          <Link
            href={`/author/${authorId}`}
            className="text-primary hover:underline font-medium"
          >
            {author}
          </Link>
        </span>
        
      </div>

      {/* Rating */}
      {/* <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5",
                i < Math.floor(rating)
                  ? "fill-amber-400 text-amber-400"
                  : i < rating
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-muted text-muted"
              )}
            />
          ))}
        </div>
        <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
        <a
          href="#reviews"
          className="text-sm text-primary hover:underline"
        >
          ({reviewCount} đánh giá)
        </a>
      </div> */}

      {/* Price Block */}
      <div className="bg-accent/50 rounded-xl p-4 space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(selectedVariant.price)}
          </span>
        
        </div>
       
      </div>

      {/* Variant Selector */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-foreground">Phiên bản:</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              disabled={!variant.inStock}
              className={cn(
                "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                selectedVariant.id === variant.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-foreground",
                !variant.inStock && "opacity-50 cursor-not-allowed"
              )}
            >
              {variant.name}
            </button>
          ))}
        </div>
      </div>

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
        <Button variant="outline" className="flex-1 gap-2">
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </Button>

        {/* Buy Now */}
        <Button className="flex-1 gap-2">
          <Zap className="w-4 h-4" />
          Mua ngay
        </Button>
      </div>
        <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Thông tin chi tiết</h3>
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <tbody>
              {details.map((detail, index) => (
                <tr
                  key={detail.label}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    index % 2 === 0 ? "bg-muted/30" : "bg-background"
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-muted-foreground w-1/3">
                    {detail.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {detail.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
