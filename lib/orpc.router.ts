import * as z from 'zod';
import { os, ORPCError } from "@orpc/server";
import { Session } from './auth-client';
import { auth } from './auth';
import { bookRoutes } from '@/services/book';


export const securedProc = os
  .$context<{ headers: Headers; session?: Session | null }>()
  .handler(async ({ context }) => {
    const session =
      context.session ?? (await auth.api.getSession({ headers: context.headers }))

    if (!session?.user) throw new ORPCError("UNAUTHORIZED")

    return { ok: true, user: session.user }
  })


export const publicProc = os.handler(async () => {
    return { ok: true };
});

const PlanetSchema = z.object({
    id: z.number().int().min(1),
    name: z.string(),
    description: z.string().optional(),
})

export const listPlanet = os
    .input(
        z.object({
            limit: z.number().int().min(1).max(100).optional(),
            cursor: z.number().int().min(0).default(0),
        }),
    )
    .handler(async ({ input }) => {
        // your list code here
        return [{ id: 1, name: 'name' }]
    })



export const router = {
    bookRoutes,
}
