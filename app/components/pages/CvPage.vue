<script setup lang="ts">
import type { CvVariant } from '~~/content/profile'
import { VARIANTES, esPrivada, ficheroCv, urlCv } from '~~/content/cv'
import { identity } from '~~/content/profile'

const { locale, t, localePath } = useLocale()
const route = useRoute()
const router = useRouter()

interface VariantMeta {
  id: CvVariant
  label: string
  blurb: string
}

const variants = computed<VariantMeta[]>(() => [
  {
    id: 'recruiter',
    label: t({ es: 'Público', en: 'Public' }),
    blurb: t({
      es: 'Para recruiters y para quien llegue por la web. Identidad completa, contacto y proyectos propios. Los clientes salen por sector, nunca por nombre.',
      en: 'For recruiters and anyone arriving from the web. Full identity, contact details and personal projects. Clients appear by sector, never by name.',
    }),
  },
  {
    id: 'anon',
    label: t({ es: 'Anónimo', en: 'Anonymous' }),
    blurb: t({
      es: 'Para procesos de selección ciegos. Sin nombre, sin contacto y sin ubicación exacta; se mantienen empleadores, fechas y sustancia técnica.',
      en: 'For blind hiring processes. No name, no contact, no exact location; employers, dates and technical substance stay.',
    }),
  },
  {
    id: 'accenture',
    label: t({ es: 'Interno Accenture', en: 'Accenture internal' }),
    blurb: t({
      es: 'El formato de staffing: años por tecnología, expertise funcional, correo corporativo y —solo aquí— el nombre de los clientes.',
      en: 'The staffing format: years per technology, functional expertise, corporate email and — only here — the client names.',
    }),
  },
])

/*
 * ─────────────── El pase ───────────────
 *
 * La página ofrece **un** CV, el público. Las otras dos existen igual, pero no
 * se enseñan: una es un CV sin nombre en una web firmada con nombre, y la otra
 * nombra clientes. Ofrecer las tres a cualquiera que pase quedaba raro.
 *
 * Esto de aquí es solo la parte visible del pestillo: `desbloqueado` decide qué
 * se pinta y nada más. La puerta que importa está en el servidor —la cookie que
 * emite `/api/cv/desbloquear`— y la guardan la descarga de esos PDF y sus hojas
 * de impresión. Trastear con esta variable desde la consola no descarga nada.
 */

/** Solo recuerda hasta cuándo vale la cookie. Ni la clave ni nada de quién. */
const MEMORIA = 'kw-cv'

const desbloqueado = ref(false)
const pidiendoClave = ref(false)

function recordar(caduca: number) {
  try {
    localStorage.setItem(MEMORIA, String(caduca))
  }
  catch { /* modo privado, o almacenamiento lleno: se queda en esta pestaña */ }
}

function olvidar() {
  try {
    localStorage.removeItem(MEMORIA)
  }
  catch { /* igual da: la cookie es la que manda */ }
}

onMounted(() => {
  let caduca = 0
  try {
    caduca = Number(localStorage.getItem(MEMORIA) ?? 0)
  }
  catch { /* sin almacenamiento no hay nada que recuperar */ }

  if (caduca > Date.now()) desbloqueado.value = true
  else olvidar()
})

function alDesbloquear(caduca: number) {
  desbloqueado.value = true
  recordar(caduca)
}

async function bloquear() {
  desbloqueado.value = false
  olvidar()
  router.replace({ query: {} })
  // Que no baste con borrar el recuerdo: la cookie se retira de verdad.
  await $fetch('/api/cv/bloquear', { method: 'POST' }).catch(() => {})
}

/*
 * Diez clics en el epígrafe. Tienen que ser seguidos: si pasan dos segundos y
 * medio entre dos, la cuenta vuelve a empezar. Así nadie llega por accidente
 * leyendo con el ratón en la mano, y quien lo sabe tarda tres segundos.
 */
const CLICS = 10
const SEGUIDOS_MS = 2500
const cuenta = ref(0)
let ultimo = 0

function tocarEpigrafe() {
  if (desbloqueado.value) return

  const ahora = Date.now()
  cuenta.value = ahora - ultimo > SEGUIDOS_MS ? 1 : cuenta.value + 1
  ultimo = ahora

  if (cuenta.value >= CLICS) {
    cuenta.value = 0
    pidiendoClave.value = true
  }
}

/*
 * ─────────────── La variante ───────────────
 */

const visibles = computed(() =>
  desbloqueado.value ? variants.value : variants.value.filter(v => !esPrivada(v.id)),
)

/**
 * La variante vive en la query, no en un ref suelto: así un enlace a
 * `/cv?v=anon` abre directamente la versión anónima y se puede compartir —con
 * quien tenga el pase; sin él, se cae a la pública—.
 */
const active = computed<CvVariant>(() => {
  const pedida = route.query.v as CvVariant
  if (!VARIANTES.includes(pedida)) return 'recruiter'
  return esPrivada(pedida) && !desbloqueado.value ? 'recruiter' : pedida
})

const activeMeta = computed(() => variants.value.find(v => v.id === active.value)!)
const fichero = computed(() => ficheroCv(active.value, locale.value))

