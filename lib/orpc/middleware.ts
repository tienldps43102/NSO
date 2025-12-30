import { ORPCError, os } from "@orpc/server";
import { toPlain } from "../toPlain";
import { auth } from "../auth";
import { orpc } from "./base";

export const toPlainMiddleware = os.middleware(async ({ next, context }) => {
    // You can add superjson serialization/deserialization logic here if needed
    const result = await next({
        context,
    });
    return toPlain(result);
})
export const authMiddleware = orpc

.middleware(async ({ next, context }) => {
    const session =
      context.session ?? (await auth.api.getSession({ headers: context.headers }))

    if (!session?.user) throw new ORPCError("UNAUTHORIZED")

    return next({
      context: { ...context, session },
    });
  });