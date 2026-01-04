import { Facebook, Instagram, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { footerLinks } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                📚
              </div>
              <span className="font-bold text-xl text-background">NSO</span>
            </div>
            <p className="text-background/70 text-sm mb-6 leading-relaxed">
              Nhà Sách Online – Điểm đến lý tưởng cho các tín đồ Manga và Light Novel. Chúng tôi
              mang đến những câu chuyện tuyệt vời nhất dành cho bạn.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-background/10 text-background hover:bg-background/20"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-background/10 text-background hover:bg-background/20"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <h4 className="font-semibold text-background mb-4">Danh mục</h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="font-semibold text-background mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-background mb-4">Đăng ký nhận tin</h4>
            <p className="text-sm text-background/70 mb-4">
              Nhận thông tin về sách mới và khuyến mãi sớm nhất.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email của bạn..."
                className="flex-1 h-10 rounded-full bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:bg-background/20"
              />
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-background/10" />
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
          <p>© 2025 Nhà Sách Online. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Điều khoản
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
