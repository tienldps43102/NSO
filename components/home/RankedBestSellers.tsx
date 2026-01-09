import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export async function RankedBestSellers() {
  const bestSellers = await $client?.productRoutes.getLatestProducts({
    limit: 6,
  });
  return (
    <section className="py-10 md:py-14">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Bán Chạy Trong Tháng</h2>
          <p className="text-muted-foreground mt-2">Top sản phẩm được khách hàng tin chọn</p>
        </div>

        {/* Ranked Items */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {bestSellers?.map((product, index) => (
            <div key={product.id} className="relative group">
              {/* Large rank number */}
              <div className="absolute -top-6 -left-2 md:-left-4 text-[120px] md:text-[160px] font-bold text-muted/30 leading-none select-none pointer-events-none z-0">
                {index + 1}
              </div>

              {/* Card */}
              <div
                className={cn(
                  "relative z-10 bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-300",
                  "hover:border-primary/30 hover:shadow-elevated hover:-translate-y-1",
                  index === 0 && "ring-2 ring-primary/20",
                )}
              >
                {/* Image */}
                <div className="relative aspect-4/3 bg-linear-to-br from-muted to-muted/50 overflow-hidden">
                  <Image
                    src={product.thumbnailUrl!}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                  <h3 className="font-semibold leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(Number(product.displayPrice))}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-2 rounded-full text-primary hover:text-primary hover:bg-primary/10"
                    asChild
                  >
                    <Link href={`/products/${product.id}`}>
                      Xem chi tiết
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
