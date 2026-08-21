<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

/*
 * `useLocale` lee la ruta del router, y en un 404 la ruta no ha llegado a
 * resolverse: aquí el idioma sale de la URL de la petición, que existe tanto en
 * servidor como en cliente.
 */
const path = useRequestURL().pathname
const isEnglish = path === '/en' || path.startsWith('/en/')
const notFound = computed(() => props.error.statusCode === 404)

const copy = computed(() => (isEnglish
  ? {
      title: notFound.value ? 'This page does not exist' : 'Something broke',
      lede: notFound.value
        ? 'The address is the right shape but points to nothing. It may have moved, or it may never have been here.'
        : 'An unexpected error. If it persists, the address in the footer works.',
      cta: 'Back home',
      home: '/en',
    }
  : {
      title: notFound.value ? 'Esta página no existe' : 'Algo se ha roto',
      lede: notFound.value
        ? 'La dirección tiene buena forma pero no apunta a nada. Puede que se moviera, o puede que nunca estuviera aquí.'
        : 'Un error inesperado. Si insiste, el correo del pie funciona.',
      cta: 'Volver al inicio',
      home: '/',
    }))

const code = computed(() => String(props.error.statusCode ?? 500))

function goHome() {
  // Sin esto la página de error se queda montada por encima de la ruta nueva.
  clearError({ redirect: copy.value.home })
}

useHead({ title: `${code.value} — ${copy.value.title}` })
</script>

<template>
  <div class="err">
    <div class="shell err__inner">
      <p class="err__code serif">
        {{ code }}
      </p>
      <h1 class="err__title serif">
        {{ copy.title }}
      </h1>
      <p class="err__lede">
        {{ copy.lede }}
      </p>
      <button type="button" class="err__cta" @click="goHome">
        {{ copy.cta }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.err {
  display: grid;
  place-items: center;
  min-height: 100svh;
  background: radial-gradient(70% 90% at 50% 30%, var(--accent-glow), transparent 60%);
  text-align: center;
}

.err__code {
  font-size: clamp(5rem, 3rem + 12vw, 11rem);
  line-height: 0.9;
  color: var(--accent);
}

.err__title { font-size: var(--step-4); margin-top: 1rem; }

.err__lede {
  max-width: 46ch;
  margin: 1.15rem auto 0;
  color: var(--fg-dim);
}

.err__cta {
  margin-top: 2.25rem;
  padding: 0.78rem 1.5rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 500;
  transition: transform 0.3s var(--ease-out);
}

.err__cta:hover { transform: translateY(-2px); }
</style>
