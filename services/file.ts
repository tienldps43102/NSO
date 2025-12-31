
import z from "zod";
import { orpcWithAuth } from "@/lib/orpc/base";
import { put } from '@vercel/blob';

const uploadFile = orpcWithAuth
    .route({
        method: "POST",
    })
    .input(z.file())
    .handler(async ({ input, context }) => {
        const fileName =`${context.session.user.id}/${input.name}`;
         const blob = await put(fileName, input, {
            access: 'public',
            contentType: input.type,
            allowOverwrite: true,
        });
        return {
            url: blob.url,
        };
    }
    );
export const fileRoutes = {
    uploadFile,
};