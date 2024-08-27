import { Hono } from 'hono'
import { env } from 'hono/adapter'
import type { AppLoadContext } from '@remix-run/node'
import { createRequestHandler } from '@remix-run/node'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import * as build from './build'

// @ts-ignore
const handleRemixRequest = createRequestHandler(build, process.env.NODE_ENV)

const app = new Hono()

app.get('*', async (c) => {
  const loadContext: AppLoadContext = { env: env(c) }
  return await handleRemixRequest(c.req.raw, loadContext)
})

const nodeApp = new Hono()

if (process.env.NODE_ENV !== 'production') {
  nodeApp.use('*', logger())
}

nodeApp.get(
  '/build/*',
  serveStatic({
    root: './public',
  })
)

nodeApp.route('/', app)

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

serve(
  {
    fetch: nodeApp.fetch,
    port,
  },
  (info) => {
    console.log(`Running on ${info.address}:${info.port}`)
  }
)
