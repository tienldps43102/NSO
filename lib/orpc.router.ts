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
    bookRoutes,
    categoryRoutes,
    seriesRoutes,
    authorRoutes,
    publisherRoutes,
    userRoutes,
    cartRoutes,
}
