<script setup lang="ts">
// `definePageMeta` es una macro del compilador y solo surte efecto en un fichero
// de `pages/`: dentro del componente no hacía nada y las hojas salían con la
// cabecera del sitio impresa encima — incluido el alias, en el CV anónimo.
definePageMeta({ layout: 'print' })
</script>

<template>
  <PagesPrintCvPage />
</template>
