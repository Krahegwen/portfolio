<script setup lang="ts">
import { identity } from '~~/content/profile'
import { actualizado, bloques, intro } from '~~/content/privacidad'

const { t } = useLocale()
const { track } = useMotionScope()
const root = ref<HTMLElement | null>(null)

/**
 * Los textos usan `**negrita**` para el nombre del proveedor. Convertirlo aquí,
 * y solo para eso, evita arrastrar un motor de markdown entero por seis líneas.
 * `escapar` va primero para que el contenido no pueda inyectar etiquetas.
 */
function escapar(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function enfasis(texto: string) {
  return escapar(texto)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

onMounted(() => {
  if (!root.value) return
  track(revealOnScroll(root.value.querySelectorAll('[data-reveal]'), { y: 22, stagger: 0.06 }))
})

const title = computed(() => `${t({ es: 'Privacidad', en: 'Privacy' })} — ${identity.name}`)
const description = computed(() => t({
  es: 'Qué datos recoge krahegwen.com y cuáles no. Sin cookies, con las tipografías autoalojadas y con el formulario de contacto explicado de principio a fin.',
  en: 'What krahegwen.com collects and what it does not. No cookies, self-hosted typefaces, and the contact form explained end to end.',
}))

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div ref="root" class="pv">
    <section class="pv__intro">
      <div class="shell">
        <p class="eyebrow">
          {{ t({ es: 'Privacidad', en: 'Privacy' }) }}
        </p>
        <h1 class="pv__title serif">
          {{ t({ es: 'Qué recojo y qué no', en: 'What I collect and what I don’t' }) }}
        </h1>
        <p class="pv__lede">
          {{ t(intro) }}
        </p>
        <p class="pv__date mono">
          {{ t({ es: 'Última revisión', en: 'Last reviewed' }) }}: {{ actualizado }}
        </p>
      </div>
    </section>

    <section class="pv__body">
      <div class="shell pv__grid">
        <nav class="pv__toc" :aria-label="t({ es: 'Índice', en: 'Contents' })">
          <ol>
            <li v-for="bloque in bloques" :key="bloque.id">
              <a :href="`#${bloque.id}`">{{ t(bloque.titulo) }}</a>
            </li>
          </ol>
        </nav>

        <div class="pv__prose">
          <section v-for="bloque in bloques" :id="bloque.id" :key="bloque.id" data-reveal class="pv__block">
            <h2 class="pv__h2">
              {{ t(bloque.titulo) }}
            </h2>
            <!-- eslint-disable-next-line vue/no-v-html -- Contenido propio de content/privacidad.ts, escapado en `enfasis`. -->
            <p v-for="(parrafo, i) in bloque.parrafos" :key="i" v-html="enfasis(t(parrafo))" />
            <ul v-if="bloque.lista" class="pv__list">
              <!-- eslint-disable-next-line vue/no-v-html -- Ídem. -->
              <li v-for="(item, i) in bloque.lista" :key="i" v-html="enfasis(t(item))" />
            </ul>
          </section>

          <p class="pv__contact">
            {{ t({ es: 'Para cualquiera de estas cosas:', en: 'For any of the above:' }) }}
            <a :href="`mailto:${identity.email}`">{{ identity.email }}</a>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pv__intro {
  padding-block: clamp(3.5rem, 2.5rem + 5vw, 6rem) clamp(1.5rem, 1rem + 2vw, 2.5rem);
  background: radial-gradient(90% 130% at 12% 0%, var(--accent-glow), transparent 55%);
}

.pv__title { font-size: var(--step-6); margin-top: 1.2rem; }

.pv__lede {
  max-width: var(--measure);
  margin-top: 1.35rem;
  font-size: var(--step-1);
  font-weight: 300;
  color: var(--fg-dim);
}

.pv__date { margin-top: 1.5rem; color: var(--fg-faint); }

.pv__body { padding-block: clamp(2.5rem, 2rem + 2vw, 4rem) clamp(4rem, 3rem + 4vw, 7rem); }

.pv__grid {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: clamp(2rem, 1.5rem + 3vw, 4.5rem);
  align-items: start;
}

.pv__toc { position: sticky; top: 96px; }

.pv__toc ol {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: toc;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.pv__toc li { counter-increment: toc; }

.pv__toc a {
  display: flex;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: var(--fg-faint);
  text-decoration: none;
}

.pv__toc a::before {
  content: counter(toc, decimal-leading-zero);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--accent);
}

.pv__toc a:hover { color: var(--fg); }

.pv__prose { max-width: 68ch; }

.pv__block { margin-bottom: clamp(2rem, 1.5rem + 2vw, 3rem); scroll-margin-top: 92px; }

.pv__h2 {
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-serif);
  font-size: var(--step-3);
  font-weight: 400;
}

.pv__prose p { margin-bottom: 1rem; color: var(--fg-dim); }
.pv__prose :deep(strong) { color: var(--fg); font-weight: 600; }

.pv__prose :deep(code) {
  padding: 0.1em 0.35em;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--surface);
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--accent);
}

.pv__list { margin: 0 0 1rem; padding: 0; list-style: none; }

.pv__list li {
  position: relative;
  margin-bottom: 0.7rem;
  padding-left: 1.35rem;
  color: var(--fg-dim);
}

.pv__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 8px;
  height: 1px;
  background: var(--accent);
}

.pv__contact {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
  font-size: 0.95rem;
}

.pv__contact a { color: var(--accent); }

@media (max-width: 860px) {
  .pv__grid { grid-template-columns: 1fr; }
  .pv__toc { position: static; padding-bottom: 1.5rem; border-bottom: 1px solid var(--line); }
  .pv__toc ol { flex-direction: row; flex-wrap: wrap; gap: 0.5rem 1.25rem; }
}
</style>
