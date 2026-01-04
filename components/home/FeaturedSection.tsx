import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCard } from "./BookCard";
// /await $client?.bookRoutes.getLatestBooks({ limit: 10 });
interface FeaturedSectionProps {
  books: Outputs["bookRoutes"]["getLatestBooks"];
}
export function FeaturedSection({ books }: FeaturedSectionProps) {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Mới cập nhật</h2>
            <p className="text-muted-foreground">Top truyện tranh được yêu thích nhất tuần qua</p>
          </div>
          <a
            href="#manga"
            className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {books.map((book, index) => (
            <BookCard
              key={book.id}
              book={book}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 md:hidden">
          <Button variant="outline" className="w-full rounded-full h-12">
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
