<script setup lang="ts">
import { identity } from '~~/content/profile'
import { projects } from '~~/content/projects'

const { t } = useLocale()
const { track } = useMotionScope()
const root = ref<HTMLElement | null>(null)

const sorted = computed(() => [...projects].sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  return b.year.localeCompare(a.year)
}))

onMounted(() => {
  if (!root.value) return
  track(revealOnScroll(root.value.querySelectorAll('.pl__cell'), { y: 36, stagger: 0.09, start: 'top 90%' }))
})

const title = computed(() => `${t({ es: 'Proyectos', en: 'Projects' })} — ${identity.name}`)
const description = computed(() => t({
  es: 'Proyectos propios de Diego Portilla: una bitácora de café en Cloudflare Workers, un editor RAW local con servidor MCP, e-commerce con Nuxt 4 y Medusa y una PWA offline-first.',
  en: 'Diego Portilla’s own projects: a coffee log on Cloudflare Workers, a local RAW editor with an MCP server, a Nuxt 4 + Medusa storefront and an offline-first PWA.',
}))

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div ref="root" class="pl">
    <section class="pl__intro">
      <div class="shell">
        <p class="eyebrow">
          {{ t({ es: 'Trabajo propio', en: 'Own work' }) }}
        </p>
        <h1 class="pl__title serif">
          {{ t({ es: 'Todo lo que mantengo', en: 'Everything I maintain' }) }}
        </h1>
        <p class="pl__lede">
          {{ t({
            es: 'Sin forks, sin plantillas y sin proyectos de curso. Solo lo que arranqué yo y sigo tocando —o dejé de tocar a conciencia.',
            en: 'No forks, no templates, no coursework. Only what I started myself and still touch — or deliberately stopped touching.',
          }) }}
        </p>
      </div>
    </section>

    <section class="pl__grid-wrap">
      <div class="shell">
        <div class="pl__grid">
          <div v-for="(project, i) in sorted" :key="project.slug" class="pl__cell">
            <UiProjectCard :project="project" :index="i" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pl__intro {
  padding-block: clamp(3.5rem, 2.5rem + 5vw, 6.5rem) clamp(2rem, 1.5rem + 2vw, 3.5rem);
  background: radial-gradient(90% 130% at 88% 0%, var(--accent-glow), transparent 55%);
}

.pl__title { font-size: var(--step-6); margin-top: 1.2rem; }

.pl__lede {
  max-width: var(--measure);
  margin-top: 1.35rem;
  font-size: var(--step-1);
  font-weight: 300;
  color: var(--fg-dim);
}

.pl__grid-wrap { padding-block: 0 clamp(4rem, 3rem + 4vw, 7rem); }

.pl__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: clamp(1rem, 0.8rem + 1vw, 1.5rem);
}

.pl__cell { display: flex; }
.pl__cell > * { flex: 1; }
</style>
