<script setup lang="ts">
import { identity } from '~~/content/profile'
import { projects } from '~~/content/projects'

const { t } = useLocale()
const route = useRoute()
const base = useProjectsBase()
const { track } = useMotionScope()
const root = ref<HTMLElement | null>(null)

const project = computed(() => projects.find(p => p.slug === route.params.slug))

// Un slug inventado tiene que dar 404 de verdad, no una página vacía con marco.
if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const siblings = computed(() => {
  const index = projects.findIndex(p => p.slug === project.value!.slug)
  return {
    prev: index > 0 ? projects[index - 1] : null,
    next: index < projects.length - 1 ? projects[index + 1] : null,
  }
})

const statusLabel = computed(() => t({
  live: { es: 'en producción', en: 'live' },
  active: { es: 'en desarrollo', en: 'in progress' },
  archived: { es: 'archivado', en: 'archived' },
}[project.value!.status]))

onMounted(() => {
  const scope = root.value
  if (!scope) return
  track(revealOnScroll(scope.querySelectorAll('[data-reveal]'), { y: 26, stagger: 0.08 }))
  track(parallax(scope.querySelector('.pd__glow'), 0.3, scope))
})

const title = computed(() => `${project.value!.name} — ${identity.name}`)
const description = computed(() => t(project.value!.summary))

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <article v-if="project" ref="root" class="pd" :style="{ '--hue': project.hue }">
    <div class="pd__glow" aria-hidden="true" />

    <header class="pd__head">
      <div class="shell">
        <NuxtLink :to="base" class="pd__back mono">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 8H3M7 4 3 8l4 4" />
          </svg>
          {{ t({ es: 'proyectos', en: 'projects' }) }}
        </NuxtLink>

        <p data-reveal class="pd__badges">
          <span class="pd__badge">{{ project.year }}</span>
          <span class="pd__badge" :class="`is-${project.status}`">{{ statusLabel }}</span>
          <span class="pd__badge">
            {{ project.visibility === 'public'
              ? t({ es: 'código abierto', en: 'open source' })
              : t({ es: 'repo privado', en: 'private repo' }) }}
          </span>
        </p>

        <h1 data-reveal class="pd__title serif">
          {{ project.name }}
        </h1>
        <p data-reveal class="pd__tagline">
          {{ t(project.tagline) }}
        </p>

        <div data-reveal class="pd__links">
          <a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener" class="pd__link pd__link--solid">
            {{ t({ es: 'Verlo funcionando', en: 'See it running' }) }}
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h7v7M13 3 4 12" />
            </svg>
          </a>
          <a v-if="project.repo" :href="project.repo" target="_blank" rel="noopener" class="pd__link">
            {{ t({ es: 'Código', en: 'Source' }) }}
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h7v7M13 3 4 12" />
            </svg>
          </a>
        </div>
      </div>
    </header>

    <div class="shell pd__body">
      <div class="pd__prose">
        <p data-reveal class="pd__summary">
          {{ t(project.summary) }}
        </p>
        <p v-for="(para, i) in project.body" :key="i" data-reveal class="pd__para">
          {{ t(para) }}
        </p>
      </div>

      <aside class="pd__side">
        <div data-reveal class="pd__panel">
          <h2 class="eyebrow">
            {{ t({ es: 'Stack', en: 'Stack' }) }}
          </h2>
          <ul class="pd__stack">
            <li v-for="tech in project.stack" :key="tech" class="mono">
              {{ tech }}
            </li>
          </ul>
        </div>

        <div v-if="project.metrics" data-reveal class="pd__panel">
          <h2 class="eyebrow">
            {{ t({ es: 'En cifras', en: 'By the numbers' }) }}
          </h2>
          <dl class="pd__metrics">
            <div v-for="metric in project.metrics" :key="metric.label.es">
              <dt>{{ t(metric.label) }}</dt>
              <dd class="serif">
                {{ metric.value }}
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>

    <nav class="shell pd__nav" :aria-label="t({ es: 'Otros proyectos', en: 'Other projects' })">
      <NuxtLink v-if="siblings.prev" :to="`${base}/${siblings.prev.slug}`" class="pd__sib">
        <span class="mono">← {{ t({ es: 'anterior', en: 'previous' }) }}</span>
        <b>{{ siblings.prev.name }}</b>
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="siblings.next" :to="`${base}/${siblings.next.slug}`" class="pd__sib pd__sib--next">
        <span class="mono">{{ t({ es: 'siguiente', en: 'next' }) }} →</span>
        <b>{{ siblings.next.name }}</b>
      </NuxtLink>
    </nav>
  </article>
