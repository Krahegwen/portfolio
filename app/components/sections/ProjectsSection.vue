<script setup lang="ts">
import { featuredProjects } from '~~/content/projects'

const { locale, t } = useLocale()
const { track } = useMotionScope()
const root = ref<HTMLElement | null>(null)

onMounted(() => {
  const scope = root.value
  if (!scope) return
  track(revealOnScroll(scope.querySelectorAll('.pj__cell'), { y: 40, stagger: 0.11, start: 'top 88%' }))
})
</script>

<template>
  <section id="proyectos" ref="root" class="section pj">
    <div class="shell">
      <UiSectionHead
        index="04"
        :eyebrow="t({ es: 'Fuera de horario', en: 'Off the clock' })"
        :title="t({ es: 'Lo que construyo cuando nadie me lo encarga', en: 'What I build when nobody asked me to' })"
        :lede="t({
          es: 'Sistemas propios, en producción, con sus usuarios y sus incidencias. Los forks que tengo por tener no salen aquí.',
          en: 'My own systems, in production, with real users and real incidents. The forks I keep around for convenience are not here.',
        })"
      />

      <div class="pj__grid">
        <div v-for="(project, i) in featuredProjects" :key="project.slug" class="pj__cell">
          <UiProjectCard :project="project" :index="i" />
        </div>
      </div>

      <NuxtLink :to="locale === 'en' ? '/en/projects' : '/proyectos'" class="pj__all">
        <span>{{ t({ es: 'Ver todos los proyectos', en: 'See every project' }) }}</span>
        <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.pj { background: var(--ink-800); border-block: 1px solid var(--line); }

.pj__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 330px), 1fr));
  gap: clamp(1rem, 0.8rem + 1vw, 1.5rem);
}

.pj__cell { display: flex; }
.pj__cell > * { flex: 1; }

.pj__all {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: clamp(2rem, 1.5rem + 2vw, 3rem);
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--line-strong);
  font-size: 0.95rem;
  text-decoration: none;
  transition: border-color 0.3s var(--ease-out);
}

.pj__all:hover { border-color: var(--accent); }
.pj__all svg { transition: transform 0.3s var(--ease-out); }
.pj__all:hover svg { transform: translateX(4px); }
</style>
