<script setup lang="ts">
import type { Project } from '~~/content/projects'

const props = defineProps<{ project: Project, index: number }>()

const { t } = useLocale()
const base = useProjectsBase()

const card = ref<HTMLElement | null>(null)
const tilt = reactive({ x: 0, y: 0 })

const statusLabel = computed(() => t({
  live: { es: 'en producción', en: 'live' },
  active: { es: 'en desarrollo', en: 'in progress' },
  archived: { es: 'archivado', en: 'archived' },
}[props.project.status]))

/**
 * Inclinación con el puntero. Se calcula sobre el rect del propio elemento,
 * no sobre la ventana, para que funcione igual dentro de una rejilla.
 */
function onMove(event: PointerEvent) {
  if (prefersReducedMotion()) return
  const el = card.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  tilt.x = ((event.clientY - rect.top) / rect.height - 0.5) * -7
  tilt.y = ((event.clientX - rect.left) / rect.width - 0.5) * 7
}

function onLeave() { tilt.x = 0; tilt.y = 0 }
</script>

<template>
  <article
    ref="card"
    class="pc"
    :style="{
      '--hue': project.hue,
      '--tilt-x': `${tilt.x}deg`,
      '--tilt-y': `${tilt.y}deg`,
    }"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <NuxtLink :to="`${base}/${project.slug}`" class="pc__hit">
      <span class="visually-hidden">{{ project.name }}</span>
    </NuxtLink>

    <div class="pc__inner">
      <header class="pc__head">
        <span class="pc__index mono">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="pc__badges">
          <span class="pc__badge" :class="`is-${project.status}`">{{ statusLabel }}</span>
          <span v-if="project.visibility === 'private'" class="pc__badge pc__badge--muted">
            {{ t({ es: 'repo privado', en: 'private repo' }) }}
          </span>
        </span>
      </header>

      <h3 class="pc__name serif">
        {{ project.name }}
      </h3>
      <p class="pc__tagline">
        {{ t(project.tagline) }}
      </p>
      <p class="pc__summary">
        {{ t(project.summary) }}
      </p>

      <ul v-if="project.metrics" class="pc__metrics">
        <li v-for="metric in project.metrics" :key="metric.label.es">
          <b>{{ metric.value }}</b>
          <span>{{ t(metric.label) }}</span>
        </li>
      </ul>

      <footer class="pc__foot">
        <ul class="pc__stack">
          <li v-for="tech in project.stack.slice(0, 5)" :key="tech" class="mono">
            {{ tech }}
          </li>
          <li v-if="project.stack.length > 5" class="mono pc__more">
            +{{ project.stack.length - 5 }}
          </li>
        </ul>
        <span class="pc__go" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.pc {
  position: relative;
  isolation: isolate;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    radial-gradient(120% 90% at 12% 0%, hsl(var(--hue) 85% 55% / 9%), transparent 58%),
    var(--surface);
  transition: border-color 0.4s var(--ease-out), background 0.4s var(--ease-out), transform 0.5s var(--ease-out);
  transform: perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transform-style: preserve-3d;
}

.pc:hover {
  border-color: hsl(var(--hue) 85% 58% / 45%);
  background:
    radial-gradient(120% 90% at 12% 0%, hsl(var(--hue) 85% 55% / 15%), transparent 62%),
    var(--surface-2);
}

/* El enlace cubre la tarjeta: toda la caja es clicable sin anidar un <a> en cada texto. */
.pc__hit { position: absolute; inset: 0; z-index: 3; border-radius: inherit; }

.pc__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: clamp(1.4rem, 1.1rem + 1.1vw, 2rem);
  transform: translateZ(24px);
}

.pc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.pc__index { color: hsl(var(--hue) 85% 62%); font-size: 0.72rem; }

.pc__badges { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.pc__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.16rem 0.55rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  color: var(--fg-faint);
  text-transform: uppercase;
}

.pc__badge.is-live { color: hsl(150 70% 55%); border-color: hsl(150 70% 55% / 35%); }
.pc__badge.is-live::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentcolor; }
.pc__badge.is-active { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

.pc__name { font-size: var(--step-4); line-height: 1; }

.pc__tagline {
  margin-top: 0.6rem;
  font-size: 0.95rem;
  color: hsl(var(--hue) 60% 66%);
}

.pc__summary {
  margin-top: 1rem;
  font-size: 0.93rem;
  color: var(--fg-dim);
}

.pc__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.75rem;
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.pc__metrics li { display: flex; flex-direction: column; }

.pc__metrics b {
  font-family: var(--font-serif);
  font-size: var(--step-2);
  font-weight: 400;
  line-height: 1.1;
  color: var(--fg);
}

.pc__metrics span {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-faint);
}

.pc__foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1.75rem;
}

.pc__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pc__stack li {
  padding: 0.16rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  font-size: 0.64rem;
  color: var(--fg-faint);
}

.pc__more { color: hsl(var(--hue) 70% 60%) !important; }

.pc__go {
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--fg-faint);
  transition: transform 0.35s var(--ease-out), border-color 0.35s, color 0.35s, background 0.35s;
}

.pc:hover .pc__go {
  transform: translateX(3px);
  border-color: transparent;
  background: hsl(var(--hue) 85% 58%);
  color: #0a0a0a;
}
</style>
