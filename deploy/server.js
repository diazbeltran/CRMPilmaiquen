const path = require('path')
const fs = require('fs')
const http = require('http')
const next = require('next')

const deployDir = __dirname
const appDir = path.resolve(deployDir, '..')

process.env.NODE_ENV = 'production'
process.chdir(deployDir)

const port = parseInt(process.env.PORT, 10) || 3000
const host = '0.0.0.0'

const nextDir = path.join(deployDir, '.next')
const linkDir = path.join(appDir, '_next')

// Apache en cPanel busca archivos en CRM/_next/static/...
// Pero .next esta en CRM/deploy/.next/
// Solucion: crear symlink CRM/_next -> CRM/deploy/.next
function setupStaticFiles() {
  if (!fs.existsSync(nextDir)) {
    console.error('ERROR: deploy/.next no existe. Ejecuta npm run build primero.')
    process.exit(1)
  }

  try {
    const stat = fs.lstatSync(linkDir)
    if (stat.isSymbolicLink()) {
      const target = fs.readlinkSync(linkDir)
      if (target === nextDir) return
      fs.unlinkSync(linkDir)
    } else {
      return
    }
  } catch {}

  try {
    fs.symlinkSync(nextDir, linkDir)
    console.log('> Symlink creado: _next -> deploy/.next')
  } catch (e) {
    console.warn('> No se pudo crear symlink, copiando archivos estaticos...')
    try {
      if (fs.existsSync(linkDir)) fs.rmSync(linkDir, { recursive: true })
      fs.cpSync(path.join(nextDir, 'static'), path.join(linkDir, 'static'), { recursive: true })
      console.log('> Archivos estaticos copiados a _next/static/')
    } catch (e2) {
      console.error('> ERROR copiando archivos:', e2.message)
    }
  }
}

setupStaticFiles()

const buildDir = fs.existsSync(path.join(appDir, '.next')) ? appDir : deployDir
const app = next({ dev: false, dir: buildDir })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  http.createServer((req, res) => {
    if (req.url === '/_test') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true }))
    }
    handle(req, res)
  }).listen(port, host, () => {
    console.log(`> Listo en http://${host}:${port}`)
  })
}).catch(err => {
  console.error('Error al iniciar:', err)
  process.exit(1)
})
