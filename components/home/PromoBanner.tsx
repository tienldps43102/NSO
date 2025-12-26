import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import bannerImage from "@/assets/comic-viet-banner.jpg";
import Image from "next/image";
export function PromoBanner() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-foreground via-foreground/95 to-foreground/90">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={bannerImage}
              alt="Comic Việt Nam"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-linear-to-r from-foreground via-foreground/90 to-transparent" />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-8 p-8 lg:p-12 items-center min-h-[320px]">
            {/* Content */}
            <div>
              <Badge className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold mb-6">
                COMIC VIỆT NAM
              </Badge>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4 leading-tight">
                Ủng hộ truyện tranh
                <br />
                tác giả Việt
              </h2>
              
              <p className="text-background/70 text-lg mb-8 max-w-md">
                Khám phá những câu chuyện thuần Việt đầy cảm xúc và sáng tạo từ các họa sĩ trẻ tài năng.
              </p>
              
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-12 px-8 bg-background text-foreground hover:bg-background/90 border-0"
              >
                Xem bộ sưu tập
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Right side decorative element */}
            <div className="hidden lg:flex justify-end items-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-linear-to-br from-primary/40 to-primary/10 backdrop-blur-xs flex items-center justify-center">
                  <span className="text-8xl">🇻🇳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
