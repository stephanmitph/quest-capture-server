import express from "express";
import { parse } from 'url'
import next from 'next'
import path from 'path'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  // Serve /data folder statically
  const dataPath = path.join(process.cwd(), "data");
  server.use("/data", express.static(dataPath));

  // Handle everything else with Next.js
  server.use((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  });

  server.listen(port)

  console.log(
    `> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV
    }`
  )
})