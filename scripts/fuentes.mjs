/**
 * Descarga las fuentes de Google y genera el @font-face local.
 *
 * Se queda solo con los subconjuntos latin y latin-ext: el cirílico, el griego y
 * el vietnamita son 14 ficheros que esta web no va a pintar nunca, y cada uno
 * cuenta para el peso del repo aunque el navegador no lo pida.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CSS = readFileSync(process.argv[2], 'utf8')
const OUT = process.argv[3]
mkdirSync(OUT, { recursive: true })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const QUEREMOS = new Set(['latin', 'latin-ext'])

// Cada bloque va precedido por un comentario con el nombre del subconjunto.
const bloques = CSS.split('/* ').slice(1)
const reglas = []
const descargas = []

for (const bloque of bloques) {
  const subset = bloque.slice(0, bloque.indexOf(' */'))
  if (!QUEREMOS.has(subset)) continue

  const cuerpo = bloque.slice(bloque.indexOf('*/') + 2)
  const familia = /font-family: '([^']+)'/.exec(cuerpo)?.[1]
  const peso = /font-weight: (\d+)/.exec(cuerpo)?.[1] ?? '400'
  const estilo = /font-style: (\w+)/.exec(cuerpo)?.[1] ?? 'normal'
  const url = /src: url\(([^)]+)\)/.exec(cuerpo)?.[1]
  const unicode = /unicode-range: ([^;]+);/.exec(cuerpo)?.[1]
  if (!familia || !url) continue

  const slug = familia.toLowerCase().replace(/\s+/g, '-')
  const fichero = `${slug}-${peso}${estilo === 'italic' ? 'i' : ''}-${subset}.woff2`

  descargas.push({ url, fichero })
  reglas.push(`@font-face {
  font-family: '${familia}';
  font-style: ${estilo};
  font-weight: ${peso};
  font-display: swap;
  src: url('/fonts/${fichero}') format('woff2');
  unicode-range: ${unicode};
}`)
}

for (const { url, fichero } of descargas) {
  const res = await fetch(url, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  writeFileSync(join(OUT, fichero), Buffer.from(await res.arrayBuffer()))
}

const cabecera = `/*
 * Fuentes autoalojadas.
 *
 * Antes se cargaban desde fonts.googleapis.com, lo que enviaba la IP de cada
 * visitante a Google —una transferencia a un tercer país que habría que
 * declarar y para la que no hay base legal cómoda en una web europea— y añadía
 * dos handshakes a un dominio ajeno en la ruta crítica del primer pintado.
 *
 * Generado por scripts/fuentes.mjs. No editar a mano.
 */

`

writeFileSync(join(OUT, '..', '..', 'app/assets/css/fonts.css'), cabecera + reglas.join('\n\n') + '\n')
console.log(`${descargas.length} ficheros en public/fonts/, ${reglas.length} reglas @font-face`)
