<script setup lang="ts">
import { identity, tagline } from '~~/content/profile'

const { locale, t } = useLocale()

const title = computed(() => `${identity.name} — ${t(identity.title)}`)
const description = computed(() => t(tagline) + ' ' + t({
  es: 'Casi una década de front-end: ERPs industriales, experiencias 3D con Babylon.js y sistemas propios en producción.',
  en: 'Close to a decade of front-end: industrial ERPs, 3D experiences with Babylon.js and personal systems in production.',
}))

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'profile',
  ogUrl: () => `${identity.site}${locale.value === 'en' ? '/en' : ''}`,
  ogLocale: () => (locale.value === 'es' ? 'es_ES' : 'en_GB'),
  ogImage: () => `${identity.site}/og${locale.value === 'en' ? '-en' : ''}.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: () => `${identity.name} — ${t(identity.title)}`,
  twitterCard: 'summary_large_image',
  twitterImage: () => `${identity.site}/og${locale.value === 'en' ? '-en' : ''}.png`,
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
