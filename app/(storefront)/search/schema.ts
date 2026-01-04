import { z } from "zod";

const strArray = z.preprocess((v) => {
  if (v == null) return undefined;
  return Array.isArray(v) ? v : [v]; // string -> [string]
}, z.array(z.string()).optional());

const boolQuery = z.preprocess((v) => {
  if (v == null) return undefined;
  if (typeof v === "boolean") return v;
  if (Array.isArray(v)) v = v[0];

  const s = String(v).toLowerCase().trim();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return v; // để zod fail -> catch/default xử lý
}, z.boolean());

export const searchSchema = z
  .object({
    q: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),

    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),

    sort: z
      .enum(["newest", "price_asc", "price_desc", "title_asc", "title_desc"])
      .default("newest")
      .catch("newest"),

    inStockOnly: boolQuery.default(true).catch(true),

    categoryIds: strArray,
    publisherIds: strArray,
    authorIds: strArray,
    seriesIds: strArray,

    minPrice: z.coerce.number().nonnegative().optional().catch(undefined),
    maxPrice: z.coerce.number().nonnegative().optional().catch(undefined),
  })
  .refine(
    (v) => {
      if (v.minPrice == null || v.maxPrice == null) return true;
      return v.minPrice <= v.maxPrice;
    },
    {
      message: "minPrice must be <= maxPrice",
      path: ["maxPrice"],
    },
  );

export type SearchSchema = z.infer<typeof searchSchema>;
