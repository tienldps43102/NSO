"use client";
import { useState } from "react";
import { Search, Heart, ShoppingCart, Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
 
}

export function SiteHeader({  }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto">
        {/* Main Header */}
        <div className="flex items-center justify-between h-16 px-4 lg:px-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
              📚
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary leading-tight">NSO</span>
              <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">Nhà Sách Online</span>
            </div>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm truyện yêu thích, tác giả..."
                className="w-full pl-10 pr-4 h-10 rounded-full bg-muted/50 border-border/50 focus:bg-card focus:border-primary/30"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
           

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 glass hidden sm:flex" aria-label="Danh sách yêu thích">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 glass" aria-label="Giỏ hàng">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                3
              </Badge>
            </Button>

            {/* Avatar */}
            <Avatar className="h-10 w-10 border-2 border-primary/20 hidden sm:flex">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=nso" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">U</AvatarFallback>
            </Avatar>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center justify-center gap-1 py-2 border-t border-border/50">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-primary/5"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#khuyenmai"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/15 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Khuyến Mãi
          </a>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-96 py-4" : "max-h-0"
          )}
        >
          {/* Mobile Search */}
          <div className="px-4 mb-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 h-10 rounded-full bg-muted/50"
              />
            </div>
          </div>

          {/* Mobile Nav Links */}
          <nav className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a
              href="#khuyenmai"
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-primary bg-primary/10 rounded-xl"
            >
              <Zap className="h-4 w-4" />
              Khuyến Mãi
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
