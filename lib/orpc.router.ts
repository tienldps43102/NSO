import { os, ORPCError } from "@orpc/server";
import { Session } from './auth-client';
import { auth } from './auth';
import { bookRoutes } from '@/services/book';
import { categoryRoutes } from '@/services/category';
import { seriesRoutes } from '@/services/series';
import { authorRoutes } from '@/services/author';
import { publisherRoutes } from '@/services/publisher';
import { userRoutes } from "@/services/user";
import { cartRoutes } from "@/services/cart";
import { orderRoutes } from "@/services/order";
import { bookAdminRoutes } from "@/services/book.admin";
import { orpc } from "./orpc/base";
import { fileRoutes } from "@/services/file";
import { authRoutes } from "@/services/auth";


export const securedProc = os
  .$context<{ headers: Headers; session?: Session | null }>()
  .handler(async ({ context }) => {
    const session =
      context.session ?? (await auth.api.getSession({ headers: context.headers }))

    if (!session?.user) throw new ORPCError("UNAUTHORIZED")

    return { ok: true, user: session.user }
  })
  


export const publicProc = os.handler(async () => {
    return { ok: true };
});



export const router = {
     bookRoutes :orpc.tag("book").router(bookRoutes),
    categoryRoutes :orpc.tag("category").router(categoryRoutes),
    seriesRoutes :orpc.tag("series").router(seriesRoutes),
    authorRoutes :orpc.tag("author").router(authorRoutes),
    publisherRoutes :orpc.tag("publisher").router(publisherRoutes),
    userRoutes :orpc.tag("user").router(userRoutes),
    cartRoutes :orpc.tag("cart").router(cartRoutes),
    orderRoutes :orpc.tag("order").router(orderRoutes),
    bookAdminRoutes :orpc.tag("bookAdmin").router(bookAdminRoutes),
    fileRoutes :orpc.tag("file").router(fileRoutes),
    authRoutes :orpc.tag("auth").router(authRoutes),
}
