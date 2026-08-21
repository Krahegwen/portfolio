<script setup lang="ts">
import { identity } from '~~/content/profile'

const { locale, alternatePath } = useLocale()
const route = useRoute()

const canonical = computed(() => `${identity.site}${route.path === '/' ? '' : route.path}`)

useHead(() => ({
  htmlAttrs: { lang: locale.value },
  meta: [
    // Respaldo para cualquier página que no fije la suya. Las páginas que sí lo
    // hacen sobrescriben esta por tener la misma clave.
    { property: 'og:image', content: `${identity.site}/og${locale.value === 'en' ? '-en' : ''}.png` },
    { property: 'og:site_name', content: identity.name },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: `${identity.site}/og${locale.value === 'en' ? '-en' : ''}.png` },
  ],
  link: [
    { rel: 'canonical', href: canonical.value },
    { rel: 'alternate', hreflang: locale.value === 'es' ? 'en' : 'es', href: `${identity.site}${alternatePath.value}` },
    { rel: 'alternate', hreflang: 'x-default', href: identity.site },
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