</template>

<style scoped>
.pd { position: relative; overflow: clip; }

.pd__glow {
  position: absolute;
  top: -10%;
  right: -12%;
  width: min(60vw, 720px);
  aspect-ratio: 1;
  background: radial-gradient(circle, hsl(var(--hue) 85% 55% / 16%), transparent 62%);
  filter: blur(30px);
  pointer-events: none;
}

.pd__head {
  position: relative;
  z-index: 1;
  padding-block: clamp(2rem, 1.5rem + 2vw, 3rem) clamp(2.5rem, 2rem + 3vw, 4rem);
  border-bottom: 1px solid var(--line);
}

.pd__back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 2.25rem;
  color: var(--fg-faint);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.68rem;
}

.pd__back:hover { color: var(--accent); }
.pd__back svg { transition: transform 0.3s var(--ease-out); }
.pd__back:hover svg { transform: translateX(-3px); }

.pd__badges { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.pd__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.63rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fg-faint);
}

.pd__badge.is-live { color: hsl(150 70% 55%); border-color: hsl(150 70% 55% / 35%); }
.pd__badge.is-active { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

.pd__title { font-size: var(--step-7); margin-top: 1.1rem; }

.pd__tagline {
  max-width: 40ch;
  margin-top: 1rem;
  font-size: var(--step-2);
  font-weight: 300;
  color: hsl(var(--hue) 55% 68%);
}

.pd__links { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 2rem; }

.pd__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.2rem;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.3s var(--ease-out), border-color 0.3s, background 0.3s, color 0.3s;
}

.pd__link:hover { transform: translateY(-2px); border-color: hsl(var(--hue) 85% 58%); color: hsl(var(--hue) 85% 62%); }

.pd__link--solid {
  border-color: transparent;
  background: hsl(var(--hue) 85% 58%);
  color: #0a0a0a;
}

.pd__link--solid:hover { color: #0a0a0a; border-color: transparent; filter: brightness(1.08); }

.pd__body {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  gap: clamp(2rem, 1.5rem + 3vw, 4.5rem);
  padding-block: clamp(3rem, 2.5rem + 3vw, 5rem);
}

.pd__summary {
  font-size: var(--step-2);
  font-weight: 300;
  line-height: 1.5;
  margin-bottom: 1.85rem;
}

.pd__para {
  max-width: var(--measure);
  margin-bottom: 1.5rem;
  color: var(--fg-dim);
}

.pd__side { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 96px; align-self: start; }

.pd__panel {
  padding: 1.4rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.pd__panel .eyebrow { display: block; margin-bottom: 1rem; color: hsl(var(--hue) 70% 62%); }

.pd__stack { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0; padding: 0; list-style: none; }

.pd__stack li {
  padding: 0.22rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  font-size: 0.68rem;
  color: var(--fg-dim);
}

.pd__metrics { display: flex; flex-direction: column; gap: 0.85rem; margin: 0; }

.pd__metrics div { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }

.pd__metrics dt {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fg-faint);
}

.pd__metrics dd { margin: 0; font-size: var(--step-2); color: var(--fg); }

.pd__nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-block: clamp(2rem, 1.5rem + 2vw, 3rem) clamp(3.5rem, 3rem + 3vw, 5.5rem);
  border-top: 1px solid var(--line);
}

.pd__sib {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.15rem 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  text-decoration: none;
  transition: border-color 0.3s var(--ease-out), background 0.3s;
}

.pd__sib:hover { border-color: var(--accent); background: var(--surface); color: inherit; }
.pd__sib span { color: var(--fg-faint); font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; }
.pd__sib b { font-size: var(--step-1); font-weight: 500; }
.pd__sib--next { text-align: right; }

@media (max-width: 900px) {
  .pd__body { grid-template-columns: 1fr; }
  .pd__side { position: static; }
}

@media (max-width: 560px) {
  .pd__nav { grid-template-columns: 1fr; }
  .pd__sib--next { text-align: left; }
}
</style>
