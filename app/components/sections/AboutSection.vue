<script setup lang="ts">
import { identity, industries, summary } from '~~/content/profile'
import { yearsSince } from '~/utils/dates'

const { t } = useLocale()
const { track } = useMotionScope()
const root = ref<HTMLElement | null>(null)

const stats = computed(() => [
  { value: yearsSince(identity.careerStart), label: t({ es: 'años de profesión', en: 'years in the trade' }), suffix: '' },
  { value: yearsSince(identity.vueStart), label: t({ es: 'años con Vue', en: 'years with Vue' }), suffix: '' },
  { value: 4, label: t({ es: 'proyectos propios vivos', en: 'personal projects live' }), suffix: '' },
  { value: 7, label: t({ es: 'sectores tocados', en: 'sectors worked in' }), suffix: '' },
])

onMounted(() => {
  const scope = root.value
  if (!scope) return

  track(revealOnScroll(scope.querySelectorAll('.about__para'), { y: 26, stagger: 0.12 }))
  track(revealOnScroll(scope.querySelectorAll('.chip'), { y: 14, stagger: 0.04, duration: 0.6 }))
  track(revealOnScroll(scope.querySelectorAll('.stat'), { y: 20, stagger: 0.09 }))

  scope.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    track(countUp(el, Number(el.dataset.count)))
  })

  track(parallax(scope.querySelector('.about__glow'), 0.35, scope))
})
</script>

<template>
  <section id="sobre-mi" ref="root" class="section about">
    <div class="about__glow" aria-hidden="true" />

    <div class="shell">
      <UiSectionHead
        index="01"
        :eyebrow="t({ es: 'Quién', en: 'Who' })"
        :title="t({ es: 'De ERPs industriales a escenas 3D en el navegador', en: 'From industrial ERPs to 3D scenes in the browser' })"
      />

      <div class="about__grid">
        <div class="about__body">
          <p class="about__para about__para--lead">
            {{ t(summary.recruiter) }}
          </p>
          <p class="about__para">
            {{ t({
              es: 'Lo que me llevo de los ERPs no es el dominio, es la disciplina: cuando una pantalla la usan doscientas personas ocho horas al día, un dato que se calcula en dos sitios acaba contando dos historias distintas. Esa manía —un dueño por dato— es la que aplico ahora a un configurador 3D o a un motor de trading.',
              en: 'What I took from the ERP years is not the domain, it is the discipline: when two hundred people use a screen eight hours a day, a value computed in two places will eventually tell two different stories. That habit — one owner per fact — is what I now apply to a 3D configurator or a trading engine.',
            }) }}
          </p>
          <p class="about__para">
            {{ t({
              es: 'Trabajo en remoto desde Cantabria, en Scrum y Kanban, hablando directamente con quien encarga el trabajo. Escribo la documentación técnica que acompaña a lo que entrego, porque un proyecto que solo entiende quien lo hizo está a medio entregar.',
              en: 'I work remotely from northern Spain, in Scrum and Kanban, talking directly to whoever commissioned the work. I write the technical documentation that ships with it, because a project only its author understands is half-delivered.',
            }) }}
          </p>

          <ul class="about__chips">
            <li v-for="(industry, i) in industries" :key="i" class="chip">
              {{ t(industry) }}
            </li>
          </ul>
        </div>

        <aside class="about__side">
          <dl class="stats">
            <div v-for="stat in stats" :key="stat.label" class="stat">
              <dt class="stat__label">
                {{ stat.label }}
              </dt>
              <dd class="stat__value serif">
                <span :data-count="stat.value">{{ stat.value }}</span>
              </dd>
            </div>
          </dl>

          <p class="about__note mono">
            {{ t({
              es: 'Estas cifras se calculan desde las fechas del CV. No hay ningún número escrito a mano en esta página.',
              en: 'These figures are computed from the dates in the CV. There is not a single hand-typed number on this page.',
            }) }}
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about { position: relative; overflow: clip; }

.about__glow {
  position: absolute;
  top: 10%;
  left: -18%;
  width: min(58vw, 700px);
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--accent-glow), transparent 62%);
  filter: blur(30px);
  pointer-events: none;
}

.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: clamp(2.5rem, 2rem + 4vw, 5rem);
  align-items: start;
}

.about__para {
  max-width: var(--measure);
  margin-bottom: 1.35rem;
  color: var(--fg-dim);
}

.about__para--lead {
  font-size: var(--step-1);
  font-weight: 300;
  color: var(--fg);
}

.about__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 0;
  list-style: none;
}

.chip {
  padding: 0.34rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--fg-faint);
  transition: border-color 0.3s var(--ease-out), color 0.3s var(--ease-out);
}

.chip:hover { border-color: var(--accent); color: var(--accent); }

.about__side {
  position: sticky;
  top: 96px;
  padding: 1.75rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem 1.25rem;
  margin: 0;
}

.stat__label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  line-height: 1.4;
  color: var(--fg-faint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat__value {
  margin: 0.35rem 0 0;
  font-size: var(--step-5);
  line-height: 1;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.about__note {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
  font-size: 0.7rem;
  line-height: 1.65;
  color: var(--fg-faint);
}

@media (max-width: 900px) {
  .about__grid { grid-template-columns: 1fr; }
  .about__side { position: static; }
}

@media (max-width: 420px) {
  .stats { grid-template-columns: 1fr; }
}
</style>
