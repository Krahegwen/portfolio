# Poner esto en marcha

Lo único que queda son dos pasos con cuenta propia —Vercel y Cloudflare— que no
se pueden automatizar desde aquí. Diez minutos.

## 1. Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** →
   `Krahegwen/portfolio`.
2. Vercel detecta Nuxt solo. Lo único que hay que tocar:
   - **Node.js Version → 24.x** (Settings → General). El `.nvmrc` dice 24 y
     conviene que Vercel diga lo mismo; si no, cualquier fallo de build acaba
     costando media hora de buscar dónde no coincide.
   - Install/Build ya vienen de `vercel.json` (`pnpm install --frozen-lockfile`
     y `pnpm build`).
3. **Deploy**. Sale en `<algo>.vercel.app` — compruébalo antes de tocar el DNS.

Se prerrenderizan 27 rutas; las dos únicas funciones son `/api/contacto` y
`/api/descarga`.

### Analíticas

Settings → **Analytics** → activar *Web Analytics* y *Speed Insights*. No hay
que poner ninguna variable: los módulos ya están en `nuxt.config.ts` y se
activan solos al detectar Vercel.

Ninguno de los dos pone cookies, y por eso el sitio no lleva banner de
consentimiento. Está explicado en `/privacidad` y hay tests que lo vigilan; si
algún día añades algo que sí ponga cookies, esos tests fallan y toca revisar el
documento **antes** de desplegar.

### Sentry

Crea el proyecto **en la región europea** (el DSN debe decir `ingest.de.sentry.io`).
Por ahí van a pasar los mensajes del formulario de contacto: mantenerlos en la UE
evita una transferencia internacional que habría que justificar. La CSP admite
las dos regiones, así que si eliges US funciona igual — solo cambia lo que hay
que contar en `/privacidad`.

Variables en Settings → Environment Variables, todas descritas en
[`.env.example`](.env.example). La imprescindible es `SENTRY_DSN` (servidor):
es la que hace que te llegue el aviso cuando alguien escribe.

Después, dos **reglas de alerta** en Sentry (Alerts → Create Alert → Issues):

| Cuándo | Filtro | Acción |
|---|---|---|
| Alguien escribe | etiqueta `aviso` = `contacto` | correo, cada vez |
| Alguien baja un CV | etiqueta `aviso` = `descarga-cv` | resumen diario, o nada |

La segunda conviene tenerla en resumen y no al instante: un aviso por descarga
acaba en la carpeta de ignorados en una semana, y con él se van los de contacto.

### Si empieza a entrar spam

El formulario para bots con un campo trampa, un tiempo mínimo de relleno y un
límite por IP. Si aun así entra basura, el siguiente paso es **Cloudflare
Turnstile**: el dominio ya está en Cloudflare, el widget es gratuito y solo hay
que verificar el token en `server/api/contacto.post.ts`, junto a las otras
comprobaciones. No lo he montado de entrada porque poner un muro delante de cada
persona que quiere escribir cuesta más que el spam que hoy no existe.

## 2. Cloudflare — DNS del ápice

El dominio ya está en Cloudflare y `krahegwen.com` **no resuelve a nada** ahora
mismo. Los subdominios que ya funcionan (`brew`, `life`, `watch-store`,
`watch-store-api`) **no se tocan**: esto solo añade el ápice y el `www`.

En Vercel: **Settings → Domains → Add** → `krahegwen.com` (y `www.krahegwen.com`).
Vercel dirá exactamente qué registro quiere; a día de hoy es esto:

| Tipo | Nombre | Valor | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | **DNS only** (gris) |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only** (gris) |

> **En gris, no en naranja.** Con el proxy de Cloudflare por delante, Vercel no
> puede completar la validación ni renovar su certificado, y el dominio se queda
> "Invalid Configuration" indefinidamente. Es el fallo habitual con esta
> combinación. Si prefieres el proxy naranja, hay que cambiar a modo *Full
> (strict)* con un Origin Certificate, y no compensa para un sitio estático que
> ya sale del edge de Vercel.

Copia el valor que te dé Vercel en pantalla en lugar de fiarte de la IP de esta
tabla: es la que publica hoy, pero es suya y puede cambiarla.

Propagación: minutos. Comprobar con:

```bash
curl -sI https://krahegwen.com | head -3
```

## 3. Después

Nada de esto es obligatorio, pero es lo que queda por hacer.

- **Google Search Console**: añadir la propiedad y enviar
  `https://krahegwen.com/sitemap.xml`. El sitemap ya declara `hreflang`
  recíproco entre `/` y `/en`.
- **LinkedIn**: al pegar el enlace saldrá la tarjeta de `public/og.png`. Si
  cambia y LinkedIn sigue enseñando la vieja, su
  [Post Inspector](https://www.linkedin.com/post-inspector/) fuerza el refresco.
- **El teléfono**: hoy no sale en ningún PDF, a propósito. Si lo quieres en el
  público, `identity.publishPhone: true` en `content/profile.ts` y
  `pnpm build && pnpm cv:pdf`.
- **El LinkedIn**: lo saqué de una búsqueda y coincide en nombre, empresa y rol,
  pero conviene que lo confirmes. Está en `identity.linkedin`.
- **Sentry en el navegador** cuesta ~50 KB gzip, un 31 % más de JavaScript, para
  cazar errores de front en una web de contenido. Si no te compensa, borra
  `sentry.client.config.ts`: el servidor —que es donde están los avisos y los
  errores de la API— sigue funcionando igual.

## Cuando cambie el CV

`content/profile.ts` es el único fichero que hay que tocar. Después:

```bash
pnpm test && pnpm build && pnpm cv:pdf && pnpm og
```

Y commit. Los PDF y las tarjetas van versionados porque Vercel no tiene Chrome
para generarlos; por eso se hacen en local.
