"use client";
import { useState } from "react";
import { Search, ShoppingCart, Menu, X, Zap, LogIn, User, Settings, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";
import { authClient, type AuthUser } from "@/lib/auth-client";
import Link from "next/link";


interface SiteHeaderProps {
  user: AuthUser | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };


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
            <form action="/search" className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sách ..."
                enterKeyHint="search"
                name="q"
                className="w-full pl-10 pr-4 h-10 rounded-full bg-muted/50 border-border/50 focus:bg-card focus:border-primary/30"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 glass" aria-label="Giỏ hàng">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                3
              </Badge>
            </Button>

            {/* User Avatar/Login Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden sm:flex items-center gap-2 h-10 rounded-full px-3 glass hover:bg-accent/60">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={user?.image || "/default-avatar.png"} alt={user?.name || "User Avatar"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Tài khoản</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </DropdownMenuItem>
                  {user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Trang quản trị</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="hidden sm:flex h-10 rounded-full px-6 font-semibold">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập
                </Link>
              </Button>
            )}

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
            mobileMenuOpen ? "max-h-[500px] py-4" : "max-h-0"
          )}
        >
          {/* Mobile Search */}
          <div className="px-4 mb-4">
            <form action="/search" className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                name="q"
                className="w-full pl-10 pr-4 h-10 rounded-full bg-muted/50"
              />
            </form>
          </div>

          {/* Mobile User Section */}
          {user ? (
            <div className="px-4 mb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/40">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={user?.image || "/default-avatar.png"} alt={user?.name || "User Avatar"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <a href="/account" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                  <User className="h-4 w-4" />
                  Tài khoản
                </a>
                <a href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </a>
                {user?.role === "ADMIN" && (
                  <a href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                    <Shield className="h-4 w-4" />
                    Trang quản trị
                  </a>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 mb-4">
              <Button asChild className="w-full h-12 rounded-xl font-semibold">
                <a href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Đăng nhập
                </a>
              </Button>
            </div>
          )}

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