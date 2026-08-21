<script setup lang="ts">
import type { CvVariant } from '~~/content/profile'
import { identity } from '~~/content/profile'

const { locale, t } = useLocale()
const route = useRoute()
const router = useRouter()

interface VariantMeta {
  id: CvVariant
  label: string
  blurb: string
  file: string
}

const variants = computed<VariantMeta[]>(() => [
  {
    id: 'recruiter',
    label: t({ es: 'Público', en: 'Public' }),
    blurb: t({
      es: 'Para recruiters y para quien llegue por la web. Identidad completa, contacto y proyectos propios. Los clientes salen por sector, nunca por nombre.',
      en: 'For recruiters and anyone arriving from the web. Full identity, contact details and personal projects. Clients appear by sector, never by name.',
    }),
    file: `Diego-Portilla-CV-${locale.value.toUpperCase()}.pdf`,
  },
  {
    id: 'anon',
    label: t({ es: 'Anónimo', en: 'Anonymous' }),
    blurb: t({
      es: 'Para procesos de selección ciegos. Sin nombre, sin contacto y sin ubicación exacta; se mantienen empleadores, fechas y sustancia técnica.',
      en: 'For blind hiring processes. No name, no contact, no exact location; employers, dates and technical substance stay.',
    }),
    file: `Diego-Portilla-CV-Anon-${locale.value.toUpperCase()}.pdf`,
  },
  {
    id: 'accenture',
    label: t({ es: 'Interno Accenture', en: 'Accenture internal' }),
    blurb: t({
      es: 'El formato de staffing: años por tecnología, expertise funcional, correo corporativo y —solo aquí— el nombre de los clientes.',
      en: 'The staffing format: years per technology, functional expertise, corporate email and — only here — the client names.',
    }),
    file: `Diego-Portilla-CV-Accenture-${locale.value.toUpperCase()}.pdf`,
  },
])

const VALID: CvVariant[] = ['recruiter', 'anon', 'accenture']

/**
 * La variante vive en la query, no en un ref suelto: así un enlace a
 * `/cv?v=anon` abre directamente la versión anónima y se puede compartir.
 */
const active = computed<CvVariant>(() => {
  const value = route.query.v
  return VALID.includes(value as CvVariant) ? (value as CvVariant) : 'recruiter'
})

const activeMeta = computed(() => variants.value.find(v => v.id === active.value)!)

function select(id: CvVariant) {
  router.replace({ query: id === 'recruiter' ? {} : { v: id } })
}

const title = computed(() => `CV — ${identity.name}`)
const description = computed(() => t({
  es: 'CV de Diego Portilla en tres versiones: pública, anónima e interna. Se genera desde una única fuente de datos y los años se calculan solos.',
  en: 'Diego Portilla’s CV in three versions: public, anonymous and internal. Generated from a single source of data, with self-computing years.',
}))

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="cvp">
    <section class="cvp__intro">
      <div class="shell">
        <p class="eyebrow">
          {{ t({ es: 'Currículum', en: 'Résumé' }) }}
        </p>
        <h1 class="cvp__title serif">
          {{ t({ es: 'Un CV, tres lectores', en: 'One CV, three readers' }) }}
        </h1>
        <p class="cvp__lede">
          {{ t({
            es: 'Tenía seis documentos en una carpeta con fechas y verdades ligeramente distintas. Ahora hay una sola fuente de datos y tres formas de leerla, según quién esté al otro lado.',
            en: 'I had six documents in a folder with different dates and slightly different truths. Now there is one source of data and three ways of reading it, depending on who is on the other side.',
          }) }}
        </p>

        <div class="cvp__switch" role="tablist" :aria-label="t({ es: 'Versión del CV', en: 'CV version' })">
          <button
            v-for="variant in variants"
            :key="variant.id"
            role="tab"
            type="button"
            class="cvp__tab"
            :class="{ 'is-active': variant.id === active }"
            :aria-selected="variant.id === active"
            @click="select(variant.id)"
          >
            {{ variant.label }}
          </button>
        </div>

        <div class="cvp__meta">
          <p class="cvp__blurb">
            {{ activeMeta.blurb }}
          </p>
          <a class="cvp__dl" :href="`/cv/${activeMeta.file}`" :download="activeMeta.file">
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M2.5 13.5h11" />
            </svg>
            {{ t({ es: 'Descargar PDF', en: 'Download PDF' }) }}
          </a>
        </div>
      </div>
    </section>

    <section class="cvp__sheet">
      <div class="shell">
        <div class="cvp__paper">
          <Transition name="swap" mode="out-in">
            <CvDocument :key="active" :variant="active" />
          </Transition>
        </div>

        <p class="cvp__note mono">
          {{ t({
            es: 'Ni la web ni los PDF llevan teléfono: un número en una página abierta lo recogen los rastreadores en días y no hay forma de retirarlo. Para un canal directo, el correo. Los nombres de cliente solo aparecen en la versión interna.',
            en: 'Neither the site nor the PDFs carry a phone number: one printed on an open page is scraped within days and cannot be taken back. For a direct line, the email. Client names only appear in the internal version.',
          }) }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cvp__intro {
  padding-block: clamp(3.5rem, 2.5rem + 5vw, 6.5rem) clamp(2rem, 1.5rem + 2vw, 3rem);
  background: radial-gradient(90% 130% at 12% 0%, var(--accent-glow), transparent 55%);
}

.cvp__title { font-size: var(--step-6); margin-top: 1.2rem; }

.cvp__lede {
  max-width: var(--measure);
  margin-top: 1.35rem;
  font-size: var(--step-1);
  font-weight: 300;
  color: var(--fg-dim);
}

.cvp__switch {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 2.5rem;
  padding: 0.35rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  width: fit-content;
}

.cvp__tab {
  padding: 0.55rem 1.15rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--fg-faint);
  transition: background 0.3s var(--ease-out), color 0.3s var(--ease-out);
}

.cvp__tab:hover { color: var(--fg); }

.cvp__tab.is-active {
  background: var(--accent);
  color: var(--accent-ink);
}

.cvp__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.cvp__blurb {
  max-width: 62ch;
  font-size: 0.92rem;
  color: var(--fg-dim);
}

.cvp__dl {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  flex: none;
  padding: 0.65rem 1.2rem;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 500;
  text-decoration: none;
  transition: border-color 0.3s, background 0.3s, color 0.3s, transform 0.3s;
}

.cvp__dl:hover {
  transform: translateY(-2px);
  border-color: transparent;
  background: var(--accent);
  color: var(--accent-ink);
}

.cvp__sheet { padding-block: 0 clamp(4rem, 3rem + 4vw, 7rem); }

.cvp__paper {
  padding: clamp(1.75rem, 1.2rem + 2.6vw, 3.5rem);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--ink-800);
  box-shadow: 0 40px 90px -60px rgb(0 0 0 / 80%);
}

.cvp__note {
  max-width: 78ch;
  margin-top: 1.5rem;
  font-size: 0.68rem;
  line-height: 1.7;
  color: var(--fg-faint);
}

.swap-enter-active,
.swap-leave-active { transition: opacity 0.22s var(--ease-out), transform 0.22s var(--ease-out); }
.swap-enter-from { opacity: 0; transform: translateY(8px); }
.swap-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
