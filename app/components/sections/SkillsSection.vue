<script setup lang="ts">
import { languages, skillGroups } from '~~/content/profile'

const { t } = useLocale()
const { track } = useMotionScope()
const root = ref<HTMLElement | null>(null)

onMounted(() => {
  const scope = root.value
  if (!scope) return
  const { gsap } = useGsap()

  track(revealOnScroll(scope.querySelectorAll('.sk__group'), { y: 28, stagger: 0.1 }))

  const bars = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll('.sk__fill'))
  bars.forEach((bar) => {
    const level = Number(bar.dataset.level) / 100
    if (prefersReducedMotion()) {
      gsap.set(bar, { scaleX: level })
      return
    }
    const tween = gsap.fromTo(bar,
      { scaleX: 0 },
      {
        scaleX: level,
        duration: 1.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: bar, start: 'top 92%', once: true },
      },
    )
    track(tween.scrollTrigger ?? null)
  })
})
</script>

<template>
  <section id="stack" ref="root" class="section sk">
    <div class="shell">
      <UiSectionHead
        index="03"
        :eyebrow="t({ es: 'Herramienta', en: 'Toolkit' })"
        :title="t({ es: 'Lo que uso y hasta dónde lo uso', en: 'What I use, and how far I take it' })"
        :lede="t({
          es: 'Los niveles son honestos, no aspiracionales: un 55 significa que sé moverme, no que lo domine.',
          en: 'The levels are honest rather than aspirational: a 55 means I can find my way around, not that I own it.',
        })"
      />

      <div class="sk__grid">
        <section v-for="group in skillGroups" :key="group.id" class="sk__group">
          <h3 class="sk__label eyebrow">
            {{ t(group.label) }}
          </h3>

          <ul class="sk__list">
            <li v-for="skill in group.skills" :key="typeof skill.name === 'string' ? skill.name : skill.name.es" class="sk__row">
              <span class="sk__name">{{ t(skill.name) }}</span>
              <span class="sk__meter" role="img" :aria-label="`${t(skill.name)}: ${skill.level} / 100`">
                <span class="sk__fill" :data-level="skill.level" />
              </span>
            </li>
          </ul>
        </section>

        <section class="sk__group sk__group--lang">
          <h3 class="sk__label eyebrow">
            {{ t({ es: 'Idiomas', en: 'Languages' }) }}
          </h3>
          <ul class="sk__list">
            <li v-for="lang in languages" :key="lang.name.es" class="sk__row">
              <span class="sk__name">
                {{ t(lang.name) }}
                <small>{{ t(lang.level) }}</small>
              </span>
              <span class="sk__meter" role="img" :aria-label="`${t(lang.name)}: ${t(lang.level)}`">
                <span class="sk__fill" :data-level="lang.value" />
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sk__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
  gap: clamp(2rem, 1.5rem + 2.5vw, 3.25rem);
}

.sk__label {
  padding-bottom: 0.85rem;
  margin-bottom: 1.35rem;
  border-bottom: 1px solid var(--line);
  color: var(--accent);
}

.sk__list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 1.05rem; }

.sk__name {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.92rem;
  color: var(--fg-dim);
}

.sk__name small { font-family: var(--font-mono); font-size: 0.68rem; color: var(--fg-faint); }

.sk__meter {
  display: block;
  height: 3px;
  margin-top: 0.5rem;
  border-radius: 3px;
  background: var(--surface-2);
  overflow: hidden;
}

.sk__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-soft));
  transform-origin: left;
  transform: scaleX(0);
}

.sk__group--lang .sk__fill { background: linear-gradient(90deg, var(--cyan), color-mix(in srgb, var(--cyan) 50%, var(--accent))); }
</style>
