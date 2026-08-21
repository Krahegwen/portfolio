# krahegwen.com

CV dinámico y portfolio de Diego Portilla Tejería. Nuxt 4, GSAP y nada más:
sin CMS, sin base de datos y sin nada que ejecutar en producción.

**En producción:** [krahegwen.com](https://krahegwen.com)

## La idea

Había seis CV en una carpeta —dos `.docx`, dos `.pdf`, tres `.pptx`, de 2022 y
2023— con fechas distintas y verdades ligeramente distintas. Uno decía "+5 años
de experiencia" tres años después de que dejara de ser cierto.

Aquí hay **una sola fuente de datos**, [`content/profile.ts`](content/profile.ts),
y tres formas de leerla según quién esté al otro lado. Lo que cambiaba entre
aquellos seis documentos ahora es un metadato, no un archivo aparte:

| Variante | Quién la lee | Nombre | Contacto | Teléfono | Clientes por nombre |
|---|---|---|---|---|---|
| `recruiter` | Recruiters y web pública | sí | personal | opcional¹ | **no** |
| `anon` | Procesos de selección ciegos | no | no | nunca | **no** |
| `accenture` | Staffing interno | sí | corporativo | nunca | **sí** |

¹ `identity.publishPhone` en `content/profile.ts`, **`false` por defecto**. El
PDF público vive en una URL abierta e indexable, no en el adjunto de un correo a
un recruiter concreto: un número ahí lo recogen los rastreadores en días y no se
retira de las cachés. Ponlo a `true` y regenera si prefieres que aparezca; solo
afecta al PDF `recruiter`.

La fila que importa es la última. Los CV públicos de origen nunca nombraban al
cliente —decían "one of the biggest petrochemical companies"—; solo el deck
interno lo hacía. Esa línea se respeta y la vigila un test
(`tests/cv-variants.spec.ts`), porque es la que puede hacer daño de verdad.

**Ninguna cifra de años está escrita a mano.** Salen de las fechas del CV
(`app/utils/dates.ts`), así que la web, las tarjetas sociales y los seis PDF
envejecen solos y a la vez.

## Arrancar

Requisitos: Node ≥ 22.12 (`.nvmrc` manda) y pnpm.

```bash
pnpm install
pnpm dev
```

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción a `.vercel/output` |
| `pnpm test` | Los tests (ver más abajo) |
| `pnpm lint` | ESLint |
| `pnpm cv:pdf` | Regenera los seis PDF del CV. **Necesita `pnpm build` antes** |
| `pnpm typecheck` | vue-tsc sobre todo el árbol |
| `pnpm og` | Regenera las tarjetas sociales |

## Estructura

```
content/        profile.ts (el CV) y projects.ts (lo que he construido)
app/
  components/
    sections/   las secciones de la portada
    cv/         CvDocument.vue — las tres variantes salen de aquí
    ui/         piezas reutilizables (FieldCanvas, ProjectCard, SectionHead)
    pages/      el cuerpo de cada página; los ficheros de pages/ son de 3 líneas
  composables/  useLocale (i18n), useMotion (GSAP), useTheme
  layouts/      default (con cabecera) y print (para los PDF)
  utils/        dates.ts — toda la aritmética del CV
scripts/        generación de PDF y de tarjetas sociales con Chrome headless
server/routes/  sitemap.xml
```

### Idiomas

Español en `/` e inglés en `/en`, con rutas reales en lugar de un conmutador que
reescribe la página. Cada idioma se prerrenderiza, se indexa y se puede
compartir; con una cookie, las dos versiones vivirían en la misma URL y Google
las trataría como contenido duplicado. Los ficheros de `app/pages/en/` son
envoltorios de tres líneas: `useLocale` deduce el idioma de la ruta.

### Animación

Todo GSAP + ScrollTrigger, registrado en un único sitio
(`app/composables/useMotion.ts`). `prefers-reduced-motion` no se comprueba en
cada componente: si está activo, los *helpers* colocan el estado final de una vez
y **no crean ningún ScrollTrigger**. "Sin movimiento" significa sin movimiento,
no las mismas animaciones a 0,01 s.

El plano en perspectiva del héroe es `<canvas>` 2D, no WebGL — no compensa
arrancar un contexto 3D para dibujar líneas— y se detiene cuando sale de
pantalla.

### PDF y tarjetas sociales

Se generan con el Chrome (o el Edge) que ya está instalado, no con Puppeteer:
serían 150 MB de Chromium para lo que dos banderas de línea de comandos hacen
igual. `scripts/chrome.mjs` localiza el binario; `CHROME_PATH` lo fuerza.

Los PDF salen de las rutas `/print/cv/:variante` de la propia web —la misma
`CvDocument.vue` que se ve en pantalla—, así que **no pueden discrepar del sitio**.
Se sirven desde `public/cv/` y se copian a `CV/2026/`.

Los artefactos (`public/cv/*.pdf`, `public/og*.png`) **están versionados a
propósito**: Vercel no tiene Chrome, así que se generan en local y se suben.
Tras cambiar `content/profile.ts`:

```bash
pnpm build && pnpm cv:pdf && pnpm og
```

La textura de fondo de las tarjetas (`scripts/og-texture.png`) la generó ComfyUI
en local con z-image-turbo. El texto va encima, vectorial: un modelo de imagen no
sabe escribir un nombre y una tarjeta social se lee, sobre todo, por el nombre.

### Tests

Viven en local y **no están en el repo** (`tests/` y `vitest.config.ts` están en
`.gitignore`). Para publicarlos basta con borrar esas líneas: las
`devDependencies` sí están versionadas, así que `pnpm test` funcionará sin tocar
nada más.

Son 43 y cubren tres cosas: la aritmética de fechas, la coherencia del contenido
(fechas sin huecos ni solapes, slugs únicos, traducciones sin olvidos) y —la
importante— que los nombres de cliente no se escapen de la variante interna.

## Despliegue

Vercel, con todo prerrenderizado (`nitro.prerender`): no hay ninguna función
serverless en producción. `vercel.json` fija las cabeceras de seguridad.

La CSP lleva `'unsafe-inline'` en dos sitios y no es por dejadez: en `style-src`
es el precio de los `<style>` que Vue inyecta por componente, y en `script-src` lo
pide el script que fija el tema antes del primer pintado (sin él hay un destello
de tema equivocado). `connect-src 'self'` porque la página no llama a nadie.

### DNS

El dominio está en Cloudflare. El ápice apunta a Vercel; los subdominios que ya
existen (`brew`, `life`, `watch-store`) no se tocan.

| Tipo | Nombre | Valor | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | **DNS only** |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only** |

En gris (DNS only), no naranja: con el proxy de Cloudflare por delante, Vercel no
puede emitir ni renovar su certificado y la validación del dominio se queda
colgada.
