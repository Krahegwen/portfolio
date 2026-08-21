# krahegwen.com

CV dinámico y portfolio de Diego Portilla Tejería. Nuxt 4 y GSAP sobre
Cloudflare Workers: sin CMS, sin base de datos y con un solo proveedor.

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

Requisitos: Node 24 (`.nvmrc` manda) y pnpm.

```bash
pnpm install
pnpm dev
```

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción a `.output` |
| `pnpm preview` | Sirve el build con `wrangler dev`, el runtime real |
| `pnpm deploy` | Despliega a Cloudflare Workers |
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

### Formulario, avisos y analítica

El formulario de contacto (`server/api/contacto.post.ts`) es, junto al aviso de
descarga, **lo único que ejecuta algo en producción**. El resto del sitio sigue
siendo estático.

Sin CAPTCHA a propósito: un buzón personal no recibe el volumen que justifica
poner un muro delante de cada persona que quiere escribir. Tres filtros baratos
—campo trampa, tiempo mínimo de relleno y límite por IP— paran el spam
automatizado. Si dejan de bastar, el siguiente paso está en DESPLIEGUE.md.

Los avisos salen **por correo**, con el binding `send_email` de Cloudflare: sin
clave de API que custodiar y sin proveedor externo por el que pasen los mensajes.
El `replyTo` es la dirección de quien escribe, así que responder es darle a
"Responder". Si el correo no sale, el endpoint devuelve 503 y el formulario
enseña la dirección para escribir directamente — prometer que ha llegado un
mensaje que se ha perdido es peor que dar el error.

Todo el transporte pasa por `server/utils/notificar.ts`: cambiarlo por Telegram,
un webhook o lo que sea es reescribir una función.

De las descargas de CV se registra **qué variante, en qué idioma y cuándo**.
Nunca quién: ni IP, ni user-agent, ni cabecera de procedencia. El aviso lo
dispara la página porque el PDF es un fichero estático que Cloudflare sirve sin
pasar por el Worker; la consecuencia es que el recuento es una aproximación, y
es un precio que se paga a gusto por no interponer una redirección entre alguien
y su descarga. Hay media hora de silencio por variante para que curiosear las
seis versiones no genere seis correos.

### Privacidad

**No hay cookies.** Ni propias ni de terceros, y por eso no hay banner: un aviso
de cookies en una web sin cookies es ruido que se firma sin leer. Lo único que
se guarda en el navegador es `kw-theme`, con `light` o `dark`.

Las tipografías **están autoalojadas** (`public/fonts/`, 392 KB). Cargarlas desde
Google Fonts, que es lo normal, habría enviado la IP de cada visitante a Google
en cada carga; ahora también ahorra dos handshakes en la ruta crítica.

Cloudflare Web Analytics tampoco pone cookies ni identificador persistente. Y no
hay más proveedores: el sitio, la analítica y el correo del formulario salen
todos de Cloudflare, así que la lista de terceros de la política tiene una sola
entrada.

`content/privacidad.ts` es el texto que se publica, y **`tests/privacidad.spec.ts`
ata cada afirmación a una comprobación sobre el código**: si alguien añade una
cookie o vuelve a cargar fuentes de Google, el test falla antes de que el
documento se vuelva mentira.

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

Los PDF salen de las rutas `/print/cv/:variante` y `/en/print/cv/:variante` de la
propia web —la misma `CvDocument.vue` que se ve en pantalla—, así que **no pueden
discrepar del sitio**. Se sirven desde `public/cv/` y se copian a `CV/2026/`.

El árbol inglés cuelga de `/en/print` y no de `/print/en` porque el idioma se
deduce del prefijo `/en` de la ruta: con la otra forma los tres PDF marcados EN
se generaban en español sin que nada fallara. El script lo comprueba antes de
imprimir cada hoja.

Los artefactos (`public/cv/*.pdf`, `public/og*.png`) **están versionados a
propósito**: el runner de build no tiene Chrome, así que se generan en local y
se suben.
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

Son 65 y cubren cuatro cosas: la aritmética de fechas, la coherencia del
contenido (fechas sin huecos ni solapes, slugs únicos, traducciones sin
olvidos), la paridad de los dos árboles de rutas, y las dos que de verdad
importan — que los nombres de cliente no se escapen de la variante interna, y
que la política de privacidad siga siendo cierta.

## Despliegue

**Cloudflare Workers** (preset `cloudflare_module`). Las 27 páginas se
prerrenderizan y las sirve Static Assets sin invocar el Worker; lo único que se
ejecuta son `/api/contacto` y `/api/descarga`. `wrangler.jsonc` tiene la
configuración y `public/_headers` las cabeceras de seguridad.

Un detalle que costó encontrar: Static Assets redirige `/cv` a `/cv/` por
defecto, y eso contradice el `canonical`, los `hreflang` y el sitemap, que
escriben las URL sin barra. `html_handling: "drop-trailing-slash"` invierte la
redirección y deja las tres cosas contando lo mismo.

La CSP lleva `'unsafe-inline'` en dos sitios y no es por dejadez: en `style-src`
es el precio de los `<style>` que Vue inyecta por componente, y en `script-src` lo
pide el script que fija el tema antes del primer pintado (sin él hay un destello
de tema equivocado).

Variables en [`.env.example`](.env.example) y en `vars` de `wrangler.jsonc`.
**Todas opcionales**: sin ninguna el sitio funciona entero, solo que no mide ni
avisa.

### DNS

Todo vive en Cloudflare, así que el ápice es un **custom domain del Worker** y no
un registro que apuntar a mano: Cloudflare crea y gestiona el DNS por su cuenta.
Los subdominios que ya existen (`brew`, `life`, `watch-store`) no se tocan.

Esto es media razón de haber elegido Cloudflare: con un proveedor externo el
ápice tendría que ir en gris (DNS only), porque con el proxy naranja por delante
el certificado del otro no llega a validarse. Aquí no hay dos partes que
coordinar.
