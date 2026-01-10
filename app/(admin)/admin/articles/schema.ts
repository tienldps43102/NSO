import z from "zod";

export const articleFormSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống"),
  content: z.string().trim().min(1, "Nội dung không được để trống"),
  thumbnailUrl: z.string().trim().min(1, "URL hình ảnh không được để trống"),
  isActive: z.boolean().default(true),
});

export type ArticleFormSchema = z.infer<typeof articleFormSchema>;
