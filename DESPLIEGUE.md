# Poner esto en marcha

**El sitio está en producción: [krahegwen.com](https://krahegwen.com).**

| | Estado |
|---|---|
| Despliegue en Cloudflare Workers | ✅ hecho |
| Dominio `krahegwen.com` | ✅ hecho |
| Avisos del formulario | ✅ hecho — bot `@krahegwen_warnings_bot`, [paso 2](#2-avisos-por-telegram--hecho) |
| Analítica | ✅ hecha — el token se hornea en el build, [paso 4](#4-analítica--hecha) |
| CV anónimo e interno | ✅ hecho — `CV_CLAVE` puesta, [paso 5](#5-la-contraseña-de-los-cv-no-públicos) |
| `www.krahegwen.com` | ⚠️ no existe — opcional, ver abajo |

Medido sobre el dominio real: TTFB 80-95 ms y 205 KB en la primera carga,
tipografías incluidas.

## 1. Desplegar — hecho

```bash
pnpm build && pnpm run deploy
```

Eso es todo lo que hace falta para publicar un cambio.

> **`run` no sobra.** `deploy` es un comando propio de pnpm —el de desplegar un
> paquete de un monorepo— y se come al script del `package.json`: `pnpm deploy` a
> secas contesta `ERR_PNPM_NOTHING_TO_DEPLOY` y no llega a llamar a wrangler.
> `pnpm build` y `pnpm test` no tienen ese problema.

Si prefieres que despliegue solo en cada push, Cloudflare tiene **Workers
Builds**: Dashboard → Workers → el proyecto → Settings → Builds → conectar
`Krahegwen/portfolio`, con `pnpm build` y `npx wrangler deploy`.

### `www`, si lo quieres

`www.krahegwen.com` hoy no existe: quien lo teclee recibe un error de DNS del
navegador en lugar del sitio. No es imprescindible —los `canonical` van todos sin
`www`— pero cuesta un clic:

Workers → `krahegwen` → Settings → Domains & Routes → Add → Custom Domain →
`www.krahegwen.com`. Servirá el mismo sitio, y los `canonical` ya le dicen a
Google cuál es la buena.

## 2. Avisos por Telegram — hecho

Funcionando: el formulario de contacto y las descargas de CV avisan a
`@krahegwen_warnings_bot`. Si algún día el aviso no sale, el formulario devuelve
un 503 honesto y enseña tu dirección de correo, en lugar de tragarse el mensaje
diciendo que ha llegado.

Queda escrito por si hay que rehacerlo —bot nuevo, cuenta nueva, o el mismo
montaje en otro sitio—.

> **Por qué Telegram y no correo.** Enviar correo desde un Worker exige plan
> Workers Paid (5 $/mes) — lo dice el propio dashboard en Email Sending. Para una
> web personal no compensa, y tú ya tienes bots de Telegram en producción.

1. Habla con [@BotFather](https://t.me/BotFather) → `/newbot`. Te da el token.
2. **Escríbele algo a tu bot nuevo.** Sin eso Telegram no le deja iniciar la
   conversación y el aviso nunca llegará.
3. Saca el id del chat:

```bash
curl -s "https://api.telegram.org/bot<TU_TOKEN>/getUpdates" | grep -o '"chat":{"id":[-0-9]*'
```

4. Los dos van como secreto, y ninguno a `wrangler.jsonc`:

```bash
npx wrangler secret put TELEGRAM_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

   El token, por lo evidente. El id **no es secreto en el sentido de seguridad**
   —sin el token no sirve para enviar nada—, pero este repositorio es público y
   `wrangler.jsonc` se versiona: en `vars` quedaría escrito para siempre en el
   historial de git, y es un identificador personal de Telegram. Al Worker le
   llega igual: secretos y variables aterrizan en el mismo `env`.

5. `pnpm build && pnpm run deploy`, y prueba el formulario en la web. Sin navegador:

```bash
ABIERTO=$(( $(date +%s)000 - 10000 ))
curl -s -X POST https://krahegwen.com/api/contacto \
  -H 'content-type: application/json' \
  -d "{\"nombre\":\"Prueba\",\"email\":\"tu@correo.com\",\"mensaje\":\"Aviso de prueba del canal.\",\"consentimiento\":true,\"idioma\":\"es\",\"abierto\":$ABIERTO}"
```

   Un `{"ok":true}` significa que Telegram aceptó el envío; el `abierto` va diez
   segundos atrás porque el formulario rechaza los rellenos de menos de tres.

### Detalles que ya están resueltos

- **Reintento en plano.** El mensaje lo escribe un desconocido en un formulario
  público; si Telegram no sabe interpretar el marcado devuelve un 400 y el aviso
  se reenvía sin formato en lugar de perderse. Mismo criterio que
  `common/telegram_out.py` en TWS-Tools.
- **El token nunca se registra.** Va dentro de la URL, así que cualquier traza
  que la incluya lo filtraría: todo lo que sale por consola pasa por `redactar()`,
  y hay un test que lo comprueba.

### Silenciar los avisos de descarga

Cada descarga de CV manda un aviso, con media hora de silencio por variante para
que curiosear las seis versiones no genere seis mensajes. Si aun así sobra:
`AVISAR_DESCARGAS` a `no` en `wrangler.jsonc` y redesplegar.

## 3. El dominio — hecho

`krahegwen.com` sirve el sitio con certificado válido, y `brew`, `life` y
`watch-store` siguen apuntando a sus propios Workers, intactos.

Quedó registrado para la próxima vez: no hubo que elegir gris ni naranja ni
copiar ninguna IP. Cloudflare creó el registro y emitió el certificado por su
cuenta, que es lo que se gana teniéndolo todo en el mismo sitio.

## 4. Analítica — hecha

Dashboard → Analytics & Logs → **Web Analytics** → Add a site → `krahegwen.com`.
El token está en **Manage site → Opciones avanzadas**, dentro del snippet.

> **«Activar» en ese panel no hace nada aquí.** La opción por defecto promete
> inyectar el script sola, y con un origen normal lo hace: el proxy le mete el
> beacon a la respuesta al pasar. Este sitio no tiene origen — el HTML lo sirve
> Workers Static Assets, que no pasa por ese punto—, así que la inyección
> automática se queda en la promesa. Comprobado sobre el dominio: con «Activar»
> puesto, la portada no traía beacon. La opción que describe la realidad es
> **«Habilitar con la instalación del snippet JS»**, porque lo instala la web.

> **Va en el build, no en el Worker.** Es la trampa de este montaje: las páginas
> están prerenderizadas y Cloudflare las sirve como ficheros estáticos, sin
> invocar al Worker jamás. Una variable del Worker no las tocaría. El token se
> hornea en el HTML **al compilar**.

Si despliegas desde tu máquina, va en el `.env`:

```
NUXT_PUBLIC_ANALYTICS_TOKEN=el_token_que_te_dio_cloudflare
```

y luego `pnpm build && pnpm run deploy`. Compruébalo antes de subir:

```bash
grep -o 'data-cf-beacon' .output/public/index.html
```

Si no imprime nada, el token no llegó al build y desplegar no serviría de nada.

Si algún día lo pasas a **Workers Builds**, la variable va en Settings → Builds →
Build variables, que sí se leen al compilar — no en Settings → Variables, que son
de ejecución.

No pone cookies ni identificador persistente, y por eso el sitio no lleva banner
de consentimiento. Está explicado en `/privacidad` y hay tests que lo vigilan: si
algún día añades algo que sí ponga cookies, esos tests fallan y toca revisar el
documento **antes** de desplegar.

## 5. La contraseña de los CV no públicos

`/cv` publica **un** CV, el público. La versión anónima y la interna de Accenture
se abren con diez clics seguidos en el epígrafe «Currículum» y una contraseña:

```bash
npx wrangler secret put CV_CLAVE
```

Hasta que exista ese secreto el modal responde que no hay clave configurada —no
que la tecleada sea incorrecta— y los cuatro PDF privados no se descargan.

Que sea **larga**. El límite de dos intentos por media hora vive en la memoria de
cada instancia del Worker, igual que el del formulario: frena una ráfaga desde
una misma conexión, no un ataque repartido entre varias. Lo que de verdad protege
esto es la longitud de la clave. Si algún día hiciera falta un límite de verdad,
el sitio para ponerlo es KV o un Durable Object.

En local, para probarlo con `pnpm preview`, el secreto va en `.dev.vars` (que
está en `.gitignore`):

```
CV_CLAVE=lo-que-sea-para-probar
```

### Cerrar un pase ya abierto

El pase dura **treinta días** (`VIGENCIA_MS` en `server/utils/pase.ts`). Es largo
a propósito: lo que hay detrás son dos CV tuyos, y una contraseña que hay que
teclear cada día acaba apuntada en algún sitio. Para cerrarlo antes hay dos
formas, según lo que quieras cerrar:

- **Solo este navegador** — el botón «Cerrar» que sale junto al conmutador. Borra
  la cookie en el servidor, no solo el recuerdo local.
- **Todos los pases abiertos, en cualquier parte** — cambiar el secreto:

```bash
npx wrangler secret put CV_CLAVE
```

La firma de la cookie se deriva de `CV_CLAVE`, así que rotarlo invalida de golpe
todo lo que hubiera vivo. No hace falta redesplegar: el Worker lee el secreto en
cada petición.

### Las dos piezas que lo sostienen, y que no son obvias

- **Los PDF privados no están en `public/`**, sino en `server/assets/cv/`, y por
  tanto viajan dentro del propio Worker (unos 850 KB comprimidos de los 1,1 MB
  que ocupa). No es manía de orden: en el preset de Cloudflare, todo lo que está
  en `public/` lo sirve el servidor de activos **antes** de que Nitro mire la
  petición. Un PDF ahí dentro no se puede proteger por mucha ruta con cookie que
  exista, porque nadie llegaría a esa ruta. Hay un test que lo vigila.
- **`run_worker_first` en `wrangler.jsonc` es la lista completa, no un añadido.**
  Sin ella, todo lo que no encaja con un fichero cae al Worker por defecto; en
  cuanto existe, lo que no esté dentro lo resuelve el servidor de activos y ya
  está. La primera versión de esa lista dejó `/api/*` fuera y el formulario de
  contacto empezó a recibir un 405 del servidor de activos sin que el Worker se
  enterara siquiera. Si añades una ruta de servidor nueva, tiene que entrar ahí.

### Qué queda fuera del candado

La página se pinta en el navegador, así que **los datos del CV —incluidos los
nombres de cliente— siguen viajando en el bundle de JavaScript**, igual que antes
de todo esto. El candado cierra los PDF y las hojas de impresión; no convierte en
secreto un dato que ya estaba publicado. Para eso habría que sacar esos campos de
`content/profile.ts` a un módulo que solo importe el servidor y servirlos por
API tras la cookie — más trabajo, y un cambio de arquitectura, no un parche.

## Después

- **Google Search Console**: añadir la propiedad y enviar
  `https://krahegwen.com/sitemap.xml`. El sitemap declara `hreflang` recíproco
  entre `/` y `/en`.
- **LinkedIn**: al pegar el enlace saldrá la tarjeta de `public/og.png`. Si
  cambia y sigue enseñando la vieja, su
  [Post Inspector](https://www.linkedin.com/post-inspector/) fuerza el refresco.
- **El teléfono**: hoy no sale en ningún PDF, a propósito. Si lo quieres en el
  público, `identity.publishPhone: true` en `content/profile.ts` y
  `pnpm build && pnpm cv:pdf`.
- **Si algún día pasas a Workers Paid** y prefieres correo, el cambio es
  reescribir `enviar()` en `server/utils/notificar.ts` y actualizar el bloque de
  terceros de `content/privacidad.ts`. Nada más sabe por dónde salen los avisos.

### Si empieza a entrar spam

El formulario para bots con un campo trampa, un tiempo mínimo de relleno y un
límite por IP. Si aun así entra basura, el siguiente paso es **Turnstile**: ya
estás en Cloudflare, el widget es gratuito y solo hay que verificar el token en
`server/api/contacto.post.ts`, junto a las otras comprobaciones. No lo he montado
de entrada porque poner un muro delante de cada persona que quiere escribir
cuesta más que el spam que hoy no existe.

## Cuando cambie el CV

`content/profile.ts` es el único fichero que hay que tocar. Después:

```bash
pnpm test && pnpm build && pnpm cv:pdf && pnpm og && pnpm run deploy
```

Los PDF y las tarjetas van versionados porque el runner de build no tiene Chrome
para generarlos; por eso se hacen en local. `pnpm cv:pdf` deja los dos públicos
en `public/cv/`, los cuatro privados en `server/assets/cv/` y una copia de los
seis en `CV/2026/`.
