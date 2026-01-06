import { ProductCard, ProductCardSkeleton } from "@/components/home/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Skeleton } from "../ui/skeleton";
import { toPlain } from "@/lib/toPlain";
import Link from "next/link";

interface RelatedProductsProps {
  title: string;
  fetchFunction: () => Promise<Outputs["productRoutes"]["getRelatedProducts"]>;
  moreHref?: string;
}

export async function RelatedProducts({ title, fetchFunction, moreHref }: RelatedProductsProps) {
  const relatedProducts = toPlain(await fetchFunction());

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {moreHref && (
          <Link href={moreHref} className="text-sm text-primary font-medium hover:underline">
            Xem thêm
          </Link>
        )}
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {relatedProducts?.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 bg-card/90 backdrop-blur-md border-border shadow-lg" />
        <CarouselNext className="-right-4 bg-card/90 backdrop-blur-md border-border shadow-lg" />
      </Carousel>
    </section>
  );
}

interface RelatedProductsSkeletonProps {
  title?: string;
  itemCount?: number;
}

export function RelatedProductsSkeleton({
  title = "Sản phẩm liên quan",
  itemCount = 5,
}: RelatedProductsSkeletonProps) {
  return (
    <section className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {Array.from({ length: itemCount }).map((_, index) => (
            <CarouselItem
              key={index}
              className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
            >
              <ProductCardSkeleton />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Disable interaction for skeleton */}
        <CarouselPrevious className="-left-4 pointer-events-none opacity-50" />
        <CarouselNext className="-right-4 pointer-events-none opacity-50" />
      </Carousel>
    </section>
  );
}
