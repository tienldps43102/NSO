import { prisma } from "@/lib/db";
import z from "zod";
import { orpcWithAuth } from "@/lib/orpc/base";
import { computeSkipTake, paginationInput } from "./shared";
import { Prisma } from "@/lib/generated/prisma/browser";
const getCustomers = orpcWithAuth
  .route({
    method: "GET",
    path: "/customers",
  })
  .input(
    paginationInput.extend({
      q: z.string().trim().min(1).optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { skip, take } = computeSkipTake(input.page, input.limit);
    const where: Prisma.UserWhereInput = {
      ...(input.status ? { status: input.status } : {}),
      ...(input.q ? { OR: [{ name: { contains: input.q, mode: "insensitive" } }, { email: { contains: input.q, mode: "insensitive" } }] } : {}),
      role: "CUSTOMER",
    };
    const customers = await prisma.user.findMany({
      skip,
      take,
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        image: true, // optional
      },
    });
    return customers;
  });

  const toggleCustomerStatus = orpcWithAuth
    .route({
      method: "POST",
      path: "/customers/:id/toggle-status",
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const customer = await prisma.user.findUnique({ where: { id: input.id } });
      if (!customer) throw new Error("Customer not found");
      const newCustomer = await prisma.user.update({ where: { id: input.id }, data: { status: customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } });
      return newCustomer;
    });
export const customerRoutes = {
  getCustomers,
  toggleCustomerStatus,
};
