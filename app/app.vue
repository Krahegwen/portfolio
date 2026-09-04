<script setup lang="ts">
import { identity, tagline } from '~~/content/profile'

const { locale, alternatePath, t } = useLocale()
const route = useRoute()

/**
 * Una sola forma de escribir cada URL. La portada es `.../` con barra, y ese
 * mismo texto es el que va en el canonical, en los `hreflang` y en el sitemap:
 * si el canonical dice `krahegwen.com` y el alternate dice `krahegwen.com/`,
 * Google los cuenta como dos páginas y reparte la señal entre ambas.
 */
function absolute(path: string) {
  return `${identity.site}${path === '/' ? '/' : path}`
}

const canonical = computed(() => absolute(route.path))

/**
 * Los dos idiomas se declaran siempre, el propio incluido. Un `hreflang` sin
 * autorreferencia no forma grupo y Google descarta el conjunto entero.
 */
const alternates = computed(() => {
  const self = canonical.value
  const other = absolute(alternatePath.value)
  return locale.value === 'es'
    ? { es: self, en: other }
    : { es: other, en: self }
})

const ogImage = computed(() => `${identity.site}/og${locale.value === 'en' ? '-en' : ''}.png`)

/**
 * Tarjeta de respaldo para el enlace compartido (Discord, WhatsApp, Slack…).
 *
 * Estaba a medias: había imagen, pero ni `og:title` ni `og:description`, así que
 * las rutas que no las fijan —las hojas de impresión y la página de error—
 * salían con la imagen correcta y sin una línea de texto. Y las que sí ponían
 * título tampoco declaraban `og:url` ni el tamaño de la imagen, que es lo que
 * evita que el scraper la descargue para averiguarlo.
 *
 * El texto por defecto es el de la portada porque es lo que describe el sitio
 * entero. Las páginas que tienen algo mejor que decir lo sobrescriben por
 * clave, que es como ya funcionaba la imagen.
 */
const fallback = computed(() => ({
  title: `${identity.name} — ${t(identity.title)}`,
  description: t(tagline),
}))

useHead(() => ({
  htmlAttrs: { lang: locale.value },
  meta: [
    // Respaldo para cualquier página que no fije la suya. Las páginas que sí lo
    // hacen sobrescriben esta por tener la misma clave.
    { property: 'og:title', content: fallback.value.title },
    { property: 'og:description', content: fallback.value.description },
    { property: 'og:type', content: 'website' },
    // La canónica ya está calculada arriba: og:url tiene que decir lo mismo que
    // el <link rel=canonical> o el scraper y el buscador cuentan dos páginas.
    { property: 'og:url', content: canonical.value },
    { property: 'og:locale', content: locale.value === 'es' ? 'es_ES' : 'en_GB' },
    { property: 'og:locale:alternate', content: locale.value === 'es' ? 'en_GB' : 'es_ES' },
    { property: 'og:image', content: ogImage.value },
    { property: 'og:image:type', content: 'image/png' },
    // Sin las medidas, WhatsApp y Slack se bajan el PNG entero antes de decidir
    // si la tarjeta es grande o un cuadradito, y a veces se rinden antes.
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: fallback.value.title },
    { property: 'og:site_name', content: identity.name },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: ogImage.value },
  ],
  link: [
    { rel: 'canonical', href: canonical.value },
    { rel: 'alternate', hreflang: 'es', href: alternates.value.es },
    { rel: 'alternate', hreflang: 'en', href: alternates.value.en },
    { rel: 'alternate', hreflang: 'x-default', href: alternates.value.es },
  ],
  script: [
    // Antes del primer pintado, para que no haya destello de tema equivocado.
    {
      innerHTML: `try{var t=localStorage.getItem('kw-theme');if(t==='light')document.documentElement.dataset.theme='light'}catch(e){}`,
      tagPosition: 'head',
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': identity.name,
        'url': identity.site,
        'email': `mailto:${identity.email}`,
        'jobTitle': identity.title[locale.value],
        'address': { '@type': 'PostalAddress', 'addressRegion': 'Cantabria', 'addressCountry': 'ES' },
        'sameAs': [identity.github],
      }),
    },
  ],
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Transición entre páginas: corta, para que no se lea como espera. */
.page-enter-active,
.page-leave-active { transition: opacity 0.28s var(--ease-out), transform 0.28s var(--ease-out); }
.page-enter-from { opacity: 0; transform: translateY(10px); }
.page-leave-to { opacity: 0; }
</style>
