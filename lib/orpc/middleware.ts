import { os } from "@orpc/server";
import { toPlain } from "../toPlain";

export const toPlainMiddleware = os.middleware(async ({ next, context }) => {
    // You can add superjson serialization/deserialization logic here if needed
    const result = await next({
        context,
    });
    return toPlain(result);
})
