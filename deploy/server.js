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

const buildDir = fs.existsSync(path.join(appDir, '.next')) ? appDir : deployDir

;[path.join(appDir, '.next'), path.join(deployDir, '.next')].forEach(target => {
  if (!fs.existsSync(target)) return
  const link = path.join(appDir, '_next')
  try {
    const s = fs.lstatSync(link)
    if (s.isSymbolicLink() && fs.readlinkSync(link) === target) return
    if (s.isDirectory() || s.isFile()) return
  } catch {}
  try { fs.symlinkSync(target, link) } catch (e) { console.warn('symlink:', e.message) }
})

const app = next({ dev: false, dir: buildDir })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  http.createServer((req, res) => {
    if (req.url === '/_test') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, buildDir }))
    }
    handle(req, res)
  }).listen(port, host, () => console.log(`> Ready http://${host}:${port} (buildDir: ${buildDir})`))
}).catch(err => { console.error(err); process.exit(1) })
