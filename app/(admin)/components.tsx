"use client";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const AdminHeader = () => {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-6">
            {/* Search */}
            <div className="relative max-w-md flex-1">
               
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 pl-2 pr-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    AD
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline text-sm font-medium">Admin</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="h-4 w-4 mr-2" />
                            Hồ sơ
                        </DropdownMenuItem>
                        <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};


import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [collapsed, setCollapsed] = useState(false);



    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

            <div
                className={cn(
                    "min-h-screen transition-all duration-300",
                    collapsed ? "ml-16" : "ml-64"
                )}
            >
                <AdminHeader />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
};


import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings, LogOut,
    ChevronLeft,
    Menu
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AdminSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { title: "Danh mục", icon: Package, path: "/admin/categories" },
    { title: "Nhà xuất bản", icon: Package, path: "/admin/publishers" },
    { title: "Tác giả", icon: Package, path: "/admin/authors" },
    { title: "Sản phẩm", icon: Package, path: "/admin/products" },
    { title: "Đơn hàng", icon: ShoppingCart, path: "/admin/orders" },
    { title: "Khách hàng", icon: Users, path: "/admin/customers" },
    { title: "Thống kê", icon: BarChart3, path: "/admin/analytics" },
    { title: "Cài đặt", icon: Settings, path: "/admin/settings" },
];

export const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-border/40 bg-card/80 backdrop-blur-xl transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
                {!collapsed && (
                     <Link href="/admin" className="flex items-center gap-2">
                     <Image src="/logo.png" alt="Logo" width={40} height={40} />
                     <div className="flex flex-col">
                       <span className="font-bold text-lg text-primary leading-tight">NSO</span>
                       <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">Nhà Sách Online</span>
                     </div>
                   </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className={cn("h-8 w-8", collapsed && "mx-auto")}
                >
                    {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 p-2">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Về trang chủ</span>}
                </Link>
            </div>
        </aside>
    );
};
