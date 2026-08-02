const fs = require('fs')
const path = require('path')

const src = '.next'
const dst = path.join('deploy', '.next')

if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true })
fs.cpSync(src, dst, { recursive: true })

for (const file of ['required-server-files.json', 'required-server-files.js']) {
  const fp = path.join(dst, file)
  let content = fs.readFileSync(fp, 'utf8')
  content = content.replace(/E:\\\\CRMPilmaiquen/g, '.')
  fs.writeFileSync(fp, content)
}

console.log('Deploy listo! Ahora: git add . && git commit && git push')
