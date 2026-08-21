# Poner esto en marcha

**El sitio está en producción: [krahegwen.com](https://krahegwen.com).**

| | Estado |
|---|---|
| Despliegue en Cloudflare Workers | ✅ hecho |
| Dominio `krahegwen.com` | ✅ hecho |
| Avisos del formulario | ⏳ falta el bot de Telegram — [paso 2](#2-avisos-por-telegram) |
| Analítica | ⏳ falta el token, **y va en el build** — [paso 4](#4-analítica) |
| `www.krahegwen.com` | ⚠️ no existe — opcional, ver abajo |

Medido sobre el dominio real: TTFB 80-95 ms y 205 KB en la primera carga,
tipografías incluidas.

## 1. Desplegar — hecho

```bash
pnpm build && pnpm deploy
```

Eso es todo lo que hace falta para publicar un cambio. Si prefieres que despliegue
solo en cada push, Cloudflare tiene **Workers Builds**: Dashboard → Workers → el
proyecto → Settings → Builds → conectar `Krahegwen/portfolio`, con `pnpm build` y
`npx wrangler deploy`.

### `www`, si lo quieres

`www.krahegwen.com` hoy no existe: quien lo teclee recibe un error de DNS del
navegador en lugar del sitio. No es imprescindible —los `canonical` van todos sin
`www`— pero cuesta un clic:

Workers → `krahegwen` → Settings → Domains & Routes → Add → Custom Domain →
`www.krahegwen.com`. Servirá el mismo sitio, y los `canonical` ya le dicen a
Google cuál es la buena.

## 2. Avisos por Telegram

Es lo único que no funciona hasta que lo configures. Mientras tanto el formulario
devuelve un 503 honesto y enseña tu dirección de correo, en lugar de tragarse el
mensaje diciendo que ha llegado.

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

4. El id no es secreto: va en `vars` de `wrangler.jsonc`, en `TELEGRAM_CHAT_ID`.
   El token **sí** lo es:

```bash
npx wrangler secret put TELEGRAM_TOKEN
```

5. `pnpm deploy` y prueba el formulario en la web.

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

## 4. Analítica

Dashboard → Analytics & Logs → **Web Analytics** → Add a site → `krahegwen.com`.
Copia el token.

> **Va en el build, no en el Worker.** Es la trampa de este montaje: las páginas
> están prerenderizadas y Cloudflare las sirve como ficheros estáticos, sin
> invocar al Worker jamás. Una variable del Worker no las tocaría. El token se
> hornea en el HTML **al compilar**.

Si despliegas desde tu máquina, va en el `.env`:

```
NUXT_PUBLIC_ANALYTICS_TOKEN=el_token_que_te_dio_cloudflare
```

y luego `pnpm build && pnpm deploy`. Compruébalo antes de subir:

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
pnpm test && pnpm build && pnpm cv:pdf && pnpm og && pnpm deploy
```

Los PDF y las tarjetas van versionados porque el runner de build no tiene Chrome
para generarlos; por eso se hacen en local.
