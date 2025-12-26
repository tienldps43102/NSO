import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-books.jpg";
import Image from "next/image";
export function Hero() {
  return (
    <section className="relative overflow-hidden hero-gradient">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="relative z-10 animate-fade-in">
            {/* Promo Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Đại tiệc Manga tháng 10
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Thế giới{" "}
              <span className="text-primary">truyện tranh</span>
              <br />
              dành cho bạn
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Khám phá hàng ngàn tựa sách Manga, Light Novel và Comic Việt hot nhất hiện nay với nhiều ưu đãi hấp dẫn.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full h-12 px-8 text-base font-semibold transition-all">
                Khám phá ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-12 px-8 text-base font-semibold glass hover:bg-card"
              >
                Xem khuyến mãi
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative flex justify-center lg:justify-end animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Gradient background for image */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl transform rotate-3" />
              
              {/* Hero Image */}
              <div className="relative aspect-square rounded-3xl shadow-card overflow-hidden">
                <Image
                  src={heroImage}
                  alt="Bộ sưu tập Manga và Light Novel"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating badge */}
                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                  -20%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
