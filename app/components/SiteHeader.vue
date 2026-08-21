<script setup lang="ts">
import { identity } from '~~/content/profile'

const { locale, t, localePath, alternatePath } = useLocale()
const { theme, toggle } = useTheme()

const scrolled = ref(false)
const open = ref(false)

const nav = computed(() => [
  { to: localePath('/'), label: t({ es: 'Inicio', en: 'Home' }) },
  { to: locale.value === 'en' ? '/en/projects' : '/proyectos', label: t({ es: 'Proyectos', en: 'Projects' }) },
  { to: localePath('/cv'), label: 'CV' },
])

function onScroll() { scrolled.value = window.scrollY > 24 }

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// Cerrar el menú al navegar: si no, en móvil el panel tapa la página nueva.
watch(() => useRoute().fullPath, () => { open.value = false })
</script>

<template>
  <header class="hdr" :class="{ 'is-scrolled': scrolled, 'is-open': open }">
    <div class="hdr__inner shell">
      <NuxtLink :to="localePath('/')" class="mark" :aria-label="identity.name">
        <span class="mark__glyph">{{ identity.initials }}</span>
        <span class="mark__text">{{ identity.handle }}</span>
      </NuxtLink>

      <nav class="nav" :aria-label="locale === 'es' ? 'Principal' : 'Main'">
        <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="nav__link">
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="tools">
        <NuxtLink :to="alternatePath" class="tool tool--lang" :aria-label="locale === 'es' ? 'Read in English' : 'Leer en español'">
          <span :class="{ 'is-on': locale === 'es' }">ES</span>
          <i />
          <span :class="{ 'is-on': locale === 'en' }">EN</span>
        </NuxtLink>

        <button
          class="tool tool--theme"
          type="button"
          :aria-label="locale === 'es' ? 'Cambiar tema' : 'Toggle theme'"
          :aria-pressed="theme === 'light'"
          @click="toggle"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <template v-if="theme === 'dark'">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2.6v2.2M12 19.2v2.2M4.3 4.3l1.6 1.6M18.1 18.1l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.3 19.7l1.6-1.6M18.1 5.9l1.6-1.6" />
            </template>
            <path v-else d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
          </svg>
        </button>

        <button
          class="burger"
          type="button"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          :aria-label="locale === 'es' ? 'Menú' : 'Menu'"
          @click="open = !open"
        >
          <i /><i /><i />
        </button>
      </div>
    </div>

    <div id="mobile-nav" class="drawer" :hidden="!open">
      <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="drawer__link">
        {{ item.label }}
      </NuxtLink>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid transparent;
  transition: background 0.35s var(--ease-out), border-color 0.35s var(--ease-out), backdrop-filter 0.35s;
}

.hdr.is-scrolled,
.hdr.is-open {
  background: color-mix(in srgb, var(--ink-900) 82%, transparent);
  backdrop-filter: blur(14px) saturate(1.3);
  border-bottom-color: var(--line);
}

.hdr__inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 66px;
}

.mark {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.mark__glyph {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--line-strong);
  border-radius: 7px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  color: var(--accent);
  transition: border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
}

.mark:hover .mark__glyph { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-glow); }
.mark:hover { color: inherit; }

.mark__text { font-size: 0.95rem; }

.nav {
  display: flex;
  gap: 0.35rem;
  margin-inline: auto;
}

.nav__link {
  position: relative;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-size: 0.92rem;
  text-decoration: none;
  color: var(--fg-dim);
  transition: color 0.25s var(--ease-out);
}

.nav__link::after {
  content: '';
  position: absolute;
  inset-inline: 0.85rem;
  bottom: 0.15rem;
  height: 1px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s var(--ease-out);
}

.nav__link:hover { color: var(--fg); }
.nav__link:hover::after,
.nav__link.router-link-active::after { transform: scaleX(1); }
.nav__link.router-link-active { color: var(--fg); }

.tools { display: flex; align-items: center; gap: 0.5rem; }

.tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--fg-dim);
  text-decoration: none;
  transition: border-color 0.25s var(--ease-out), color 0.25s var(--ease-out);
}

.tool:hover { border-color: var(--line-strong); color: var(--fg); }

.tool--lang {
  gap: 0.4rem;
  padding-inline: 0.7rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.tool--lang span { opacity: 0.45; transition: opacity 0.25s, color 0.25s; }
.tool--lang span.is-on { opacity: 1; color: var(--accent); }
.tool--lang i { width: 1px; height: 11px; background: var(--line-strong); }

.tool--theme { width: 32px; }

.burger {
  display: none;
  flex-direction: column;
  gap: 4px;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.burger i {
  width: 13px;
  height: 1.5px;
  background: var(--fg-dim);
  border-radius: 2px;
  transition: transform 0.3s var(--ease-out), opacity 0.2s;
}

.hdr.is-open .burger i:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
.hdr.is-open .burger i:nth-child(2) { opacity: 0; }
.hdr.is-open .burger i:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

.drawer {
  display: none;
  flex-direction: column;
  padding: 0.5rem var(--gutter) 1.25rem;
  border-top: 1px solid var(--line);
}

.drawer__link {
  padding: 0.85rem 0.25rem;
  border-bottom: 1px solid var(--line);
  font-size: var(--step-1);
  text-decoration: none;
}

@media (max-width: 720px) {
  .nav { display: none; }
  .burger { display: flex; }
  .drawer:not([hidden]) { display: flex; }
  .mark__text { display: none; }
}
</style>
