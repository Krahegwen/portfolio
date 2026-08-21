<script setup lang="ts">
import { education, identity, jobs } from '~~/content/profile'
import { formatDuration, formatRange, monthsBetween, parseMonth } from '~/utils/dates'

const { locale, t } = useLocale()
const { track } = useMotionScope()
const root = ref<HTMLElement | null>(null)

/**
 * La barra de cada etapa no es decorativa: su anchura es la fracción real de
 * carrera que ocupó, así que la de Accenture se ve larga porque *es* larga. El
 * total va de la primera fecha del CV hasta hoy, y se recalcula solo.
 */
const totalMonths = computed(() => monthsBetween(identity.careerStart, null))

const entries = computed(() =>
  jobs.map(job => ({
    ...job,
    range: formatRange(job.start, job.end, locale.value),
    duration: formatDuration(job.start, job.end, locale.value),
    weight: monthsBetween(job.start, job.end) / totalMonths.value,
    current: job.end === null,
    /** Los highlights con cliente se muestran sin nombrarlo: la web es pública. */
    visible: job.highlights,
  })),
)

const startYear = computed(() => parseMonth(identity.careerStart).getFullYear())

onMounted(() => {
  const scope = root.value
  if (!scope) return
  const { gsap } = useGsap()

  track(revealOnScroll(scope.querySelectorAll('.tl__item'), { y: 34, stagger: 0.1, start: 'top 88%' }))

  if (prefersReducedMotion()) {
    gsap.set(scope.querySelector('.tl__spine-fill'), { scaleY: 1 })
    return
  }

  // La espina se dibuja al ritmo del scroll de la propia lista.
  const fill = scope.querySelector('.tl__spine-fill')
  const list = scope.querySelector('.tl__list')
  if (fill && list) {
    const tween = gsap.fromTo(fill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top',
        scrollTrigger: { trigger: list, start: 'top 62%', end: 'bottom 78%', scrub: 0.6 },
      },
    )
    track(tween.scrollTrigger ?? null)
  }
})
</script>

<template>
  <section id="trayectoria" ref="root" class="section tl">
    <div class="shell">
      <UiSectionHead
        index="02"
        :eyebrow="t({ es: 'Trayectoria', en: 'Track record' })"
        :title="t({ es: 'Nueve años, cuatro etapas, una constante', en: 'Nine years, four chapters, one constant' })"
        :lede="t({
          es: 'Cada bloque ocupa en la barra lo que ocupó en el calendario. Los nombres de cliente no aparecen aquí a propósito: el CV público nunca los ha nombrado.',
          en: 'Each block takes up as much of the bar as it took of the calendar. Client names are deliberately absent: the public CV has never named them.',
        })"
      />

      <div class="tl__body">
        <div class="tl__spine" aria-hidden="true">
          <span class="tl__spine-track" />
          <span class="tl__spine-fill" />
        </div>

        <ol class="tl__list">
          <li v-for="entry in entries" :key="entry.id" class="tl__item" :style="{ '--weight': entry.weight }">
            <div class="tl__marker" aria-hidden="true">
              <span class="tl__dot" :class="{ 'is-current': entry.current }" />
            </div>

            <div class="tl__when">
              <p class="tl__range mono">
                {{ entry.range }}
              </p>
              <p class="tl__dur mono">
                {{ entry.duration }}
              </p>

              <!-- La proporción de carrera, en horizontal: se lee de un vistazo
                   y no compite con la espina vertical de la izquierda. -->
              <span
                class="tl__weight"
                :title="`${Math.round(entry.weight * 100)}% ${t({ es: 'de la carrera', en: 'of the career' })}`"
              >
                <span class="tl__weight-fill" />
              </span>
            </div>

            <article class="tl__card">
              <h3 class="tl__role">
                {{ t(entry.role) }}
              </h3>

              <p class="tl__company">
                <span class="tl__org">{{ entry.company }}</span>
                <span class="tl__sep">—</span>
                <span class="tl__loc">{{ t(entry.location) }}</span>
              </p>

              <ul class="tl__points">
                <li v-for="(point, i) in entry.visible" :key="i">
                  {{ t(point.text) }}
                </li>
              </ul>

              <ul class="tl__stack">
                <li v-for="tech in entry.stack" :key="tech" class="mono">
                  {{ tech }}
                </li>
              </ul>
            </article>
          </li>

          <li v-for="item in education" :key="item.id" class="tl__item tl__item--edu">
            <div class="tl__marker" aria-hidden="true">
              <span class="tl__dot tl__dot--hollow" />
            </div>

            <div class="tl__when">
              <p class="tl__range mono">
                {{ formatRange(item.start, item.end, locale) }}
              </p>
              <p class="tl__dur mono">
                {{ t({ es: 'formación', en: 'education' }) }}
              </p>
            </div>

            <article class="tl__card">
              <h3 class="tl__role">
                {{ t(item.title) }}
              </h3>
              <p class="tl__company">
                <span class="tl__org">{{ t(item.org) }}</span>
                <span class="tl__sep">—</span>
                <span class="tl__loc">{{ t(item.location) }}</span>
              </p>
              <ul class="tl__points">
                <li>{{ t(item.note) }}</li>
              </ul>
            </article>
          </li>
        </ol>
      </div>

      <p class="tl__foot mono">
        {{ startYear }} → {{ new Date().getFullYear() }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.tl { background: var(--ink-800); border-block: 1px solid var(--line); }

.tl__body { position: relative; }

.tl__spine {
  position: absolute;
  top: 0.6rem;
  bottom: 0.6rem;
  left: 5px;
  width: 2px;
}

.tl__spine-track,
.tl__spine-fill {
  position: absolute;
  inset: 0;
  border-radius: 2px;
}

.tl__spine-track { background: var(--line); }

.tl__spine-fill {
  background: linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 35%, transparent));
  transform-origin: top;
}

