import { Truck, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background with decorative elements */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative py-12 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Promo Pill */}

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Nâng cấp thiết bị <span className="text-primary">chuẩn gu</span>
            </h2>

            {/* Features */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Giao nhanh 2h</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Trả góp 0%</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
              <Button
                size="lg"
                className="rounded-full px-8 h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                Khám phá ngay
              </Button>
            </div>
          </div>

          {/* Right - Hero Image Area */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md lg:max-w-lg aspect-square">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow" />
              <div
                className="absolute inset-8 rounded-full border-2 border-dashed border-primary/15 animate-spin-slower"
                style={{ animationDirection: "reverse" }}
              />

              {/* Main gradient placeholder */}
              <div className="absolute inset-16 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center overflow-hidden">
                <div className="text-center p-6">
                  <div className="w-24 h-32 mx-auto mb-4 rounded-2xl bg-gradient-to-b from-card to-card/50 shadow-elevated flex items-center justify-center">
                    <div className="w-16 h-24 rounded-xl bg-foreground/10" />
                  </div>
                  <p className="text-sm text-muted-foreground">Sản phẩm nổi bật</p>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-12 right-4 glass rounded-2xl px-4 py-3 shadow-medium animate-float">
                <p className="text-xs text-muted-foreground">Giảm đến</p>
                <p className="text-lg font-bold text-primary">50%</p>
              </div>

              <div
                className="absolute bottom-16 left-0 glass rounded-2xl px-4 py-3 shadow-medium animate-float"
                style={{ animationDelay: "1s" }}
              >
                <p className="text-xs text-muted-foreground">Freeship</p>
                <p className="text-sm font-semibold">Đơn từ 500K</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