function select(id: CvVariant) {
  router.replace({ query: id === 'recruiter' ? {} : { v: id } })
}

/**
 * El PDF público es un fichero estático que sirve Cloudflare sin pasar por el
 * servidor, así que el aviso lo manda la página. `keepalive` es lo que hace que
 * la petición sobreviva a la navegación que dispara la descarga; sin él el
 * navegador la cancela a mitad y el aviso se pierde.
 *
 * No se hace `preventDefault`: si esto falla, la descarga ocurre igual. Contar
 * es secundario; entregar el PDF, no.
 */
function alDescargar() {
  try {
    void fetch('/api/descarga', {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ variante: active.value, idioma: locale.value }),
    }).catch(() => {})
  }
  catch { /* la descarga sigue su curso */ }
}

const title = computed(() => `CV — ${identity.name}`)
const description = computed(() => t({
  es: 'CV de Diego Portilla: una sola fuente de datos de la que salen la página y el PDF, con los años calculados desde las fechas y ninguna cifra escrita a mano.',
  en: 'Diego Portilla’s CV: one source of data behind both the page and the PDF, with years computed from the dates and no hand-written figures.',
}))

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="cvp">
    <section class="cvp__intro">
      <div class="shell">
        <!-- El epígrafe es también el pestillo: diez clics seguidos abren el
             modal de la contraseña. No es un botón a propósito —no se anuncia,
             no se tabula, no invita a nadie—: es un atajo para mí. -->
        <p class="eyebrow cvp__eyebrow" @click="tocarEpigrafe">
          {{ t({ es: 'Currículum', en: 'Résumé' }) }}
        </p>
        <h1 class="cvp__title serif">
          {{ t({ es: 'Un CV, una sola fuente', en: 'One CV, one source' }) }}
        </h1>
        <p class="cvp__lede">
          {{ t({
            es: 'Tenía seis documentos en una carpeta con fechas y verdades ligeramente distintas. Ahora hay una sola fuente de datos: los años se calculan desde ella, la página de abajo se pinta con ella y el PDF sale de esa misma página. No pueden discrepar.',
            en: 'I had six documents in a folder with different dates and slightly different truths. Now there is one source of data: the years are computed from it, the page below is drawn from it, and the PDF comes off that same page. They cannot disagree.',
          }) }}
        </p>

        <div v-if="desbloqueado" class="cvp__switch-row">
          <div class="cvp__switch" role="tablist" :aria-label="t({ es: 'Versión del CV', en: 'CV version' })">
            <button
              v-for="variant in visibles"
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
          <button type="button" class="cvp__lock mono" @click="bloquear">
            {{ t({ es: 'Cerrar', en: 'Lock' }) }}
          </button>
        </div>

        <div class="cvp__meta">
          <p class="cvp__blurb">
            {{ activeMeta.blurb }}
          </p>
          <!-- La pública lleva `download` porque es un fichero estático y nada
               más va a decir cómo se llama. Las privadas no: las sirve el Worker
               con `Content-Disposition`, y sin `download` un pase caducado
               enseña la página de error en vez de guardar el 404 como si fuera
               un PDF. -->
          <a
            class="cvp__dl"
            :href="urlCv(active, locale)"
            :download="esPrivada(active) ? undefined : fichero"
            @click="alDescargar"
          >
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
            es: 'Ni la web ni los PDF llevan teléfono: un número en una página abierta lo recogen los rastreadores en días y no hay forma de retirarlo. Para un canal directo, el correo. Los clientes salen por sector y nunca por nombre.',
            en: 'Neither the site nor the PDFs carry a phone number: one printed on an open page is scraped within days and cannot be taken back. For a direct line, the email. Clients appear by sector and never by name.',
          }) }}
          <NuxtLink :to="localePath('/privacidad')">
            {{ t({ es: 'De las descargas solo cuento cuántas y de cuál.', en: 'Of downloads I count only how many, and of which.' }) }}
          </NuxtLink>
        </p>
      </div>
    </section>

    <UiCvUnlock v-model="pidiendoClave" @desbloqueado="alDesbloquear" />
  </div>
</template>

<style scoped>
.cvp__intro {
  padding-block: clamp(3.5rem, 2.5rem + 5vw, 6.5rem) clamp(2rem, 1.5rem + 2vw, 3rem);
  background: radial-gradient(90% 130% at 12% 0%, var(--accent-glow), transparent 55%);
}

/* Ni cursor de mano ni selección de texto: diez clics seguidos sobre una palabra
   la dejarían resaltada de azul, y eso sí delataría que ahí pasa algo. */
.cvp__eyebrow {
  width: fit-content;
  user-select: none;
  -webkit-user-select: none;
}

.cvp__title { font-size: var(--step-6); margin-top: 1.2rem; }

.cvp__lede {
  max-width: var(--measure);
  margin-top: 1.35rem;
  font-size: var(--step-1);
  font-weight: 300;
  color: var(--fg-dim);
}

.cvp__switch-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem;
  margin-top: 2.5rem;
}

.cvp__switch {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
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

.cvp__lock {
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-faint);
  transition: border-color 0.3s, color 0.3s;
}

.cvp__lock:hover { border-color: var(--accent); color: var(--accent); }

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
