import z from "zod";
import { orpcWithAuth } from "@/lib/orpc/base";
import { del, put } from "@vercel/blob";

const uploadFile = orpcWithAuth
  .route({
    method: "POST",
    path: "/files",
  })
  .input(z.file())
  .handler(async ({ input, context }) => {
    const fileName = `${context.session.user.id}/${input.name}`;
    const blob = await put(fileName, input, {
      access: "public",
      contentType: input.type,
      allowOverwrite: true,
    });
    return {
      url: blob.url,
    };
  });
export const deleteFile = orpcWithAuth
  .route({
    method: "DELETE",
    path: "/files",
  })
  .input(
    z.object({
      url: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    if (!input.url) {
      return {
        message: "URL is required",
      };
    }
    await del(input.url);
    return {
      message: "File deleted successfully",
    };
  });

export const fileRoutes = {
  uploadFile,
  deleteFile,
};
