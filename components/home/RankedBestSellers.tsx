
"use client";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { bestSellers, type BestSeller } from "@/lib/data";

function RankedCard({ book }: { book: BestSeller }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <article className="relative bg-card rounded-2xl shadow-card overflow-hidden group hover:shadow-hover transition-all duration-300">
      {/* Large faint rank number */}
      <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-[120px] font-black text-muted/30 leading-none pointer-events-none select-none">
        {book.rank}
      </span>

      <div className="relative z-10 flex items-center gap-6 p-6">
        {/* Cover */}
        <div className="relative w-28 h-40 shrink-0 rounded-xl overflow-hidden bg-muted shadow-lg">
          <img
            src={book.cover}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{book.author}</p>

          <div className="flex items-center gap-3 mb-4">
            <span className="font-bold text-xl text-primary">{formatPrice(book.price)}</span>
            {book.discount && (
              <Badge className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold rounded-full">
                -{book.discount}%
              </Badge>
            )}
          </div>

          <a
            href={`#book-${book.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Xem chi tiết
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function RankedBestSellers() {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Bán Chạy Trong Tháng 🏆
          </h2>
          <p className="text-muted-foreground">
            Những tựa sách đang được săn đón nhiều nhất
          </p>
        </div>

        {/* Ranked Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {bestSellers.map((book, index) => (
            <RankedCard
              key={book.id}
              book={book}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
