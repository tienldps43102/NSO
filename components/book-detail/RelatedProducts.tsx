"use client";
import { BookCard } from "@/components/home/BookCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface RelatedProductsProps {
  title: string;
  products: Outputs["bookRoutes"]["getLatestBooks"];
}

export function RelatedProducts({ title, products }: RelatedProductsProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
            >
              <BookCard book={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 bg-card/90 backdrop-blur-md border-border shadow-lg" />
        <CarouselNext className="-right-4 bg-card/90 backdrop-blur-md border-border shadow-lg" />
      </Carousel>
    </section>
  );
}
