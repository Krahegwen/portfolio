<script setup lang="ts">
/**
 * El modal que pide la contraseña de las versiones no públicas del CV.
 *
 * Lo abre el epígrafe de `/cv` tras diez clics. La contraseña **no se compara
 * aquí**: viaja a `/api/cv/desbloquear`, que es el único que conoce el secreto.
 * Lo que este componente hace con la respuesta es puramente visual; la puerta de
 * verdad es la cookie que emite el servidor y que exigen las descargas.
 *
 * `<dialog>` nativo y no un div con `position: fixed`: trae el foco atrapado, el
 * Escape, el fondo inerte y el `aria-modal` sin escribir una línea de eso.
 */

const abierto = defineModel<boolean>({ required: true })

const emit = defineEmits<{ desbloqueado: [caduca: number] }>()

const { t } = useLocale()

const dialogo = useTemplateRef<HTMLDialogElement>('dialogo')
const campo = useTemplateRef<HTMLInputElement>('campo')

const clave = ref('')
const enviando = ref(false)
const error = ref('')

const mensajes: Record<string, { es: string, en: string }> = {
  'clave-incorrecta': { es: 'No es esa.', en: 'That is not it.' },
  'demasiados-intentos': {
    es: 'Dos intentos por media hora. Vuelve dentro de un rato.',
    en: 'Two attempts per half hour. Come back in a while.',
  },
  // Falta el secreto en el servidor. Se dice tal cual: fingir que la clave está
  // mal cuando lo que falta es la configuración manda a buscar donde no es.
  'sin-clave': {
    es: 'El servidor no tiene configurada ninguna clave (`CV_CLAVE`).',
    en: 'The server has no key configured (`CV_CLAVE`).',
  },
}

watch(abierto, (visible) => {
  if (visible) {
    dialogo.value?.showModal()
    nextTick(() => campo.value?.focus())
  }
  else {
    dialogo.value?.close()
  }
})

/** Escape y clic en el fondo cierran el `<dialog>` por su cuenta: hay que enterarse. */
function alCerrar() {
  abierto.value = false
  clave.value = ''
  error.value = ''
}

async function enviar() {
  if (enviando.value || clave.value.length === 0) return

  enviando.value = true
  error.value = ''

  try {
    const { caduca } = await $fetch<{ ok: true, caduca: number }>('/api/cv/desbloquear', {
      method: 'POST',
      body: { clave: clave.value },
    })

    emit('desbloqueado', caduca)
    abierto.value = false
    clave.value = ''
  }
  catch (fallo) {
    const codigo = (fallo as { statusMessage?: string })?.statusMessage ?? ''
    error.value = mensajes[codigo]
      ? t(mensajes[codigo]!)
      : t({ es: 'No he podido comprobarlo. Inténtalo otra vez.', en: 'I could not check it. Try again.' })
    campo.value?.select()
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <dialog ref="dialogo" class="cvu" @close="alCerrar">
    <form class="cvu__box" novalidate @submit.prevent="enviar">
      <h2 class="cvu__title serif">
        {{ t({ es: 'Versiones no públicas', en: 'Non-public versions' }) }}
      </h2>
      <p class="cvu__text">
        {{ t({
          es: 'La anónima y la interna de Accenture. No están a la vista porque una nombra clientes y la otra no tiene sentido en una web firmada.',
          en: 'The anonymous one and the Accenture internal one. They are not on display because one names clients and the other makes no sense on a site with my name on it.',
        }) }}
      </p>

      <label class="cvu__label" for="cvu-clave">
        {{ t({ es: 'Contraseña', en: 'Password' }) }}
      </label>
      <input
        id="cvu-clave"
        ref="campo"
        v-model="clave"
        type="password"
        name="cv-clave"
        autocomplete="current-password"
        maxlength="200"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? 'cvu-error' : undefined"
      >

      <p v-if="error" id="cvu-error" class="cvu__err" role="alert">
        {{ error }}
      </p>

      <div class="cvu__actions">
        <button type="button" class="cvu__cancel" @click="abierto = false">
          {{ t({ es: 'Dejarlo', en: 'Never mind' }) }}
        </button>
        <button type="submit" class="cvu__send" :disabled="enviando || clave.length === 0">
          {{ enviando ? t({ es: 'Comprobando…', en: 'Checking…' }) : t({ es: 'Abrir', en: 'Unlock' }) }}
        </button>
      </div>

      <p class="cvu__note mono">
        {{ t({
          es: 'Dos intentos cada media hora. Al acertar se guarda una cookie de treinta días — la única de esta web, y está contada en /privacidad.',
          en: 'Two attempts every half hour. On success a thirty-day cookie is stored — the only one on this site, and it is documented in the privacy policy.',
        }) }}
      </p>
    </form>
  </dialog>
</template>

<style scoped>
.cvu {
  /* El `<dialog>` se centra solo con el `margin: auto` que le pone el navegador,
     y el reset de base.css lo tumba con su `* { margin: 0 }`. Sin esta línea el
     modal sale pegado a la esquina superior izquierda. */
  margin: auto;
  width: min(30rem, calc(100vw - 2rem));
  padding: 0;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background: var(--ink-800);
  color: var(--fg);
}

.cvu::backdrop {
  background: rgb(0 0 0 / 62%);
  backdrop-filter: blur(3px);
}

.cvu__box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1.4rem, 1.1rem + 1.2vw, 2rem);
}

.cvu__title { font-size: var(--step-3); }

.cvu__text {
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--fg-dim);
}

.cvu__label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-faint);
}

.cvu input {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--ink-900);
  color: var(--fg);
  font-size: 0.95rem;
  transition: border-color 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
}

.cvu input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.cvu input[aria-invalid='true'] { border-color: #e5484d; }

.cvu__err { font-size: 0.85rem; color: #ff8a8e; }
:root[data-theme='light'] .cvu__err { color: #c02a2f; }

.cvu__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.cvu__cancel {
  padding: 0.6rem 1rem;
  border-radius: 999px;
  font-size: 0.88rem;
  color: var(--fg-faint);
  transition: color 0.3s;
}

.cvu__cancel:hover { color: var(--fg); }

.cvu__send {
  padding: 0.65rem 1.4rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 0.9rem;
  font-weight: 600;
  transition: transform 0.3s var(--ease-out), opacity 0.3s;
}

.cvu__send:hover:not(:disabled) { transform: translateY(-2px); }
.cvu__send:disabled { opacity: 0.5; cursor: not-allowed; }

.cvu__note {
  margin-top: 1.1rem;
  font-size: 0.66rem;
  line-height: 1.7;
  color: var(--fg-faint);
}
</style>
