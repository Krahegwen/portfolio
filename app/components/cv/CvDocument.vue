<script setup lang="ts">
import type { CvVariant } from '~~/content/profile'
import {
  education,
  functionalExpertise,
  identity,
  industries,
  jobs,
  languages,
  skillGroups,
  summary,
} from '~~/content/profile'
import { formatDuration, formatRange, yearsSince } from '~/utils/dates'

const props = withDefaults(defineProps<{
  variant: CvVariant
  /** El PDF sí incluye el teléfono; la web pública no. */
  includePhone?: boolean
}>(), { includePhone: false })

const { locale, t } = useLocale()

/** Un proceso ciego no puede ver quién soy; los otros dos, sí. */
const showsIdentity = computed(() => props.variant !== 'anon')
/** Solo el formato interno nombra al cliente. Ver la nota en content/profile.ts. */
const showsClients = computed(() => props.variant === 'accenture')
const isInternal = computed(() => props.variant === 'accenture')

const email = computed(() => (isInternal.value ? identity.emailInternal : identity.email))

const role = computed(() => (isInternal.value ? identity.titleInternal : identity.title))

const totalYears = computed(() => yearsSince(identity.careerStart))
const vueYears = computed(() => yearsSince(identity.vueStart))
const xrYears = computed(() => yearsSince(identity.xrStart))

/** Rejilla de años que pide la plantilla de staffing y ningún otro CV tiene. */
const yearsGrid = computed(() => [
  { label: t({ es: 'Experiencia total', en: 'Total experience' }), value: totalYears.value },
  { label: t({ es: 'Vue.js', en: 'Vue.js' }), value: vueYears.value },
  { label: t({ es: '3D / WebXR', en: '3D / WebXR' }), value: xrYears.value },
])
</script>

