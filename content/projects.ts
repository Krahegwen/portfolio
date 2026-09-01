/**
 * Proyectos propios. Solo lo que está en mi git y no es un fork.
 *
 * `visibility: 'private'` significa que el repo no es público: se enseña el
 * proyecto y su demo, pero no hay enlace al código. Los forks que tengo por
 * tener (Babylon.js, cleave.js, frequi, mpc-autofill…) no salen aquí a
 * propósito: no son míos.
 *
 * El orden del array es el orden de escaparate: la portada pinta los `featured`
 * tal cual vienen aquí, y `/proyectos` los pone delante conservando este mismo
 * orden. Los cuatro primeros están elegidos y ordenados a mano.
 */

import type { I18nText } from './profile'

export interface Metric { label: I18nText, value: string }

export interface Project {
  slug: string
  name: string
  year: string
  /** `live` sirve tráfico ahora; `active` se desarrolla; `archived` es historia. */
  status: 'live' | 'active' | 'archived'
  visibility: 'public' | 'private'
  featured: boolean
  tagline: I18nText
  summary: I18nText
  body: I18nText[]
  stack: string[]
  metrics?: Metric[]
  repo?: string
  demo?: string
  /** Tono de acento de la ficha, en grados de matiz. */
  hue: number
}

export const projects: Project[] = [
  {
    slug: 'coffee-data',
    name: 'Registro de café',
    year: '2026',
    status: 'live',
    visibility: 'public',
    featured: true,
    hue: 40,
    tagline: {
      es: 'Bitácora de extracciones V60 sobre Cloudflare Workers y D1',
      en: 'A V60 brew log on Cloudflare Workers and D1',
    },
    summary: {
      es: 'Método 4:6 de Tetsu Kasuya, una variable por extracción. App y API en el mismo Worker, datos en D1, fotos en R2 y sesión por cookie HttpOnly.',
      en: 'Tetsu Kasuya’s 4:6 method, one variable per brew. App and API on the same Worker, data in D1, photos in R2, session on an HttpOnly cookie.',
    },
    body: [
      {
        es: 'La regla del experimento es cambiar una sola variable entre extracciones y ver qué pasa; el software solo existe para que esa regla se pueda cumplir. El servidor calcula lo que puede calcular —el reparto escalado a partir de la receta y el agua real, el ratio, los días de tueste— y el cliente no manda nada de eso: si lo mandara, dos bitácoras acabarían discrepando.',
        en: 'The rule of the experiment is to change exactly one variable between brews and watch what happens; the software exists only so that rule can be kept. The server computes what it can compute — the pour schedule scaled from recipe and actual water, the ratio, the days off roast — and the client sends none of it: if it did, two logs would eventually disagree.',
      },
      {
        es: 'Que la app y la API compartan origen no es cosmético: elimina CORS de raíz y es lo que permitió sacar el token de `localStorage` y meterlo en una cookie `HttpOnly`, `SameSite=Strict`. El JavaScript ya no puede leerla, así que un XSS no se lleva el token, y otro sitio no puede provocar una escritura desde tu navegador. Sin secreto configurado, el Worker falla cerrado: no autoriza a nadie.',
        en: 'App and API sharing an origin is not cosmetic: it removes CORS at the root, and it is what allowed moving the token out of `localStorage` and into an `HttpOnly`, `SameSite=Strict` cookie. JavaScript can no longer read it, so an XSS does not walk off with the token, and another site cannot trigger a write from your browser. With no secret configured the Worker fails closed: it authorises nobody.',
      },
    ],
    stack: ['Cloudflare Workers', 'D1', 'R2', 'Vue', 'Python', 'Wrangler'],
    metrics: [
      { label: { es: 'commits', en: 'commits' }, value: '160+' },
      { label: { es: 'endpoints', en: 'endpoints' }, value: '17' },
      { label: { es: 'origen', en: 'origins' }, value: '1' },
    ],
    repo: 'https://github.com/Krahegwen/coffee-data',
    demo: 'https://brew.krahegwen.com',
  },
  {
    slug: 'photo-editor',
    name: 'photo-editor',
    year: '2026',
    status: 'active',
    visibility: 'public',
    featured: true,
    hue: 320,
    tagline: {
      es: 'Editor RAW local: motor FastAPI, interfaz Vue y servidor MCP',
      en: 'A local RAW editor: FastAPI engine, Vue interface, MCP server',
    },
    summary: {
      es: 'Sustituye a Lightroom en mi flujo real: cribar, puntuar y revelar los ARW de la cámara sin tocar jamás el original. El mismo motor lo operan por igual la interfaz y un agente de IA por MCP.',
      en: 'Replaces Lightroom in my actual workflow: culling, rating and developing the camera’s ARW files without ever touching the original. The same engine is driven equally by the interface and by an AI agent over MCP.',
    },
    body: [
      {
        es: 'La regla que ordena todo el diseño es que la verdad vive en el disco: el RAW no se modifica jamás, el rating va en sidecars XMP que Lightroom entiende y una edición es una receta JSON junto a la foto. SQLite es solo un índice que un escaneo reconstruye, y la caché de previews vive fuera del archivo fotográfico, porque esa carpeta se sincroniza con la nube y nada generado debe viajar con ella. Se puede borrar la base de datos entera sin perder ni una estrella.',
        en: 'The rule that shapes the whole design is that truth lives on disk: the RAW is never modified, ratings go in XMP sidecars Lightroom understands, and an edit is a JSON recipe sitting next to the photo. SQLite is just an index a scan can rebuild, and the preview cache lives outside the photo archive, because that folder syncs to the cloud and nothing generated should travel with it. You can delete the entire database without losing a single star.',
      },
      {
        es: 'Hay un solo motor y dos manos que lo manejan: la interfaz Vue y un servidor MCP exponen las mismas operaciones, así que Claude puede cribar una sesión, puntuarla o exportarla igual que yo desde la pantalla. Construir para un agente obligó a que la API fuera honesta —todo lo que hace la interfaz existe como endpoint— y a fijar el reparto de confianza: los trabajos largos pasan por una cola secuencial compartida y todo borrado es un ensayo salvo confirmación explícita.',
        en: 'There is one engine and two hands on it: the Vue interface and an MCP server expose the same operations, so Claude can cull a shoot, rate it or export it just as I do from the screen. Building for an agent forced the API to be honest — everything the interface does exists as an endpoint — and forced the trust boundaries: long jobs go through a shared sequential queue, and every deletion is a dry run unless explicitly confirmed.',
      },
    ],
    stack: ['Python', 'FastAPI', 'rawpy', 'SQLite', 'Vue 3', 'Vite', 'MCP'],
    metrics: [
      { label: { es: 'tools MCP', en: 'MCP tools' }, value: '15' },
      { label: { es: 'endpoints', en: 'endpoints' }, value: '19' },
      { label: { es: 'RAW modificados', en: 'RAWs modified' }, value: '0' },
    ],
    repo: 'https://github.com/Krahegwen/photo-editor',
  },
  {
    slug: 'crono-and-co',
    name: 'Crono&Co',
    year: '2026',
    status: 'active',
    visibility: 'private',
    featured: true,
    hue: 28,
    tagline: {
      es: 'Tienda de relojes con Nuxt 4 y Medusa, de la migración al despliegue',
      en: 'A watch store on Nuxt 4 and Medusa, from migration to deploy',
    },
    summary: {
      es: 'Un e-commerce completo: escaparate en Nuxt 4 con SSR sobre Vercel y un backend headless Medusa 2.0 en un VPS, con Postgres gestionado, Redis y CI propio.',
      en: 'A full e-commerce build: a Nuxt 4 SSR storefront on Vercel over a headless Medusa 2.0 backend on a VPS, with managed Postgres, Redis and its own CI.',
    },
    body: [
      {
        es: 'Empezó como un Vue 3 plano y se migró a Nuxt 4 para tener SSR de verdad: catálogo indexable, primer render con producto ya pintado y el estado del carrito resuelto en servidor. La parte interesante del proyecto no es la tienda, es la costura entre capas: el contexto de Nuxt se resuelve una vez en el store en lugar de en cada acción, porque en SSR cada acción vive en una petición distinta y resolverlo tarde te da el contexto de otro visitante.',
        en: 'It started as plain Vue 3 and was migrated to Nuxt 4 for real SSR: an indexable catalogue, a first paint with the product already drawn, and cart state resolved server-side. The interesting part is not the shop, it is the seam between layers: the Nuxt context is resolved once in the store rather than on every action, because under SSR each action lives in a different request and resolving it late hands you another visitor’s context.',
      },
      {
        es: 'La infraestructura está repartida a propósito. El front va en Vercel porque el edge le sale gratis; Medusa va en un VPS porque necesita proceso largo y trabajos en cola; Postgres y Redis son gestionados para no cuidar servidores de estado. Todo cuelga de un `.nvmrc` único que leen los dos jobs del CI, para que CI, Vercel y el VPS no acaben en tres versiones distintas de Node sin que nadie se entere.',
        en: 'The infrastructure is split on purpose. The front end sits on Vercel because the edge comes free; Medusa runs on a VPS because it needs a long-lived process and queued jobs; Postgres and Redis are managed so nobody babysits stateful servers. Everything hangs off a single `.nvmrc` read by both CI jobs, so CI, Vercel and the VPS do not silently drift into three different Node versions.',
      },
    ],
    stack: ['Nuxt 4', 'Vue 3', 'TypeScript', 'Medusa 2.0', 'PostgreSQL', 'Redis', 'Vercel', 'Cloudflare', 'GitHub Actions'],
    metrics: [
      { label: { es: 'commits', en: 'commits' }, value: '420+' },
      { label: { es: 'capas desplegadas', en: 'deployed tiers' }, value: '4' },
      { label: { es: 'de Vue 3 a Nuxt 4', en: 'Vue 3 → Nuxt 4' }, value: 'SSR' },
    ],
    demo: 'https://watch-store-lemon.vercel.app',
  },
  {
    slug: 'tcg-life-counter',
    name: 'TCG Life Counter',
    year: '2026',
    status: 'live',
    visibility: 'private',
    featured: true,
    hue: 265,
    tagline: {
      es: 'Contador de vidas multi-TCG, PWA offline-first',
      en: 'A multi-TCG life counter, offline-first PWA',
    },
    summary: {
      es: 'Magic (Standard y Commander) de 2 a 6 jugadores, con matriz de daño de comandante, deshacer, Wake Lock y tema AMOLED. Instalable y sin red.',
      en: 'Magic (Standard and Commander) for 2 to 6 players, with a commander damage matrix, undo, Wake Lock and an AMOLED theme. Installable, works with no network.',
    },
    body: [
      {
        es: 'Añadir un juego nuevo es una entrada en un registro, no una rama de código: el formato define vidas iniciales, contadores propios y disposición de mesa, y la interfaz se deriva de ahí. Por eso Pokémon o Lorcana entran sin tocar las vistas.',
        en: 'Adding a new game is one entry in a registry, not a code branch: the format declares starting life, its own counters and the table layout, and the interface derives from that. Which is why Pokémon or Lorcana slot in without touching the views.',
      },
      {
        es: 'El bug más instructivo fue de service worker. Corregir la CSP no llegaba a nadie que ya tuviera la app abierta: el SW precachea el `index.html` con las cabeceras con las que lo bajó, y como las cabeceras no forman parte del bundle, ningún hash cambiaba, `sw.js` quedaba idéntico byte a byte y el navegador no veía actualización. La solución fue sellar un hash de las cabeceras como `<meta>` en el HTML durante el build, para que cambiar la política cambie el documento y con él la revisión del precaché.',
        en: 'The most instructive bug was a service worker one. Fixing the CSP reached nobody who already had the app open: the SW precaches `index.html` with the headers it was downloaded with, and since headers are not part of the bundle, no hash changed, `sw.js` stayed byte-for-byte identical, and the browser saw no update. The fix was to stamp a hash of the headers into the HTML as a `<meta>` at build time, so changing the policy changes the document and with it the precache revision.',
      },
    ],
    stack: ['Vue 3', 'Vite 7', 'Pinia', 'Workbox', 'SCSS', 'Vitest', 'Cloudflare Workers'],
    metrics: [
      { label: { es: 'commits', en: 'commits' }, value: '200+' },
      { label: { es: 'jugadores', en: 'players' }, value: '2–6' },
      { label: { es: 'temas', en: 'themes' }, value: '3' },
    ],
    demo: 'https://life.krahegwen.com',
  },
  {
    slug: 'tws-tools',
    name: 'TWS-Tools',
    year: '2026',
    status: 'live',
    visibility: 'private',
    featured: false,
    hue: 8,
    tagline: {
      es: 'Dos sistemas de trading algorítmico sobre IBKR, en producción',
      en: 'Two algorithmic trading systems over IBKR, in production',
    },
    summary: {
      es: 'Un motor de scalping EMA en vivo y un port de la estrategia NostalgiaForInfinity a renta variable, con supervisor, backtesting de cartera y una suite de tests que sostiene el conjunto.',
      en: 'A live EMA scalping engine plus a port of the NostalgiaForInfinity strategy to equities, with a supervisor, portfolio backtesting, and a test suite holding the whole thing up.',
    },
    body: [
      {
        es: 'Es el proyecto donde más he aprendido de arquitectura, porque un fallo aquí cuesta dinero de verdad. Cada dato tiene un único dueño: los límites de peticiones de IB viven en un módulo y solo en uno, las rutas de disco salen de `common/paths.py` y ningún módulo las deriva de su propio `__file__`, y la URL de Telegram la construye un solo sitio para los cinco procesos que avisan. Cuando el mismo dato se calcula en dos pantallas, tarde o temprano cuentan cosas distintas.',
        en: 'This is where I have learned the most about architecture, because a bug here costs real money. Every fact has one owner: IB request pacing lives in exactly one module, disk paths come from `common/paths.py` and no module derives them from its own `__file__`, and the Telegram URL is built in a single place for the five processes that post. When the same fact is computed in two screens, sooner or later they tell different stories.',
      },
      {
        es: 'El supervisor hace relevo en caliente: un `/restart` sale con código 42 y el núcleo lo reemplaza sin perder el hilo, con backoff ante caídas y logs rotados. Hay dos capas de datos separadas —el almacén de velas y el estado de trading— y un gateway de solo lectura con banderas de frescura, para que una estrategia nunca decida sobre una vela vieja creyéndola nueva.',
        en: 'The supervisor does hot handover: a `/restart` exits with code 42 and the core swaps the process without losing the thread, with crash backoff and rotated logs. There are two separate data layers — the candle store and the trading state — plus a read-only gateway with freshness flags, so a strategy never decides on a stale candle believing it is fresh.',
      },
    ],
    stack: ['Python', 'ib_insync', 'SQLite', 'pandas', 'pytest', 'Telegram Bot API', 'Stream Deck'],
    metrics: [
      { label: { es: 'módulos Python', en: 'Python modules' }, value: '450+' },
      { label: { es: 'suites de test', en: 'test suites' }, value: '82' },
      { label: { es: 'commits', en: 'commits' }, value: '550+' },
    ],
  },
  {
    slug: 'krahegwen-com',
    name: 'krahegwen.com',
    year: '2026',
    status: 'live',
    visibility: 'public',
    featured: false,
    hue: 190,
    tagline: {
      es: 'Esta misma web: CV dinámico en Nuxt 4 con GSAP',
      en: 'This very site: a dynamic CV in Nuxt 4 with GSAP',
    },
    summary: {
      es: 'Un solo fichero de contenido alimenta tres CV distintos —público, anónimo e interno— y la web entera. Los años de experiencia se calculan, no se escriben.',
      en: 'A single content file feeds three different CVs — public, anonymous and internal — and the whole site. Years of experience are computed, never typed.',
    },
    body: [
      {
        es: 'Tenía seis CV en una carpeta, con fechas distintas y verdades ligeramente distintas. El arreglo no fue elegir el mejor: fue quedarse con uno solo y marcar con metadatos aquello que cambia según quién mire. Quién ve el teléfono, quién ve el nombre y —la que importa— quién ve el nombre del cliente.',
        en: 'I had six CVs in a folder, with different dates and slightly different truths. The fix was not picking the best one: it was keeping exactly one and tagging with metadata whatever changes depending on who is looking. Who sees the phone number, who sees the name, and — the one that matters — who sees the client’s name.',
      },
    ],
    stack: ['Nuxt 4', 'Vue 3', 'GSAP', 'TypeScript', 'Vercel'],
    repo: 'https://github.com/Krahegwen/portfolio',
    demo: 'https://krahegwen.com',
  },
  {
    slug: 'corta-fruta-vr',
    name: 'Corta Fruta VR',
    year: '2018',
    status: 'archived',
    visibility: 'private',
    featured: false,
    hue: 130,
    tagline: {
      es: 'Fruit Ninja en realidad virtual, con Unity',
      en: 'Fruit Ninja in virtual reality, built in Unity',
    },
    summary: {
      es: 'Juego en Unity y C# inspirado en Fruit Ninja y adaptado a VR. La primera vez que trabajé con espacio tridimensional e interacción física.',
      en: 'A Unity and C# game inspired by Fruit Ninja, adapted to VR. My first time working with three-dimensional space and physical interaction.',
    },
    body: [
      {
        es: 'De la época de la carrera, y la raíz de todo lo que vino después: cortar una fruta en VR y cortarla en un configurador de producto son, por debajo, el mismo problema de hacer que un gesto humano tenga sentido dentro de una escena 3D.',
        en: 'From my university years, and the root of everything that came after: slicing fruit in VR and slicing through a product configurator are, underneath, the same problem of making a human gesture mean something inside a 3D scene.',
      },
    ],
    stack: ['Unity', 'C#', 'VR'],
  },
]

export const featuredProjects = projects.filter(p => p.featured)
