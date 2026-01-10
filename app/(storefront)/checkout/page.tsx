import { getSelectedItems } from "./actions";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import OrderInfo from "./info";
import { redirect } from "next/navigation";
import CheckoutForm from "./form";
export default async function CheckoutPage() {
  const selectedItems = await getSelectedItems();
  const cartItems = await $client?.cartRoutes.getMyCartItemsByIds({
    variantIds: selectedItems,
  });
  if (!cartItems) {
    redirect("/cart");
  }
  console.log(cartItems);
  return (
    <div className="flex-1 container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/cart">Giỏ hàng</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Thanh toán</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Thanh toán đơn hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <CheckoutForm />

        {/* Right Column - Order Summary */}
        <OrderInfo selectedItems={cartItems!} />
      </div>
    </div>
  );
}
