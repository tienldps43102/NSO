import { prisma } from "@/lib/db";
import { orpc, orpcWithAdmin } from "@/lib/orpc/base";
import z from "zod";
import { computeSkipTake, paginationInput } from "./shared";
import { nowVN } from "@/lib/day";

const getLatestArticles = orpc
  .route({
    method: "GET",
    path: "/articles/latest",
  })
  .input( paginationInput)
  .handler(async ({ input }) => {
    const { skip, take } = computeSkipTake(input.page, input.limit);
    const articles = await prisma.article.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        createdAt: true,
      },
    });
    return articles;
  });

const getArticleById = orpcWithAdmin
  .route({
    method: "GET",
    path: "/articles/:id",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const article = await prisma.article.findUnique({ where: { id: input.id } });
    return article;
  });
// admin crud

const getAllArticles = orpcWithAdmin
  .route({
    method: "GET",
    path: "/articles",
  })
  .input(paginationInput.extend({
    q: z.string().trim().min(1).optional(),
    isActive: z.boolean().optional(),
  }))
  .handler(async ({ input }) => {
    const { skip, take } = computeSkipTake(input.page, input.limit);
    const articles = await prisma.article.findMany({
      where: {
        ...(input.isActive ? { isActive: input.isActive } : {}),
        ...(input.q ? { title: { contains: input.q, mode: "insensitive" } } : {}),
      },
      skip,
      take,
    });
    return articles;
  });


const createArticle = orpcWithAdmin
  .route({
    method: "POST",
    path: "/articles",
  })
  .input(z.object({ title: z.string(), content: z.string(), thumbnailUrl: z.string(), isActive: z.boolean().default(true) }))
  .handler(async ({ input }) => {
    const article = await prisma.article.create({ data: {
      title: input.title,
      content: input.content,
      thumbnailUrl: input.thumbnailUrl,
      isActive: input.isActive,
      createdAt: nowVN().toDate(),
    } });
    return article;
  });

const updateArticle = orpcWithAdmin
  .route({
    method: "PUT",
    path: "/articles/:id",
  })
  .input(z.object({ id: z.string(), title: z.string().optional(), content: z.string().optional(), thumbnailUrl: z.string().optional(), isActive: z.boolean().optional() }))
  .handler(async ({ input }) => {
    const article = await prisma.article.update({ where: { id: input.id }, data: input });
    return article;
  });

const deleteArticle = orpcWithAdmin
  .route({
    method: "DELETE",
    path: "/articles/:id",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await prisma.article.delete({ where: { id: input.id } });
    return { success: true };
  });

export const articleRoutes = {
  getLatestArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getAllArticles,
  getArticleById,
};
