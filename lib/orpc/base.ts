import { os } from "@orpc/server";
import { Session } from "../auth-client";
import { authMiddleware } from "./middleware";

export const orpc = os
    .$context<{ headers: Headers; session?: Session | null }>()

export const orpcWithAuth = orpc.use(authMiddleware);