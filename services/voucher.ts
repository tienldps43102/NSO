import { prisma } from "@/lib/db";
import { orpcWithAdmin,orpcWithAuth } from "@/lib/orpc/base";
import z from "zod";
import { computeSkipTake, paginationInput } from "./shared";
import { Prisma } from "@/lib/generated/prisma/client";
import { nowVN } from "@/lib/day";

const getVouchers = orpcWithAdmin
  .route({
    method: "GET",
    path: "/vouchers",
  })
  .input(
    paginationInput.extend({
      q: z.string().trim().min(1).optional(),
      isActive: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, input }) => {
    const { skip, take } = computeSkipTake(input.page, input.limit);
    const where: Prisma.VoucherWhereInput = {
      ...(input.isActive ? { isActive: input.isActive } : {}),
      ...(input.q ? { code: { contains: input.q, mode: "insensitive" } } : {}),
    };
    const vouchers = await prisma.voucher.findMany({
      skip,
      take,
      where,
      select: {
        id: true,
        code: true,
        discount: true,
        description: true,
        type: true,
        validFrom: true,
        validTo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        maxUsage: true,
        usageCount: true,
      },
    });
    const total = await prisma.voucher.count({ where });
    return {
      items: vouchers,
      total,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  });

const createVoucher = orpcWithAdmin
  .route({
    method: "POST",
    path: "/vouchers",
  })
  .input(
    z.object({
      code: z.string().trim().min(1),
      discount: z.number().min(0),
      description: z.string().optional(),
      type: z.enum(["PERCENTAGE", "FIXED"]),
      validFrom: z.date(),
      validTo: z.date(),
      maxUsage: z.number().optional(),
      isActive: z.boolean().default(true),
    }),
  )
  .handler(async ({ input }) => {
    const voucher = await prisma.voucher.create({
      data: input,
    });
    return voucher;
  });

const updateVoucher = orpcWithAdmin
  .route({
    method: "PUT",
    path: "/vouchers/:id",
  })
  .input(
    z.object({
      id: z.string(),
      code: z.string().trim().min(1).optional(),
      discount: z.number().min(0).optional(),
      description: z.string().optional(),
      type: z.enum(["PERCENTAGE", "FIXED"]).optional(),
      validFrom: z.date().optional(),
      validTo: z.date().optional(),
      maxUsage: z.number().optional(),
      isActive: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const voucher = await prisma.voucher.update({ where: { id: input.id }, data: input });
    return voucher;
  });

const deleteVoucher = orpcWithAdmin
  .route({
    method: "DELETE",
    path: "/vouchers/:id",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const voucher = await prisma.voucher.delete({ where: { id: input.id } });
    return voucher;
  });
const toggleVoucher = orpcWithAdmin
  .route({
    method: "POST",
    path: "/vouchers/:id/toggle",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const voucher =  await prisma.voucher.findUnique({ where: { id: input.id } });
    if (!voucher) throw new Error("Voucher not found");
    const newVoucher = await prisma.voucher.update({ where: { id: input.id }, data: { isActive: !voucher.isActive } });
    return newVoucher;
  });
const checkCodeUniqueness = orpcWithAdmin
  .route({
    method: "POST",
    path: "/vouchers/check-code-uniqueness",
  })
  .input(z.object({ code: z.string() }))
  .handler(async ({ input }) => {
    const voucher = await prisma.voucher.findUnique({ where: { code: input.code } });
    return !voucher;
  });

  const checkUseVoucher = orpcWithAuth
  .route({
    method: "POST",
    path: "/vouchers/check-use-voucher",
  })
  .input(z.object({ code: z.string() }))
  .handler(async ({ input }) => {
    const voucher = await prisma.voucher.findUnique({ where: { code: input.code } });
    if (!voucher) return { success: false, message: "Không tìm thấy voucher" };
    if (!voucher.isActive) return { success: false, message: "Voucher không hoạt động" };
    if (voucher.validFrom && voucher.validFrom > nowVN().toDate()) return { success: false, message: "Voucher chưa bắt đầu" };
    if (voucher.validTo && voucher.validTo < nowVN().toDate()) return { success: false, message: "Voucher đã hết hạn" };
    if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage) return { success: false, message: "Voucher đã hết số lần sử dụng" };

    return { success: true, message: "Voucher hợp lệ", voucher };
  });

export const useVoucher = async (orderAmount: number,code?: string | null) => {
  if (!code) return { success: true, message: "Voucher hợp lệ", voucher: null, reducedAmount: 0 };
  const voucher = await prisma.voucher.findUnique({ where: { code } });
  if (!voucher) return { success: false, message: "Không tìm thấy voucher" };
  if (!voucher.isActive) return { success: false, message: "Voucher không hoạt động" };
  if (voucher.validFrom && voucher.validFrom > nowVN().toDate()) return { success: false, message: "Voucher chưa bắt đầu" };
  if (voucher.validTo && voucher.validTo < nowVN().toDate()) return { success: false, message: "Voucher đã hết hạn" };
  if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage) return { success: false, message: "Voucher đã hết số lần sử dụng" };
  await prisma.voucher.update({ where: { id: voucher.id }, data: { usageCount: voucher.usageCount + 1 } });
  if (voucher.type === "PERCENTAGE") {
    const reducedAmount = Math.floor(orderAmount * (voucher.discount / 100));
    return { success: true, message: "Voucher hợp lệ", voucher, reducedAmount: reducedAmount };
  }
  if (voucher.type === "FIXED") {
    const reducedAmount = voucher.discount;
    return { success: true, message: "Voucher hợp lệ", voucher, reducedAmount: reducedAmount };
  }
  return { success: true, message: "Voucher hợp lệ", voucher };
};
export const voucherAdminRoutes = {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  toggleVoucher,
  checkCodeUniqueness,
  checkUseVoucher,
};