import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16">
            {/* Content */}
            <div className="space-y-5 text-center md:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                Phụ kiện chính hãng
              </span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-background leading-tight">
                Combo sạc nhanh, yên tâm mỗi ngày
              </h3>
              <p className="text-background/70 max-w-md mx-auto md:mx-0">
                Bộ sưu tập phụ kiện Apple, Samsung, Anker chính hãng với giá ưu đãi đặc biệt. Bảo hành 12 tháng.
              </p>
              <Button
                size="lg"
                className="rounded-full px-8 h-12 text-base font-semibold gradient-primary hover:opacity-90"
              >
                Xem bộ sưu tập
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Image placeholder */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <div className="aspect-square rounded-2xl bg-background/10 backdrop-blur-sm" />
                    <div className="aspect-square rounded-2xl bg-background/10 backdrop-blur-sm" />
                    <div className="aspect-square rounded-2xl bg-background/10 backdrop-blur-sm" />
                    <div className="aspect-square rounded-2xl bg-background/10 backdrop-blur-sm" />
                  </div>
                </div>
                {/* Decorative ring */}
                <div className="absolute -inset-4 rounded-full border-2 border-dashed border-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
