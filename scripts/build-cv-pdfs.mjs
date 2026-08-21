import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { runChrome, waitForServer } from './chrome.mjs'
import { serveStatic } from './serve-static.mjs'

/**
 * Los seis PDF del CV: tres variantes × dos idiomas.
 *
 * La fuente es la propia web —las rutas `/print/cv/:variante`—, no un documento
 * aparte. Ese es el punto de todo el montaje: cambiar una fecha en
 * `content/profile.ts` cambia la web y los seis PDF a la vez, que es justo lo
 * que no pasaba con los seis .docx sueltos de la carpeta CV.
 *
 *   pnpm build && pnpm cv:pdf
 *
 * Salen a `public/cv/` (los sirve la web) y se copian a `CV/2026/` (la carpeta
 * de trabajo, junto a los originales de 2022-2023).
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const PORT = Number(process.env.PDF_PORT ?? 4173)
const BASE = `http://127.0.0.1:${PORT}`

const VARIANTS = [
  { id: 'recruiter', suffix: '' },
  { id: 'anon', suffix: '-Anon' },
  { id: 'accenture', suffix: '-Accenture' },
]

const LOCALES = [
  { id: 'es', path: '/print/cv', tag: 'ES' },
  { id: 'en', path: '/print/en/cv', tag: 'EN' },
]

const outDirs = [join(root, 'public/cv'), join(root, 'CV/2026')]
outDirs.forEach(dir => mkdirSync(dir, { recursive: true }))

const STATIC = join(root, '.vercel/output/static')

if (!existsSync(join(STATIC, 'index.html'))) {
  throw new Error('No hay build. Ejecuta `pnpm build` antes que esto.')
}

const server = await serveStatic(STATIC, PORT)

try {
  if (!await waitForServer(`${BASE}/`)) {
    throw new Error(`El servidor de preview no respondió en ${BASE}`)
  }

  for (const locale of LOCALES) {
    for (const variant of VARIANTS) {
      const name = `Diego-Portilla-CV${variant.suffix}-${locale.tag}.pdf`
      const target = join(root, 'public/cv', name)

      await runChrome([
        '--no-pdf-header-footer',
        // Sin margen aquí: los márgenes de página los pone `@page` en la hoja,
        // y declararlos en dos sitios los suma.
        `--print-to-pdf=${target}`,
        '--virtual-time-budget=9000',
        `${BASE}${locale.path}/${variant.id}`,
      ])

      if (!existsSync(target)) throw new Error(`Chrome no escribió ${name}`)
      copyFileSync(target, join(root, 'CV/2026', name))

      const kb = (statSync(target).size / 1024).toFixed(0)
      console.log(`✓ ${name}  (${kb} KB)`)
    }
  }

  console.log(`\n${readdirSync(join(root, 'public/cv')).length} PDF en public/cv/ y en CV/2026/`)
}
finally {
  server.close()
}
