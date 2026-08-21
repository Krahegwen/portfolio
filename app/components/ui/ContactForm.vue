<script setup lang="ts">
/**
 * Formulario de contacto.
 *
 * Valida en cliente lo mismo que valida el servidor, pero **el servidor no se
 * fía**: esto solo existe para que quien escribe vea el error antes de enviar,
 * no como control. El control está en `server/api/contacto.post.ts`.
 */

const { locale, t, localePath } = useLocale()

type Estado = 'listo' | 'enviando' | 'enviado' | 'error'

const estado = ref<Estado>('listo')
const errorServidor = ref('')

const form = reactive({
  nombre: '',
  email: '',
  mensaje: '',
  consentimiento: false,
  /** Campo trampa. Ni se ve ni se tabula; solo un bot lo rellena. */
  empresa: '',
})

/** Cuándo se pintó el formulario. El servidor exige unos segundos de relleno. */
const abierto = ref(0)
onMounted(() => { abierto.value = Date.now() })

const tocado = ref(false)

const errores = computed(() => {
  const e: Record<string, string> = {}
  if (form.nombre.trim().length < 2) {
    e.nombre = t({ es: 'Escribe tu nombre.', en: 'Please enter your name.' })
  }
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(form.email.trim())) {
    e.email = t({ es: 'Esa dirección no parece válida.', en: 'That address does not look valid.' })
  }
  if (form.mensaje.trim().length < 10) {
    e.mensaje = t({ es: 'Cuéntame algo más — al menos diez caracteres.', en: 'Tell me a bit more — at least ten characters.' })
  }
  if (!form.consentimiento) {
    e.consentimiento = t({ es: 'Necesito tu permiso para poder responderte.', en: 'I need your permission in order to reply.' })
  }
  return e
})

const valido = computed(() => Object.keys(errores.value).length === 0)

const mensajesError: Record<string, { es: string, en: string }> = {
  'falta-consentimiento': { es: 'Falta marcar la casilla de consentimiento.', en: 'The consent box is not ticked.' },
  'datos-invalidos': { es: 'Algún campo no ha pasado la validación. Revísalos y vuelve a intentarlo.', en: 'A field failed validation. Check them and try again.' },
  'formulario-caducado': { es: 'El formulario ha caducado. Recarga la página y vuelve a escribirlo.', en: 'The form expired. Reload the page and write it again.' },
  'demasiados-envios': { es: 'Has enviado varios mensajes seguidos. Espera unos minutos.', en: 'You have sent several messages in a row. Give it a few minutes.' },
  // El aviso no salió. Se dice tal cual, con la alternativa al lado: prometer
  // que ha llegado un mensaje que se ha perdido es peor que dar el error.
  //
  // Sin mencionar el transporte: a quien escribe no le importa si por detrás hay
  // un correo o un bot, y así el texto no caduca la próxima vez que cambie.
  'sin-transporte': { es: 'El formulario todavía no está conectado. Escríbeme directamente a la dirección de aquí al lado.', en: 'The form is not connected yet. Write to me directly at the address next to it.' },
  'envio-fallido': { es: 'No he podido entregar el mensaje. Escríbeme directamente a la dirección de aquí al lado.', en: 'I could not deliver the message. Write to me directly at the address next to this form.' },
}

async function enviar() {
  tocado.value = true
  if (!valido.value || estado.value === 'enviando') return

  estado.value = 'enviando'
  errorServidor.value = ''

  try {
    await $fetch('/api/contacto', {
      method: 'POST',
      body: {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        mensaje: form.mensaje.trim(),
        consentimiento: form.consentimiento,
        idioma: locale.value,
        empresa: form.empresa,
        abierto: abierto.value,
      },
    })

    estado.value = 'enviado'
  }
  catch (error) {
    estado.value = 'error'
    const clave = (error as { statusMessage?: string })?.statusMessage ?? ''
    errorServidor.value = mensajesError[clave]
      ? t(mensajesError[clave]!)
      : t({
          es: 'No he podido enviarlo. Si vuelve a fallar, escríbeme directamente al correo de arriba.',
          en: 'I could not send it. If it fails again, write to the address above instead.',
        })
  }
}

