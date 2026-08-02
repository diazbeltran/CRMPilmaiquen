const path = require('path')
const fs = require('fs')
const http = require('http')

const deployDir = __dirname
const appDir = path.resolve(deployDir, '..')

process.env.NODE_ENV = 'production'
process.chdir(deployDir)

const currentPort = parseInt(process.env.PORT, 10) || 3000
const hostname = process.env.HOSTNAME || '0.0.0.0'

const nextBuildDir = fs.existsSync(path.join(appDir, '.next'))
  ? appDir
  : deployDir

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
}

function getMimeType(url) {
  const ext = path.extname(url.split('?')[0]).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function tryServeFile(res, filePath) {
  return new Promise((resolve) => {
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        resolve(false)
        return
      }
      res.writeHead(200, {
        'Content-Type': getMimeType(filePath),
        'Cache-Control': 'public, max-age=31536000, immutable',
      })
      fs.createReadStream(filePath).pipe(res)
      resolve(true)
    })
  })
}

async function serveStaticFile(req, res) {
  const urlPath = req.url.split('?')[0]
  const relativeFromNext = urlPath.replace(/^\/_next\//, '')

  const candidates = [
    path.join(nextBuildDir, '.next', relativeFromNext),
    path.join(appDir, 'public', urlPath),
    path.join(deployDir, 'public', urlPath),
  ]

  for (const filePath of candidates) {
    if (await tryServeFile(res, filePath)) return
  }

  res.writeHead(404)
  res.end('Not Found')
}

const next = require('next')
const app = next({ dev: false, dir: nextBuildDir })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/_server-test') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', dir: nextBuildDir, port: currentPort }))
      return
    }

    if (req.url && req.url.startsWith('/_next/')) {
      await serveStaticFile(req, res)
      return
    }

    handle(req, res)
  })

  let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10)
  if (Number.isNaN(keepAliveTimeout) || !Number.isFinite(keepAliveTimeout) || keepAliveTimeout < 0) {
    keepAliveTimeout = undefined
  }
  if (keepAliveTimeout !== undefined) {
    server.keepAliveTimeout = keepAliveTimeout
  }

  server.listen(currentPort, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err)
      process.exit(1)
    }
    console.log(`> CRM Pilmaiquen ready on http://${hostname}:${currentPort}`)
    console.log(`> Build dir: ${nextBuildDir}`)
  })
}).catch((err) => {
  console.error('app.prepare() failed:', err)
  process.exit(1)
})
