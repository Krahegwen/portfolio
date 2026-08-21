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

      <div class="ct__grid">
        <div class="ct__aside">
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
              <a :href="identity.linkedin" rel="me noopener" target="_blank">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.5 8.5h3.9V21H3.5V8.5Zm6.3 0h3.74v1.71h.05c.52-.94 1.79-1.93 3.68-1.93 3.94 0 4.67 2.44 4.67 5.61V21h-3.9v-6.23c0-1.49-.03-3.4-2.16-3.4-2.17 0-2.5 1.6-2.5 3.29V21H9.8V8.5Z" /></svg>
                LinkedIn
              </a>
            </li>
            <li>
              <a :href="identity.github" rel="me noopener" target="_blank">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.980 9.980 0 0 1 5.01 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.06 10.06 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" /></svg>
                {{ identity.handle }}
              </a>
            </li>
            <li>
              <NuxtLink :to="localePath('/cv')">
                {{ t({ es: 'CV en tres versiones', en: 'CV in three versions' }) }}
              </NuxtLink>
            </li>
          </ul>

          <p data-reveal class="ct__note mono">
            {{ t({
              es: 'El formulario me avisa al momento. Si prefieres el correo directo, también llega.',
              en: 'The form pings me straight away. If you prefer plain email, that arrives too.',
            }) }}
          </p>
        </div>

        <div data-reveal class="ct__form">
          <UiContactForm />
        </div>
      </div>
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

.ct__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: clamp(2rem, 1.5rem + 3vw, 4rem);
  align-items: start;
  margin-top: 2.75rem;
}

.ct__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
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
  flex-direction: column;
  align-items: flex-start;
  gap: 0.7rem;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.95rem;
}

.ct__links a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--fg-dim);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
  padding-bottom: 2px;
}

.ct__links a:hover { color: var(--accent); border-color: var(--accent); }

.ct__note {
  max-width: 34ch;
  margin-top: 1.75rem;
  font-size: 0.68rem;
  line-height: 1.7;
  color: var(--fg-faint);
}

@media (max-width: 860px) {
  .ct__grid { grid-template-columns: 1fr; }
}
</style>
