import { z } from "zod";

export const createFromSchema = z.object({
    title: z.string().min(1, { message: "Tên sản phẩm là bắt buộc" }),
    description: z.string().optional(),
    isbn10: z.string().optional(),
    isbn13: z.string().optional(),
    publisherId: z.string().min(1, { message: "Nhà xuất bản là bắt buộc" }),
    publicationDate: z.string().optional(),
    pageCount: z.number().optional(),
    displayPrice: z.number().min(1, { message: "Giá gốc là bắt buộc" }),
    thumbnailUrl: z.string().min(1, { message: "Ảnh là bắt buộc" }),
    seriesId: z.string().optional(),
    categoryId: z.string().min(1, { message: "Danh mục là bắt buộc" }),
    authors: z.array(z.string()).min(1, { message: "Tác giả là bắt buộc" }),
  });
  export type CreateFromSchema = z.infer<typeof createFromSchema>;

  