<template>
  <article class="cv" :data-variant="variant">
    <!-- ─────────── cabecera ─────────── -->
    <header class="cv__head">
      <div class="cv__id">
        <template v-if="showsIdentity">
          <h1 class="cv__name serif">
            {{ identity.name }}
          </h1>
        </template>
        <template v-else>
          <h1 class="cv__name cv__name--anon serif">
            <span class="cv__redacted" aria-hidden="true" />
            <span class="visually-hidden">{{ t({ es: 'Candidato anónimo', en: 'Anonymous candidate' }) }}</span>
          </h1>
        </template>

        <p class="cv__role">
          {{ t(role) }}
        </p>

        <!-- Después del puesto y no antes: lo primero que debe leerse es a qué
             se dedica el candidato, no la advertencia sobre el formato. -->
        <p v-if="!showsIdentity" class="cv__anon-note mono">
          {{ t({
            es: 'Versión anónima — identidad y datos de contacto retirados para procesos de selección ciegos.',
            en: 'Anonymous version — identity and contact details removed for blind hiring processes.',
          }) }}
        </p>
      </div>

      <ul v-if="showsIdentity" class="cv__contact mono">
        <li>{{ t(identity.location) }}</li>
        <li><a :href="`mailto:${email}`">{{ email }}</a></li>
        <li v-if="includePhone">
          {{ identity.phone }}
        </li>
        <li v-if="!isInternal"><a :href="identity.github">github.com/{{ identity.handle }}</a></li>
        <li v-if="!isInternal"><a :href="identity.site">krahegwen.com</a></li>
      </ul>
      <ul v-else class="cv__contact mono">
        <li>{{ t({ es: 'Cantabria, España — remoto', en: 'Northern Spain — remote' }) }}</li>
        <li>{{ t({ es: 'Contacto vía el proceso', en: 'Contact through the process' }) }}</li>
      </ul>
    </header>

    <!-- ─────────── resumen ─────────── -->
    <section class="cv__block">
      <h2 class="cv__h2">
        {{ t({ es: 'Perfil', en: 'Profile' }) }}
      </h2>
      <p class="cv__summary">
        {{ t(summary[variant]) }}
      </p>
    </section>

    <!-- ─────────── rejilla de años: solo formato interno ─────────── -->
    <section v-if="isInternal" class="cv__block">
      <h2 class="cv__h2">
        {{ t({ es: 'Años de experiencia', en: 'Years of experience' }) }}
      </h2>
      <div class="cv__years">
        <div v-for="row in yearsGrid" :key="row.label" class="cv__year">
          <span class="cv__year-value">{{ row.value }}</span>
          <span class="cv__year-label">{{ row.label }}</span>
        </div>
        <div class="cv__year">
          <span class="cv__year-value">—</span>
          <span class="cv__year-label">{{ t({ es: 'Blended rate (según proyecto)', en: 'Blended rate (per engagement)' }) }}</span>
        </div>
      </div>
    </section>

    <!-- ─────────── experiencia ─────────── -->
    <section class="cv__block">
      <h2 class="cv__h2">
        {{ isInternal
          ? t({ es: 'Experiencia relevante en proyecto', en: 'Relevant project experience' })
          : t({ es: 'Experiencia', en: 'Experience' }) }}
      </h2>

      <ol class="cv__jobs">
        <li v-for="job in jobs" :key="job.id" class="cv__job">
          <div class="cv__job-when mono">
            <span>{{ formatRange(job.start, job.end, locale) }}</span>
            <span class="cv__job-dur">{{ formatDuration(job.start, job.end, locale) }}</span>
          </div>

          <div class="cv__job-what">
            <h3 class="cv__job-role">
              {{ t(isInternal && job.roleInternal ? job.roleInternal : job.role) }}
            </h3>
            <p class="cv__job-org">
              {{ job.company }}<span class="cv__job-loc"> · {{ t(job.location) }}</span>
            </p>

            <ul class="cv__points">
              <li v-for="(point, i) in job.highlights" :key="i">
                <b v-if="showsClients && point.client" class="cv__client">{{ point.client }} —</b>
                {{ t(point.text) }}
              </li>
            </ul>

            <p class="cv__job-stack mono">
              {{ job.stack.join(' · ') }}
            </p>
          </div>
        </li>
      </ol>
    </section>

    <!-- ─────────── sectores y expertise ─────────── -->
    <div class="cv__cols">
      <section class="cv__block">
        <h2 class="cv__h2">
          {{ t({ es: 'Sectores', en: 'Industries' }) }}
        </h2>
        <ul class="cv__tags">
          <li v-for="(industry, i) in industries" :key="i">
            {{ t(industry) }}
          </li>
        </ul>
      </section>

      <section v-if="isInternal" class="cv__block">
        <h2 class="cv__h2">
          {{ t({ es: 'Expertise funcional', en: 'Functional expertise' }) }}
        </h2>
        <ul class="cv__tags">
          <li v-for="(item, i) in functionalExpertise" :key="i">
            {{ t(item) }}
          </li>
        </ul>
      </section>
    </div>

    <!-- ─────────── stack ─────────── -->
    <section class="cv__block">
      <h2 class="cv__h2">
        {{ t({ es: 'Stack técnico', en: 'Technical stack' }) }}
      </h2>
      <div class="cv__skills">
        <div v-for="group in skillGroups" :key="group.id" class="cv__skill-group">
          <h3 class="cv__h3">
            {{ t(group.label) }}
          </h3>
          <p class="cv__skill-list">
            {{ group.skills.map(s => t(s.name)).join(' · ') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ─────────── formación e idiomas ─────────── -->
    <div class="cv__cols">
      <section class="cv__block">
        <h2 class="cv__h2">
          {{ t({ es: 'Formación', en: 'Education' }) }}
        </h2>
        <div v-for="item in education" :key="item.id" class="cv__edu">
          <p class="cv__job-when mono">
            {{ formatRange(item.start, item.end, locale) }}
          </p>
          <h3 class="cv__job-role">
            {{ t(item.title) }}
          </h3>
          <p class="cv__job-org">
            {{ t(item.org) }}<span class="cv__job-loc"> · {{ t(item.location) }}</span>
          </p>
          <p class="cv__edu-note">
            {{ t(item.note) }}
          </p>
        </div>
      </section>

      <section class="cv__block">
        <h2 class="cv__h2">
          {{ t({ es: 'Idiomas', en: 'Languages' }) }}
        </h2>
        <ul class="cv__langs">
          <li v-for="lang in languages" :key="lang.name.es">
            <span>{{ t(lang.name) }}</span>
            <span class="mono">{{ t(lang.level) }}</span>
          </li>
        </ul>
      </section>
    </div>

    <footer class="cv__foot mono">
      <span>{{ t({ es: 'Generado desde', en: 'Generated from' }) }} krahegwen.com</span>
      <span>{{ new Date().toISOString().slice(0, 10) }}</span>
    </footer>
  </article>
</template>

<style scoped>
.cv {
  --cv-gap: clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem);

  container-type: inline-size;
}

.cv__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--accent);
}

