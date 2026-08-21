<script setup lang="ts">
/**
 * Envoltorio de las páginas que se imprimen a PDF: sin cabecera, sin pie y sin
 * fondos oscuros. El tema claro se fuerza aquí y no se deja a la preferencia del
 * usuario — el PDF es un artefacto fijo, no una vista más.
 */
useHead({
  htmlAttrs: { 'data-theme': 'light' },
  // Estas rutas existen solo para generar los PDF. No deben indexarse.
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<template>
  <div class="sheet">
    <slot />
  </div>
</template>

<style>
/* Sin `scoped`: hay que alcanzar body y la capa de grano global. */
.sheet {
  --shell: 100%;

  padding: 0;
  background: #fff;
  color: #16181c;
}

body:has(.sheet) {
  background: #fff;
  color: #16181c;
}

body:has(.sheet)::before { display: none; }

@page {
  size: A4;
  margin: 13mm 12mm;
}

@media print {
  .sheet { padding: 0; }

  /* Un encabezado al final de la página, con su contenido en la siguiente, es
     el defecto más habitual de un CV impreso. */
  .sheet h2,
  .sheet h3 { break-after: avoid; }

  .sheet .cv__block,
  .sheet .cv__job,
  .sheet .cv__edu,
  .sheet .cv__skill-group { break-inside: avoid; }

  .sheet a { color: inherit; text-decoration: none; }
}
</style>
