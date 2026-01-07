import { ArrowRight,  ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

export async function HorizontalProductRow() {
  const newArrivals = await $client?.productRoutes.getLatestProducts({
    limit: 5,
  });

  return (
    <section className="py-10 md:py-14 bg-secondary/30">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Hàng Mới Về 
            </h2>
            <p className="text-muted-foreground mt-1">
              Cập nhật những sản phẩm mới nhất
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <a
            href="#"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </a>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
          {newArrivals?.map((product, index) => (
            <div
              key={product.id}
              className="shrink-0 w-70 md:w-[320px] animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile Navigation hint */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
          <span className="text-xs text-muted-foreground">Vuốt để xem thêm</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}
