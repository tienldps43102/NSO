import { os, ORPCError } from "@orpc/server";
import { Session } from "./auth-client";
import { auth } from "./auth";
import { productRoutes } from "@/services/product";
import { categoryRoutes } from "@/services/category";
import { brandRoutes } from "@/services/brand";
import { userRoutes } from "@/services/user";
import { cartRoutes } from "@/services/cart";
import { orderRoutes } from "@/services/order";
import { productAdminRoutes } from "@/services/product.admin";
import { orpc } from "./orpc/base";
import { fileRoutes } from "@/services/file";
import { authRoutes } from "@/services/auth";
import { addressRoutes } from "@/services/address";
import analyticsRoutes from "@/services/analytics";
import { customerRoutes } from "@/services/customer";
import { articleRoutes } from "@/services/article";
import { voucherRoutes } from "@/services/voucher";
export const securedProc = os
  .$context<{ headers: Headers; session?: Session | null }>()
  .handler(async ({ context }) => {
    const session = context.session ?? (await auth.api.getSession({ headers: context.headers }));

    if (!session?.user) throw new ORPCError("UNAUTHORIZED");

    return { ok: true, user: session.user };
  });

export const publicProc = os.handler(async () => {
  return { ok: true };
});

export const router = {
  productRoutes: orpc.tag("product").router(productRoutes),
  categoryRoutes: orpc.tag("category").router(categoryRoutes),
  brandRoutes: orpc.tag("brand").router(brandRoutes),
  userRoutes: orpc.tag("user").router(userRoutes),
  cartRoutes: orpc.tag("cart").router(cartRoutes),
  orderRoutes: orpc.tag("order").router(orderRoutes),
  productAdminRoutes: orpc.tag("productAdmin").router(productAdminRoutes),
  fileRoutes: orpc.tag("file").router(fileRoutes),
  authRoutes: orpc.tag("auth").router(authRoutes),
  addressRoutes: orpc.tag("address").router(addressRoutes),
  analyticsRoutes: orpc.tag("analytics").router(analyticsRoutes),
  customerRoutes: orpc.tag("customer").router(customerRoutes),
  articleRoutes: orpc.tag("article").router(articleRoutes),
  voucherRoutes: orpc.tag("voucher").router(voucherRoutes),
};