.tl__list {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tl__item {
  display: grid;
  grid-template-columns: 12px 210px minmax(0, 1fr);
  gap: clamp(1.25rem, 1rem + 1.5vw, 2.5rem);
  align-items: start;
}

.tl__when { padding-top: 0.15rem; }

.tl__marker { position: relative; display: flex; flex-direction: column; align-items: center; padding-top: 0.55rem; }

.tl__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ink-800) 92%, transparent), 0 0 0 5px var(--line);
  z-index: 1;
}

.tl__dot--hollow { background: var(--ink-800); border: 2px solid var(--fg-faint); }

.tl__dot.is-current::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  animation: ping 2.6s var(--ease-out) infinite;
}

@keyframes ping {
  0% { transform: scale(0.65); opacity: 0.9; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* La barra de peso: su anchura es la duración de la etapa sobre el total. */
.tl__weight {
  display: block;
  width: 100%;
  height: 2px;
  margin-top: 0.7rem;
  border-radius: 2px;
  background: var(--line);
  overflow: hidden;
}

.tl__weight-fill {
  display: block;
  width: calc(var(--weight, 0.2) * 100%);
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 25%, transparent));
}

.tl__card { padding-bottom: 0.5rem; }

.tl__range { color: var(--accent); }
.tl__dur { margin-top: 0.15rem; color: var(--fg-faint); }

.tl__role {
  font-size: var(--step-3);
  font-family: var(--font-serif);
  font-weight: 400;
}

.tl__company {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.35rem;
  font-size: 0.95rem;
  color: var(--fg-dim);
}

.tl__org { font-weight: 600; color: var(--fg); }
.tl__sep { color: var(--fg-faint); }

.tl__points {
  margin: 1.15rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.tl__points li {
  position: relative;
  padding-left: 1.35rem;
  color: var(--fg-dim);
  font-size: 0.97rem;
}

.tl__points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 8px;
  height: 1px;
  background: var(--accent);
}

.tl__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.6rem;
  margin: 1.35rem 0 0;
  padding: 0;
  list-style: none;
}

.tl__stack li {
  color: var(--fg-faint);
  font-size: 0.68rem;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--line);
  border-radius: 4px;
}

.tl__foot {
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
  color: var(--fg-faint);
  text-align: right;
}

/* Por debajo de este ancho la columna de fechas estrangula el texto: pasa a
   ir encima, y con ella la barra de peso. */
@media (max-width: 900px) {
  .tl__item { grid-template-columns: 12px minmax(0, 1fr); gap: 1.25rem; }
  .tl__when { grid-column: 2; margin-bottom: 0.85rem; }
  .tl__card { grid-column: 2; }
  .tl__weight { max-width: 260px; }
}

@media (max-width: 640px) {
  .tl__spine { display: none; }
}
</style>