.cv__name { font-size: var(--step-5); line-height: 1; }

.cv__name--anon { display: flex; align-items: center; }

/* Bloque tachado en lugar del nombre: se ve que falta algo a propósito. */
.cv__redacted {
  display: block;
  width: 11ch;
  height: 0.72em;
  border-radius: 3px;
  background: repeating-linear-gradient(
    -45deg,
    var(--fg-faint) 0 6px,
    transparent 6px 11px
  );
  opacity: 0.55;
}

.cv__anon-note {
  margin-top: 0.7rem;
  max-width: 52ch;
  font-size: 0.66rem;
  line-height: 1.55;
  color: var(--fg-faint);
}

.cv__role {
  margin-top: 0.6rem;
  font-size: var(--step-1);
  font-weight: 400;
  color: var(--accent);
}

.cv__contact {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.74rem;
  color: var(--fg-dim);
  text-align: right;
}

.cv__contact a { text-decoration: none; }

.cv__block { margin-top: var(--cv-gap); }

.cv__h2 {
  margin-bottom: 1.15rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-faint);
}

.cv__h3 {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.4rem;
}

.cv__summary {
  max-width: 78ch;
  font-size: 1rem;
  font-weight: 300;
  color: var(--fg-dim);
}

.cv__years {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
  gap: 1rem;
}

.cv__year {
  padding: 0.9rem 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
}

.cv__year-value {
  display: block;
  font-family: var(--font-serif);
  font-size: var(--step-4);
  line-height: 1;
  color: var(--accent);
}

.cv__year-label {
  display: block;
  margin-top: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  line-height: 1.45;
  color: var(--fg-faint);
}

/*
 * Bloque y no flex a propósito. Chrome fragmenta mal un contenedor flex al
 * pasar de página: la columna de fechas seguía corriendo mientras la de
 * contenido se quedaba atrás, y a partir del segundo empleo el PDF emparejaba
 * cada puesto con las fechas del siguiente. Con `display: block` cada `li` es
 * un bloque normal y `break-inside: avoid` se respeta.
 */
.cv__jobs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv__job + .cv__job { margin-top: 1.85rem; }

.cv__job {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 1.5rem;
  break-inside: avoid;
}

.cv__job-when {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.72rem;
  color: var(--accent);
  padding-top: 0.25rem;
}

.cv__job-dur { color: var(--fg-faint); }

.cv__job-role { font-size: var(--step-1); font-weight: 500; }

.cv__job-org {
  margin-top: 0.2rem;
  font-size: 0.92rem;
  font-weight: 600;
}

.cv__job-loc { font-weight: 400; color: var(--fg-faint); }

.cv__points {
  margin: 0.9rem 0 0;
  padding: 0;
  list-style: none;
}

.cv__points li + li { margin-top: 0.5rem; }

.cv__points li {
  position: relative;
  padding-left: 1.1rem;
  font-size: 0.92rem;
  color: var(--fg-dim);
}

.cv__points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.68em;
  width: 6px;
  height: 1px;
  background: var(--accent);
}

.cv__client { color: var(--fg); font-weight: 600; }

.cv__job-stack {
  margin-top: 0.85rem;
  font-size: 0.66rem;
  color: var(--fg-faint);
}

.cv__cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 0 clamp(2rem, 1.5rem + 2vw, 3.5rem);
}

.cv__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv__tags li {
  padding: 0.22rem 0.65rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.76rem;
  color: var(--fg-dim);
}

.cv__skills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 1.35rem clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
}

.cv__skill-list { font-size: 0.87rem; color: var(--fg-dim); }

.cv__edu + .cv__edu { margin-top: 1.25rem; }
.cv__edu-note { margin-top: 0.5rem; font-size: 0.88rem; color: var(--fg-dim); }

.cv__langs { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }

.cv__langs li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--line);
  font-size: 0.92rem;
}

.cv__langs .mono { color: var(--accent); font-size: 0.72rem; }

.cv__foot {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: var(--cv-gap);
  padding-top: 1rem;
  border-top: 1px solid var(--line);
  font-size: 0.64rem;
  color: var(--fg-faint);
}

@container (max-width: 640px) {
  .cv__job { grid-template-columns: 1fr; gap: 0.6rem; }
  .cv__job-when { flex-direction: row; gap: 0.6rem; }
  .cv__contact { text-align: left; }
}
</style>
