import { createServer } from 'node:http'
import { OpenAPIHandler } from '@orpc/openapi/node'
import { CORSPlugin } from '@orpc/server/plugins'
import { onError } from '@orpc/server'
import { router } from '@/lib/orpc.router'

const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
})

const server = createServer(async (req, res) => {
  const result = await handler.handle(req, res, {
    context: { headers: req.headers as any }
  })

  if (!result.matched) {
    res.statusCode = 404
    res.end('No procedure matched')
  }
})

server.listen(
  3000,
  '127.0.0.1',
  () => console.log('Listening on 127.0.0.1:3000')
)