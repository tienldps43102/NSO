import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";

export async function FeaturedSection() {
  const products = await $client?.productRoutes.getLatestProducts({
    limit: 5,
  })

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-muted-foreground mt-1">
              Những sản phẩm được yêu thích nhất tuần này
            </p>
          </div>
         
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products?.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-6 sm:hidden">
          <Button variant="outline" className="w-full rounded-full">
            Xem tất cả sản phẩm
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
