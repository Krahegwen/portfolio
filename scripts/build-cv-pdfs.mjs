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
 * El público sale a `public/cv/`, que sirve Cloudflare como activo estático. Los
 * otros dos a `server/assets/cv/`, **fuera de `public/`**: ahí dentro los
 * serviría el servidor de activos sin pasar por el Worker y no habría dónde
 * pedirles la cookie del pase. Desde `server/assets/` viajan empaquetados dentro
 * del Worker y solo salen por `/cv/privado/:archivo`.
 *
 * Los seis se copian además a `CV/2026/`, la carpeta de trabajo, junto a los
 * originales de 2022-2023.
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const PORT = Number(process.env.PDF_PORT ?? 4173)
const BASE = `http://127.0.0.1:${PORT}`

const VARIANTS = [
  { id: 'recruiter', suffix: '', dir: 'public/cv' },
  { id: 'anon', suffix: '-Anon', dir: 'server/assets/cv' },
  { id: 'accenture', suffix: '-Accenture', dir: 'server/assets/cv' },
]

/**
 * `expect` no es decoración. El idioma lo deduce `useLocale` del prefijo de la
 * ruta, así que una hoja colgada del sitio equivocado del árbol se genera
 * perfectamente y en el idioma que no es — pasó con `/print/en/cv`, y seis PDF
 * marcados EN salieron en español sin que nada fallara. Comprobar una palabra
 * del encabezado antes de imprimir cuesta una petición y cierra ese agujero.
 */
const LOCALES = [
  { id: 'es', path: '/print/cv', tag: 'ES', expect: '>Perfil<', reject: '>Profile<' },
  { id: 'en', path: '/en/print/cv', tag: 'EN', expect: '>Profile<', reject: '>Perfil<' },
]

const outDirs = [join(root, 'public/cv'), join(root, 'server/assets/cv'), join(root, 'CV/2026')]
outDirs.forEach(dir => mkdirSync(dir, { recursive: true }))

const STATIC = join(root, '.output/public')

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
      const target = join(root, variant.dir, name)
      const source = `${BASE}${locale.path}/${variant.id}`

      const html = await (await fetch(source)).text()
      if (!html.includes(locale.expect) || html.includes(locale.reject)) {
        throw new Error(
          `${source} no está en ${locale.tag}. El idioma sale del prefijo de la `
          + `ruta: comprueba que la página cuelga del árbol correcto.`,
        )
      }

      await runChrome([
        '--no-pdf-header-footer',
        // Sin margen aquí: los márgenes de página los pone `@page` en la hoja,
        // y declararlos en dos sitios los suma.
        `--print-to-pdf=${target}`,
        '--virtual-time-budget=9000',
        source,
      ])

      if (!existsSync(target)) throw new Error(`Chrome no escribió ${name}`)
      copyFileSync(target, join(root, 'CV/2026', name))

      const kb = (statSync(target).size / 1024).toFixed(0)
      console.log(`✓ ${name}  (${kb} KB)`)
    }
  }

  const publicos = readdirSync(join(root, 'public/cv')).length
  const privados = readdirSync(join(root, 'server/assets/cv')).length
  console.log(`\n${publicos} PDF en public/cv/, ${privados} en server/assets/cv/, y los ${publicos + privados} en CV/2026/`)
}
finally {
  server.close()
}
