import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { toPlain } from "@/lib/toPlain";
import { ShoppingBag } from "lucide-react";
import Cart from "./cart";


export default async function CartPage() {
  const cartItems = toPlain(await $client!.cartRoutes.getMyCartItems());

  const totalItems = cartItems.length;
  return (
    <div className="flex-1 container mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="hover:text-primary">
                Trang chủ
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Giỏ hàng</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="h-8 w-8 text-primary" />
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Giỏ hàng của bạn</h1>
        <Badge variant="secondary" className="text-sm">
          {totalItems} sản phẩm
        </Badge>
      </div>

      <Cart cartItems={cartItems} />
    </div>
  );
}
