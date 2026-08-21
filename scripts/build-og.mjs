import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { runChrome } from './chrome.mjs'

/**
 * Genera las tarjetas sociales (`public/og.png` y `public/og-en.png`).
 *
 * Los años los inyecta este script desde `content/profile.ts`, no la plantilla:
 * si el número viviera en el HTML, la tarjeta sería el único sitio de la web
 * donde "9 años" envejece sin que nadie se entere.
 *
 *   node scripts/build-og.mjs
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

// Se lee el fichero de contenido en crudo: importar TypeScript desde un script
// suelto obligaría a arrastrar un transpilador para tres constantes.
const profile = readFileSync(join(root, 'content/profile.ts'), 'utf8')

function constant(name) {
  const match = profile.match(new RegExp(`${name}:\\s*'([^']+)'`))
  if (!match) throw new Error(`No encuentro ${name} en content/profile.ts`)
  return match[1]
}

function yearsSince(start) {
  const [year, month] = start.split('-').map(Number)
  const now = new Date()
  return Math.floor(((now.getFullYear() - year) * 12 + (now.getMonth() - (month - 1))) / 12)
}

const years = {
  career: yearsSince(constant('careerStart')),
  vue: yearsSince(constant('vueStart')),
  xr: yearsSince(constant('xrStart')),
}

const LOCALES = [
  {
    file: 'og.png',
    role: 'Desarrollador Front-End Senior',
    lede: 'Interfaces que aguantan producción y experiencias 3D en el navegador.',
    facts: [
      [years.career, 'años de profesión'],
      [years.vue, 'con Vue'],
      [years.xr, 'en 3D y WebXR'],
    ],
  },
  {
    file: 'og-en.png',
    role: 'Senior Front-End Developer',
    lede: 'Interfaces that hold up in production, and 3D experiences in the browser.',
    facts: [
      [years.career, 'years in the trade'],
      [years.vue, 'with Vue'],
      [years.xr, 'in 3D and WebXR'],
    ],
  },
]

const template = readFileSync(join(here, 'og-template.html'), 'utf8')

for (const locale of LOCALES) {
  const facts = locale.facts
    .map(([value, label]) => `<span><b>${value}</b>${label}</span>`)
    .join('')

  const html = template
    .replace(/(<p class="role" data-slot="role">)[^<]*/, `$1${locale.role}`)
    .replace(/(<p class="lede" data-slot="lede">)[^<]*/, `$1${locale.lede}`)
    .replace('<div class="facts" data-slot="facts"></div>', `<div class="facts">${facts}</div>`)

  const scratch = join(here, `.og-${locale.file}.html`)
  writeFileSync(scratch, html)

  await runChrome([
    '--window-size=1200,630',
    // 1200×630 nativo: es el tamaño que piden las plataformas y a 2x el PNG
    // se iba a 3 MB, que algunos scrapers ni descargan.
    '--force-device-scale-factor=1',
    // Las fuentes de Google y la textura tardan; sin margen sale una tarjeta
    // con la tipografía de reserva y sin fondo.
    '--virtual-time-budget=9000',
    `--screenshot=${join(root, 'public', locale.file)}`,
    scratch,
  ])

  writeFileSync(scratch, '')
  const { unlinkSync } = await import('node:fs')
  unlinkSync(scratch)

  console.log(`✓ public/${locale.file}`)
}
