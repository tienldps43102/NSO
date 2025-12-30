import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { nextCookies } from "better-auth/next-js";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [ nextCookies(), bearer()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "USER",

      }
    }
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification:false,
    
  },
});

async function initAdminUser() {
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@admin.com" } });
  if (!adminUser) {
    await auth.api.signUpEmail({
      body:{
        email: "admin@admin.com",
        name : "Admin",
        password: "Admin@123",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    await prisma.user.update({
      where: { email: "admin@admin.com" },
      data: {
        role: "ADMIN",
      },
    });
  }
 
}

initAdminUser();