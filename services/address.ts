import { prisma } from "@/lib/db";
import { orpcWithAuth } from "@/lib/orpc/base";
import z from "zod";
// model Address {
//   id        String @id @default(ulid()) @db.VarChar(36)
//   userId    String @map("user_id") @db.VarChar(36)
//   fullName  String @map("full_name") @db.VarChar(200)
//   phone     String @db.VarChar(20)
//   detail    String @db.VarChar(500)
//   province  String @db.VarChar(50)
//   ward      String @db.VarChar(50)

//   orders Order[]
//   @@index([userId], map: "idx_addresses_user")
//   @@map("addresses")
// }


const getMyAddress = orpcWithAuth
    .route({
        method: "GET",
        path: "/address/me",
    })
    .handler(async ({ context }) => {
        const userId = context.session.user.id;
        const addresses = await prisma.address.findMany({
            where: { userId },
        });

        return addresses
    }
    );


export const addAddress = orpcWithAuth
    .route({
        method: "POST",
        path: "/address",
    })
    .input(z.object({
        fullName: z.string().min(1).max(200),
        phone: z.string().min(1).max(20),
        detail: z.string().min(1).max(500),
        province: z.string().min(1).max(50),
        ward: z.string().min(1).max(50),
    }))
    .handler(async ({ input, context }) => {
        const userId = context.session.user.id;

        const newAddress = await prisma.address.create({
            data: {
                userId,
                fullName: input.fullName,
                phone: input.phone,
                detail: input.detail,
                province: input.province,
                ward: input.ward,
            },
        });

        return newAddress;
    }
    );
export const editAddress = orpcWithAuth
    .route({
        method: "PUT",
        path: "/address",
    })
    .input(z.object({
        id: z.string().min(1).max(36),
        fullName: z.string().min(1).max(200).optional(),
        phone: z.string().min(1).max(20).optional(),
        detail: z.string().min(1).max(500).optional(),
        province: z.string().min(1).max(50).optional(),
        ward: z.string().min(1).max(50).optional(),
    }))
    .handler(async ({ input, context }) => {
        const userId = context.session.user.id;

        const address = await prisma.address.findUnique({
            where: { id: input.id },
        });
        if (!address || address.userId !== userId) {
            throw new Error("Address not found or unauthorized");
        }
        const updatedAddress = await prisma.address.update({
            where: { id: input.id },
            data: {
                fullName: input.fullName ?? address.fullName,
                phone: input.phone ?? address.phone,
                detail: input.detail ?? address.detail,
                province: input.province ?? address.province,
                ward: input.ward ?? address.ward,
            },
        });

        return updatedAddress;
    }
    );


export const addressRoutes = {
    getMyAddress,
    addAddress,
    editAddress,
};