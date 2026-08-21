# Poner esto en marcha

Todo en Cloudflare, que es donde ya viven `brew` y `life`. Tres pasos, y solo el
segundo tiene algo de miga.

> **El proyecto de Vercel se puede borrar.** No queda nada del código que dependa
> de él: ni `vercel.json`, ni `@vercel/*`, ni el preset.

## 1. Desplegar

Con wrangler ya autenticado (`npx wrangler whoami` lo confirma):

```bash
pnpm build && pnpm deploy
```

Sale en `krahegwen.<subdominio>.workers.dev`. Compruébalo ahí antes de tocar el
dominio.

Si prefieres que despliegue solo en cada push, Cloudflare tiene **Workers Builds**:
Dashboard → Workers → el proyecto → Settings → Builds → conectar
`Krahegwen/portfolio`. Comando de build `pnpm build`, de deploy `npx wrangler deploy`.

## 2. Correo del formulario

Es lo único que no funciona hasta que lo habilites. Mientras tanto el formulario
devuelve un 503 honesto y enseña tu dirección para escribir directamente, en
lugar de tragarse el mensaje diciendo que ha llegado.

```bash
npx wrangler email sending enable krahegwen.com
```

Si da `Unauthorized [code: 2036]` —le pasó a mi token— es que le faltan permisos
de Email. Dos salidas:

- **Dashboard**: Email → Email Sending → añadir `krahegwen.com` y seguir el
  asistente. Crea los registros SPF/DKIM/DMARC solo, porque el DNS ya está ahí.
- **Token nuevo** con el permiso `Email Sending: Edit` y repetir el comando.

El remitente configurado es `web@krahegwen.com` (en `vars` de `wrangler.jsonc`).
No hace falta que ese buzón exista para *enviar*; si además quieres recibir en
él, eso es **Email Routing**, que es otra pestaña y otro día.

Compruébalo con el formulario de la web una vez desplegada. Debería llegarte un
correo de `krahegwen.com` con **Responder-a** apuntando a quien escribió, así que
contestar es darle a Responder.

### Silenciar los avisos de descarga

Cada descarga de CV manda un correo, con media hora de silencio por variante para
que curiosear las seis versiones no genere seis correos. Si aun así sobra:
`AVISAR_DESCARGAS` a `no` en `wrangler.jsonc` y redesplegar.

## 3. El dominio

`krahegwen.com` **no resuelve a nada** ahora mismo. Los subdominios que ya
funcionan (`brew`, `life`, `watch-store`, `watch-store-api`) **no se tocan**.

Dashboard → Workers → `krahegwen` → Settings → **Domains & Routes** → Add →
Custom Domain → `krahegwen.com`. Y otra vez para `www.krahegwen.com`.

Cloudflare crea el registro y emite el certificado por su cuenta. No hay que
elegir gris ni naranja, ni copiar ninguna IP: esa es la parte que desaparece por
estar todo en el mismo sitio.

## 4. Analítica

Dashboard → Analytics & Logs → **Web Analytics** → Add a site → `krahegwen.com`.
Copia el token y ponlo en Settings → Variables del Worker como
`NUXT_PUBLIC_ANALYTICS_TOKEN`. Sin él, el script no se inyecta y no se mide nada.

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
