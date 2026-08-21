<script setup lang="ts">
import { identity } from '~~/content/profile'

const { locale, t, localePath } = useLocale()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="ftr">
    <div class="shell ftr__inner">
      <div class="ftr__brand">
        <p class="serif ftr__name">{{ identity.name }}</p>
        <p class="mono ftr__meta">{{ t(identity.location) }} · {{ t(identity.title) }}</p>
      </div>

      <nav class="ftr__links" :aria-label="locale === 'es' ? 'Enlaces' : 'Links'">
        <a :href="`mailto:${identity.email}`">{{ identity.email }}</a>
        <a :href="identity.github" rel="me noopener" target="_blank">GitHub · {{ identity.handle }}</a>
        <NuxtLink :to="localePath('/cv')">{{ t({ es: 'CV completo', en: 'Full CV' }) }}</NuxtLink>
      </nav>
    </div>

    <div class="shell ftr__base mono">
      <span>© {{ year }} {{ identity.name }}</span>
      <span>{{ t({ es: 'Nuxt 4 · GSAP · prerenderizado en Vercel', en: 'Nuxt 4 · GSAP · prerendered on Vercel' }) }}</span>
    </div>
  </footer>
</template>

<style scoped>
.ftr {
  margin-top: auto;
  padding-block: clamp(3rem, 2rem + 4vw, 5rem) 2rem;
  border-top: 1px solid var(--line);
  background:
    radial-gradient(120% 140% at 50% 0%, var(--accent-glow), transparent 55%),
    var(--ink-800);
}

.ftr__inner {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
  align-items: flex-start;
}

.ftr__name { font-size: var(--step-3); }
.ftr__meta { color: var(--fg-faint); margin-top: 0.4rem; }

.ftr__links {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  align-items: flex-start;
  font-size: 0.95rem;
}

.ftr__links a { text-decoration: none; color: var(--fg-dim); }
.ftr__links a:hover { color: var(--accent); }

.ftr__base {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  justify-content: space-between;
  margin-top: clamp(2.5rem, 2rem + 3vw, 4rem);
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
  color: var(--fg-faint);
  font-size: 0.72rem;
}
</style>
