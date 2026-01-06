import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { lightNovels, type LightNovel } from "@/lib/data";
import { cn } from "@/lib/utils";

function LightNovelCard({ novel }: { novel: LightNovel }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const getTagStyle = (tag?: string) => {
    switch (tag) {
      case "Mới phát hành":
        return "bg-primary text-primary-foreground";
      case "Tái bản":
        return "bg-amber-500 text-white";
      case "Hot":
        return "bg-rose-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <article className="shrink-0 w-[280px] md:w-[320px] bg-card rounded-2xl shadow-card overflow-hidden group hover:shadow-hover transition-all duration-300">
      <div className="flex gap-4 p-4">
        {/* Cover */}
        <div className="relative w-24 h-36 shrink-0 rounded-xl overflow-hidden bg-muted">
          <img
            src={novel.cover}
            alt={novel.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
          {novel.tag && (
            <Badge
              className={cn(
                "self-start px-2 py-0.5 text-[10px] font-semibold rounded-full mb-2",
                getTagStyle(novel.tag),
              )}
            >
              {novel.tag.toUpperCase()}
            </Badge>
          )}

          <div>
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {novel.title}
            </h3>
            <p className="text-xs text-muted-foreground">{novel.author}</p>
          </div>

          <span className="font-bold text-primary mt-2">{formatPrice(novel.price)}</span>
        </div>
      </div>
    </article>
  );
}

export function HorizontalProductRow() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              Light Novel Mới ✨
            </h2>
            <p className="text-muted-foreground">Thế giới chữ viết đầy màu sắc đang chờ đón bạn</p>
          </div>

          {/* Arrow buttons */}
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full glass"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full glass"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {lightNovels.map((novel, index) => (
            <LightNovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      </div>
    </section>
  );
}
