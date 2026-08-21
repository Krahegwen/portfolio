import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

/**
 * Servidor estático de usar y tirar para la salida del build.
 *
 * `nuxt preview` con el preset de Vercel delega en la CLI de Vercel, que no
 * tiene por qué estar instalada; y `file://` no vale porque el HTML
 * prerenderizado pide `/_nuxt/...` en absoluto. Treinta líneas de node:http
 * resuelven las dos cosas y no añaden ninguna dependencia.
 */

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
}

export function serveStatic(rootDir, port) {
  const server = createServer((req, res) => {
    // `normalize` sobre una ruta con `..` la resuelve; el prefijo se comprueba
    // después para que un `/../..` no salga del directorio servido.
    const url = new URL(req.url ?? '/', 'http://localhost')
    let path = normalize(join(rootDir, decodeURIComponent(url.pathname)))

    if (!path.startsWith(normalize(rootDir))) {
      res.writeHead(403).end('Forbidden')
      return
    }

    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html')
    if (!existsSync(path) && existsSync(`${path}.html`)) path = `${path}.html`

    if (!existsSync(path)) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found')
      return
    }

    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
    createReadStream(path).pipe(res)
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => resolve(server))
  })
}
