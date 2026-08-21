<template>
  <div class="app">
    <a class="skip" href="#main">{{ locale === 'es' ? 'Saltar al contenido' : 'Skip to content' }}</a>
    <SiteHeader />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
const { locale } = useLocale()
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
}

#main { flex: 1; }

.skip {
  position: absolute;
  top: -100px;
  left: var(--gutter);
  z-index: 100;
  padding: 0.7rem 1.1rem;
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-decoration: none;
  transition: top 0.2s var(--ease-out);
}

.skip:focus { top: 1rem; color: var(--accent-ink); }
</style>
