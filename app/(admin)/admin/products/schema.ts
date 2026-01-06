import { z } from "zod";

export const createFromSchema = z.object({
  title: z.string().min(1, { message: "Tên sản phẩm là bắt buộc" }),
  description: z.string().optional(),
  brandId: z.string().min(1, { message: "Hãng là bắt buộc" }),
  displayPrice: z.number().min(1, { message: "Giá gốc là bắt buộc" }),
  thumbnailUrl: z.string().min(1, { message: "Ảnh là bắt buộc" }),
  categoryId: z.string().min(1, { message: "Danh mục là bắt buộc" }),
});
export type CreateFromSchema = z.infer<typeof createFromSchema>;
