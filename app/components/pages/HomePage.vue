<script setup lang="ts">
import { identity, tagline } from '~~/content/profile'

const { t } = useLocale()

const title = computed(() => `${identity.name} — ${t(identity.title)}`)
const description = computed(() => t(tagline) + ' ' + t({
  es: 'Casi una década de front-end: ERPs industriales, experiencias 3D con Babylon.js y sistemas propios en producción.',
  en: 'Close to a decade of front-end: industrial ERPs, 3D experiences with Babylon.js and personal systems in production.',
}))

/*
 * La imagen, la URL, el idioma y las medidas las pone `app.vue` para todas las
 * páginas, y aquí salían idénticas: lo que esta página tiene de propio es el
 * texto y el `og:type`, que es `profile` y no `website` porque la portada
 * describe a una persona.
 */
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'profile',
})
</script>

<template>
  <div>
    <SectionsHeroSection />
    <SectionsAboutSection />
    <SectionsTimelineSection />
    <SectionsSkillsSection />
    <SectionsProjectsSection />
    <SectionsContactSection />
  </div>
</template>