function reiniciar() {
  Object.assign(form, { nombre: '', email: '', mensaje: '', consentimiento: false, empresa: '' })
  tocado.value = false
  abierto.value = Date.now()
  estado.value = 'listo'
}
</script>

<template>
  <div class="cf">
    <!-- Un `aria-live` que cambia de contenido: quien navega con lector de
         pantalla se entera de que el mensaje salió sin tener que ir a buscarlo. -->
    <p class="visually-hidden" role="status" aria-live="polite">
      {{ estado === 'enviado' ? t({ es: 'Mensaje enviado.', en: 'Message sent.' }) : '' }}
      {{ estado === 'error' ? errorServidor : '' }}
    </p>

    <Transition name="cf-swap" mode="out-in">
      <div v-if="estado === 'enviado'" key="ok" class="cf__ok">
        <span class="cf__ok-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12.5 9.5 18 20 7" />
          </svg>
        </span>
        <h3 class="cf__ok-title serif">
          {{ t({ es: 'Recibido', en: 'Got it' }) }}
        </h3>
        <p class="cf__ok-text">
          {{ t({
            es: 'Gracias por escribir. Te respondo desde mi correo personal, normalmente en un par de días.',
            en: 'Thanks for writing. I reply from my personal address, usually within a couple of days.',
          }) }}
        </p>
        <button type="button" class="cf__again" @click="reiniciar">
          {{ t({ es: 'Escribir otro', en: 'Send another' }) }}
        </button>
      </div>

      <form v-else key="form" class="cf__form" novalidate @submit.prevent="enviar">
        <div class="cf__row">
          <div class="cf__field">
            <label for="cf-nombre">{{ t({ es: 'Nombre', en: 'Name' }) }}</label>
            <input
              id="cf-nombre"
              v-model="form.nombre"
              type="text"
              name="nombre"
              autocomplete="name"
              maxlength="80"
              :aria-invalid="Boolean(tocado && errores.nombre)"
              :aria-describedby="tocado && errores.nombre ? 'cf-nombre-err' : undefined"
            >
            <p v-if="tocado && errores.nombre" id="cf-nombre-err" class="cf__err">
              {{ errores.nombre }}
            </p>
          </div>

          <div class="cf__field">
            <label for="cf-email">{{ t({ es: 'Correo', en: 'Email' }) }}</label>
            <input
              id="cf-email"
              v-model="form.email"
              type="email"
              name="email"
              autocomplete="email"
              maxlength="120"
              :aria-invalid="Boolean(tocado && errores.email)"
              :aria-describedby="tocado && errores.email ? 'cf-email-err' : undefined"
            >
            <p v-if="tocado && errores.email" id="cf-email-err" class="cf__err">
              {{ errores.email }}
            </p>
          </div>
        </div>

        <div class="cf__field">
          <label for="cf-mensaje">{{ t({ es: 'Mensaje', en: 'Message' }) }}</label>
          <textarea
            id="cf-mensaje"
            v-model="form.mensaje"
            name="mensaje"
            rows="5"
            maxlength="4000"
            :aria-invalid="Boolean(tocado && errores.mensaje)"
            :aria-describedby="tocado && errores.mensaje ? 'cf-mensaje-err' : undefined"
          />
          <p v-if="tocado && errores.mensaje" id="cf-mensaje-err" class="cf__err">
            {{ errores.mensaje }}
          </p>
        </div>

        <!-- Campo trampa. `aria-hidden` y `tabindex="-1"` lo sacan del alcance de
             quien usa lector de pantalla o teclado; solo lo rellena un bot. -->
        <div class="cf__trap" aria-hidden="true">
          <label for="cf-empresa">Empresa</label>
          <input id="cf-empresa" v-model="form.empresa" type="text" name="empresa" tabindex="-1" autocomplete="off">
        </div>

        <label class="cf__consent" :class="{ 'is-bad': tocado && errores.consentimiento }">
          <input v-model="form.consentimiento" type="checkbox" name="consentimiento">
          <span>
            {{ t({
              es: 'Acepto que Diego Portilla guarde y use estos datos con el único fin de responderme.',
              en: 'I agree that Diego Portilla may store and use these details for the sole purpose of replying to me.',
            }) }}
            <NuxtLink :to="localePath('/privacidad')">{{ t({ es: 'Cómo se tratan', en: 'How they are handled' }) }}</NuxtLink>
          </span>
        </label>
        <p v-if="tocado && errores.consentimiento" class="cf__err">
          {{ errores.consentimiento }}
        </p>

        <div class="cf__actions">
          <button type="submit" class="cf__send" :disabled="estado === 'enviando'">
            <span v-if="estado === 'enviando'" class="cf__spin" aria-hidden="true" />
            {{ estado === 'enviando' ? t({ es: 'Enviando…', en: 'Sending…' }) : t({ es: 'Enviar', en: 'Send' }) }}
          </button>
          <p v-if="estado === 'error'" class="cf__err cf__err--server">
            {{ errorServidor }}
          </p>
        </div>
      </form>
    </Transition>
  </div>
