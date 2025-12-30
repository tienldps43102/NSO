import { prisma } from "@/lib/db";
import { orpcWithAuth } from "@/lib/orpc/base";



const getMyProfile = orpcWithAuth
    .route({
        method: "GET",
        path: "/user/me",
    })
    .handler(async ({ context }) => {
        const userId = context.session.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
         
        });

        return user;
    }
    );

export const userRoutes = {
    getMyProfile,
};