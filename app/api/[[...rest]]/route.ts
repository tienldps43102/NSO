import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { onError } from '@orpc/server'

import { router } from '@/lib/orpc.router'
import { auth } from '@/lib/auth'

const handler = new OpenAPIHandler(router, {
  plugins: [
    new OpenAPIReferencePlugin({
      docsProvider: 'swagger',          // 'scalar' là default
      docsPath: '/docs',                // mặc định là '/'
      specPath: '/openapi.json',        // mặc định là '/spec.json'
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: { title: 'Nhà sách api', version: '1.0.0' },
        servers: [{ url: 'http://localhost:3000/api' }], // optional
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },

    }),
  ],
  interceptors: [
    onError((err) => console.error(err)),
  ],
})

async function handleRequest(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {
      headers: request.headers,
      session,
    },
  })

  return response ?? new Response("Not found", { status: 404 })
}
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
export const HEAD = handleRequest
