import { ORPCError, os } from "@orpc/server";
import { Session } from "../auth-client";
import { auth } from "../auth";

export const orpc = os
    .$context<{ headers: Headers; session?: Session | null }>()
export const authMiddleware = orpc

.middleware(async ({ next, context }) => {
    const session =
      context.session ?? (await auth.api.getSession({ headers: context.headers }))

    if (!session?.user) throw new ORPCError("UNAUTHORIZED")

    return next({
      context: { ...context, session },
    });
  });
export const orpcWithAuth = orpc.use(authMiddleware);