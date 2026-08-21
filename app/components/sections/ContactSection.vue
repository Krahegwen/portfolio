<script setup lang="ts">
import { identity } from '~~/content/profile'

const { t, localePath } = useLocale()
const { track } = useMotionScope()
const root = ref<HTMLElement | null>(null)

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(identity.email)
    copied.value = true
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => { copied.value = false }, 2200)
  } catch {
    // Sin permiso de portapapeles el mailto de al lado sigue funcionando.
  }
}

onBeforeUnmount(() => clearTimeout(resetTimer))

onMounted(() => {
  const scope = root.value
  if (!scope) return
  track(revealOnScroll(scope.querySelectorAll('[data-reveal]'), { y: 30, stagger: 0.1 }))
  track(parallax(scope.querySelector('.ct__glow'), 0.4, scope))
})
</script>

<template>
  <section id="contacto" ref="root" class="section ct">
    <div class="ct__glow" aria-hidden="true" />

    <div class="shell ct__inner">
      <p data-reveal class="eyebrow">
        {{ t({ es: '05 — Contacto', en: '05 — Contact' }) }}
      </p>

      <h2 data-reveal class="ct__title serif">
        {{ t({ es: '¿Hablamos de lo que hay que construir?', en: 'Shall we talk about what needs building?' }) }}
      </h2>

      <p data-reveal class="ct__lede">
        {{ t({
          es: 'Escribo desde Cantabria y trabajo en remoto. Si tienes un producto con 3D en el navegador, un front que se ha vuelto inmanejable o simplemente curiosidad por alguno de mis proyectos, el correo está abierto.',
          en: 'I write from northern Spain and work remotely. If you have a product with 3D in the browser, a front end that has become unmanageable, or just curiosity about one of my projects, the inbox is open.',
        }) }}
      </p>

      <div data-reveal class="ct__actions">
        <a :href="`mailto:${identity.email}`" class="ct__mail">
          <span class="mono">{{ identity.email }}</span>
        </a>
        <button type="button" class="ct__copy" @click="copyEmail">
          {{ copied ? t({ es: 'copiado', en: 'copied' }) : t({ es: 'copiar', en: 'copy' }) }}
        </button>
      </div>

      <ul data-reveal class="ct__links">
        <li>
          <a :href="identity.github" rel="me noopener" target="_blank">
            GitHub · {{ identity.handle }}
          </a>
        </li>
        <li>
          <NuxtLink :to="localePath('/cv')">
            {{ t({ es: 'CV en tres versiones', en: 'CV in three versions' }) }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.ct { position: relative; overflow: clip; }

.ct__glow {
  position: absolute;
  right: -14%;
  bottom: -22%;
  width: min(66vw, 760px);
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--accent-glow), transparent 60%);
  filter: blur(26px);
  pointer-events: none;
}

.ct__inner { position: relative; z-index: 1; }

.ct__title {
  max-width: 17ch;
  margin-top: 1.4rem;
  font-size: var(--step-6);
}

.ct__lede {
  max-width: var(--measure);
  margin-top: 1.6rem;
  font-size: var(--step-1);
  font-weight: 300;
  color: var(--fg-dim);
}

.ct__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

.ct__mail {
  display: inline-block;
  padding: 0.85rem 1.5rem;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  font-size: var(--step-1);
  text-decoration: none;
  transition: border-color 0.35s var(--ease-out), background 0.35s, color 0.35s, transform 0.35s;
}

.ct__mail:hover {
  transform: translateY(-2px);
  border-color: transparent;
  background: var(--accent);
  color: var(--accent-ink);
}

.ct__copy {
  padding: 0.62rem 1.05rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-faint);
  transition: border-color 0.3s, color 0.3s;
}

.ct__copy:hover { border-color: var(--accent); color: var(--accent); }

.ct__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  margin: 2.75rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.95rem;
}

.ct__links a { color: var(--fg-dim); text-decoration: none; border-bottom: 1px solid var(--line); padding-bottom: 2px; }
.ct__links a:hover { color: var(--accent); border-color: var(--accent); }
</style>
