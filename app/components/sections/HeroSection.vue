<script setup lang="ts">
import { identity, tagline } from '~~/content/profile'
import { yearsSince } from '~/utils/dates'

const { locale, t, localePath } = useLocale()
const { track } = useMotionScope()

const root = ref<HTMLElement | null>(null)
const years = yearsSince(identity.careerStart)

/** El nombre se parte en caracteres para poder escalonar la entrada. */
const nameChars = computed(() =>
  identity.name.split(' ').map(word => ({ word, chars: word.split('') })),
)

onMounted(() => {
  const { gsap } = useGsap()
  const scope = root.value
  if (!scope) return

  if (prefersReducedMotion()) {
    gsap.set(scope.querySelectorAll('[data-anim]'), { opacity: 1, y: 0 })
    return
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.from(scope.querySelectorAll('.hero__char'), {
    yPercent: 108,
    duration: 1.05,
    stagger: { each: 0.026, from: 'start' },
  })
    .from(scope.querySelector('.hero__eyebrow'), { opacity: 0, y: 14, duration: 0.7 }, 0.15)
    .from(scope.querySelector('.hero__lede'), { opacity: 0, y: 22, duration: 0.9 }, '-=0.55')
    .from(scope.querySelectorAll('.hero__cta > *'), { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 }, '-=0.6')
    .from(scope.querySelectorAll('.hero__facts li'), { opacity: 0, y: 16, duration: 0.7, stagger: 0.07 }, '-=0.5')
    .from(scope.querySelector('.hero__scroll'), { opacity: 0, duration: 0.8 }, '-=0.3')

  // El bloque de texto sube un poco más lento que la página: profundidad sin
  // pinchar la sección, que en móvil da más problemas de los que resuelve.
  track(parallax(scope.querySelector('.hero__copy'), -0.18, scope))
  track(parallax(scope.querySelector('.hero__canvas'), 0.28, scope))
})
</script>

<template>
  <section ref="root" class="hero">
    <div class="hero__canvas">
      <UiFieldCanvas />
    </div>

    <div class="shell hero__copy">
      <p class="eyebrow hero__eyebrow">
        {{ t(identity.location) }} · {{ t({ es: 'disponible para hablar', en: 'open to conversations' }) }}
      </p>

      <h1 class="hero__name">
        <span v-for="(entry, wi) in nameChars" :key="wi" class="hero__word">
          <span
            v-for="(char, ci) in entry.chars"
            :key="ci"
            class="hero__char-wrap"
          ><span class="hero__char">{{ char }}</span></span>
        </span>
      </h1>

      <p class="hero__lede">
        <span class="hero__role">{{ t(identity.title) }}</span>
        {{ t(tagline) }}
      </p>

      <div class="hero__cta">
        <NuxtLink :to="localePath('/cv')" class="btn btn--solid">
          {{ t({ es: 'Ver el CV', en: 'View the CV' }) }}
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </NuxtLink>
        <NuxtLink :to="locale === 'en' ? '/en/projects' : '/proyectos'" class="btn btn--ghost">
          {{ t({ es: 'Lo que he construido', en: 'What I have built' }) }}
        </NuxtLink>
      </div>

      <ul class="hero__facts mono">
        <li><b>{{ years }}</b> {{ t({ es: 'años de profesión', en: 'years in the trade' }) }}</li>
        <li><b>{{ yearsSince(identity.vueStart) }}</b> {{ t({ es: 'con Vue', en: 'with Vue' }) }}</li>
        <li><b>{{ yearsSince(identity.xrStart) }}</b> {{ t({ es: 'en 3D y WebXR', en: 'in 3D and WebXR' }) }}</li>
      </ul>
    </div>

    <div class="hero__scroll mono" aria-hidden="true">
      <span>{{ t({ es: 'desplázate', en: 'scroll' }) }}</span>
      <i />
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: min(100svh, 900px);
  padding-block: clamp(5rem, 3rem + 10vw, 9rem) clamp(4rem, 2rem + 6vw, 7rem);
  overflow: clip;
}

.hero__canvas {
  position: absolute;
  inset: -12% 0 -12%;
  z-index: 0;
}

.hero__copy { position: relative; z-index: 2; }

.hero__eyebrow { margin-bottom: 1.6rem; }

.hero__name {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.3em;
  font-family: var(--font-serif);
  font-size: var(--step-7);
  font-weight: 400;
  line-height: 0.94;
  letter-spacing: -0.028em;
}

.hero__word { display: inline-flex; }

/* La ventana recorta el carácter; el carácter sube desde debajo de ella. */
.hero__char-wrap { display: inline-block; overflow: hidden; padding-block: 0.06em; }
.hero__char { display: inline-block; will-change: transform; }

.hero__lede {
  max-width: 48ch;
  margin-top: 1.75rem;
  font-size: var(--step-2);
  font-weight: 300;
  line-height: 1.45;
  color: var(--fg-dim);
}

.hero__role {
  display: block;
  color: var(--accent);
  font-weight: 500;
  font-size: var(--step-1);
  letter-spacing: 0.005em;
  margin-bottom: 0.35rem;
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 2.4rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.78rem 1.4rem;
  border-radius: 999px;
  font-size: 0.94rem;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.3s var(--ease-out), background 0.3s, border-color 0.3s, box-shadow 0.3s, color 0.3s;
}

.btn:hover { transform: translateY(-2px); }
.btn svg { transition: transform 0.3s var(--ease-out); }
.btn:hover svg { transform: translateX(3px); }

.btn--solid {
  background: var(--accent);
  color: var(--accent-ink);
  box-shadow: 0 8px 30px -12px var(--accent);
}

.btn--solid:hover { color: var(--accent-ink); box-shadow: 0 14px 38px -12px var(--accent); }

.btn--ghost {
  border: 1px solid var(--line-strong);
  color: var(--fg-dim);
}

.btn--ghost:hover { border-color: var(--accent); color: var(--accent); }

.hero__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 2rem;
  margin-top: 3rem;
  padding: 0;
  list-style: none;
  color: var(--fg-faint);
}

.hero__facts li { display: flex; align-items: baseline; gap: 0.4rem; }

.hero__facts b {
  font-family: var(--font-serif);
  font-size: var(--step-3);
  font-weight: 400;
  color: var(--fg);
  line-height: 1;
}

.hero__scroll {
  position: absolute;
  right: var(--gutter);
  bottom: 2rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--fg-faint);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hero__scroll i {
  width: 46px;
  height: 1px;
  background: var(--line-strong);
  position: relative;
  overflow: hidden;
}

.hero__scroll i::after {
  content: '';
  position: absolute;
  inset-block: 0;
  width: 14px;
  background: var(--accent);
  animation: sweep 2.4s var(--ease-in-out) infinite;
}

@keyframes sweep {
  0% { transform: translateX(-16px); }
  100% { transform: translateX(48px); }
}

@media (max-width: 720px) {
  .hero__scroll { display: none; }
  .hero__facts { gap: 0.5rem 1.4rem; }
}
</style>
