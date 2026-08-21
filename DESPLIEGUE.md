# Poner esto en marcha

Lo único que queda son dos pasos con cuenta propia —Vercel y Cloudflare— que no
se pueden automatizar desde aquí. Diez minutos.

## 1. Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** →
   `Krahegwen/portfolio`.
2. Vercel detecta Nuxt solo. Lo único que hay que tocar:
   - **Node.js Version → 22.x** (Settings → General). El `.nvmrc` dice 22 y
     conviene que Vercel diga lo mismo; si no, cualquier fallo de build acaba
     costando media hora de buscar dónde no coincide.
   - Install/Build ya vienen de `vercel.json` (`pnpm install --frozen-lockfile`
     y `pnpm build`).
3. **Deploy**. Sale en `<algo>.vercel.app` — compruébalo antes de tocar el DNS.

No hay variables de entorno. No hay funciones. El build prerrenderiza las 20
rutas y Vercel sirve estáticos.

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

## Cuando cambie el CV

`content/profile.ts` es el único fichero que hay que tocar. Después:

```bash
pnpm test && pnpm build && pnpm cv:pdf && pnpm og
```

Y commit. Los PDF y las tarjetas van versionados porque Vercel no tiene Chrome
para generarlos; por eso se hacen en local.
