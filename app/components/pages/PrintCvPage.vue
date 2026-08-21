<script setup lang="ts">
import type { CvVariant } from '~~/content/profile'
import { identity } from '~~/content/profile'

/**
 * La hoja que Chrome convierte en PDF. Un componente por variante y por idioma,
 * resuelto desde la ruta, para que `scripts/build-cv-pdfs.mjs` solo tenga que
 * visitar seis URLs estáticas.
 */

const route = useRoute()
const VALID: CvVariant[] = ['recruiter', 'anon', 'accenture']

const variant = computed<CvVariant>(() => {
  const value = route.params.variant as string
  return VALID.includes(value as CvVariant) ? (value as CvVariant) : 'recruiter'
})

if (!VALID.includes(route.params.variant as CvVariant)) {
  throw createError({ statusCode: 404, statusMessage: 'Unknown CV variant', fatal: true })
}
</script>

<template>
  <!-- El teléfono, si se publica, va solo en el PDF público: es el único de los
       tres destinatarios que necesita un canal directo. Ver `publishPhone` en
       content/profile.ts, que por defecto lo deja fuera. -->
  <CvDocument
    :variant="variant"
    :include-phone="identity.publishPhone && variant === 'recruiter'"
  />
</template>