</template>

<style scoped>
.cf {
  padding: clamp(1.4rem, 1.1rem + 1.2vw, 2.1rem);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.cf__form { display: flex; flex-direction: column; gap: 1.1rem; }

.cf__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 1.1rem;
}

.cf__field { display: flex; flex-direction: column; gap: 0.4rem; }

.cf__field label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-faint);
}

.cf__field input,
.cf__field textarea {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--ink-900);
  color: var(--fg);
  font-size: 0.95rem;
  transition: border-color 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
}

.cf__field textarea { resize: vertical; min-height: 7rem; line-height: 1.6; }

.cf__field input:focus,
.cf__field textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.cf__field [aria-invalid='true'] { border-color: #e5484d; }

.cf__err {
  font-size: 0.82rem;
  color: #ff8a8e;
}

:root[data-theme='light'] .cf__err { color: #c02a2f; }

.cf__err--server { margin-top: 0; }

/* Fuera de la vista sin `display: none`: un campo oculto del todo lo ignoran
   algunos bots, y con esto sigue siendo rellenable para ellos. */
.cf__trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.cf__consent {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.87rem;
  line-height: 1.55;
  color: var(--fg-dim);
  cursor: pointer;
}

.cf__consent input {
  flex: none;
  width: 17px;
  height: 17px;
  margin-top: 0.15rem;
  accent-color: var(--accent);
  cursor: pointer;
}

.cf__consent a { color: var(--accent); text-underline-offset: 0.2em; }
.cf__consent.is-bad span { color: var(--fg); }

.cf__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 0.3rem;
}

.cf__send {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 0.94rem;
  font-weight: 600;
  transition: transform 0.3s var(--ease-out), opacity 0.3s;
}

.cf__send:hover:not(:disabled) { transform: translateY(-2px); }
.cf__send:disabled { opacity: 0.6; cursor: progress; }

.cf__spin {
  width: 13px;
  height: 13px;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: cf-spin 0.7s linear infinite;
}

@keyframes cf-spin { to { transform: rotate(360deg); } }

.cf__ok { text-align: center; padding-block: 1.5rem; }

.cf__ok-mark {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 1.1rem;
  border-radius: 50%;
  border: 1px solid var(--accent);
  color: var(--accent);
}

.cf__ok-title { font-size: var(--step-3); }

.cf__ok-text {
  max-width: 42ch;
  margin: 0.7rem auto 0;
  color: var(--fg-dim);
  font-size: 0.94rem;
}

.cf__again {
  margin-top: 1.5rem;
  padding: 0.5rem 1.1rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-faint);
  transition: border-color 0.3s, color 0.3s;
}

.cf__again:hover { border-color: var(--accent); color: var(--accent); }

.cf-swap-enter-active,
.cf-swap-leave-active { transition: opacity 0.24s var(--ease-out), transform 0.24s var(--ease-out); }
.cf-swap-enter-from { opacity: 0; transform: translateY(10px); }
.cf-swap-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
