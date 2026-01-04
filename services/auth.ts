import { os } from "@orpc/server";
import z from "zod";
import { auth } from "@/lib/auth";

const login = os
  .route({
    method: "POST",
    path: "/users/login",
  })
  .input(z.object({ email: z.string(), password: z.string() }))
  .handler(async ({ input }) => {
    console.log(input);
    const user = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
      },
    });
    return user;
  });

export const authRoutes = {
  login,
};
