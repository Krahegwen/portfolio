<script setup lang="ts">
/**
 * Malla en perspectiva que respira.
 *
 * Es un plano de puntos proyectado a mano (sin WebGL: no vale la pena arrancar
 * un contexto 3D para esto) con una onda que lo recorre y un realce alrededor
 * del puntero. Se detiene cuando el lienzo sale de pantalla y no arranca
 * siquiera con `prefers-reduced-motion`, donde se pinta un fotograma fijo.
 */

const props = withDefaults(defineProps<{
  /** Filas del plano, hacia el horizonte. */
  rows?: number
  cols?: number
  /** Amplitud de la onda en píxeles de mundo. */
  amp?: number
}>(), { rows: 26, cols: 34, amp: 26 })

const canvas = ref<HTMLCanvasElement | null>(null)
let raf = 0
let observer: IntersectionObserver | null = null
let ctx: CanvasRenderingContext2D | null = null

const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
let width = 0
let height = 0
let dpr = 1

function resize() {
  const el = canvas.value
  if (!el || !ctx) return
  const rect = el.getBoundingClientRect()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = rect.width
  height = rect.height
  el.width = Math.round(width * dpr)
  el.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/** Color de tinta actual; se relee en cada fotograma porque el tema cambia en caliente. */
function inkColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    line: styles.getPropertyValue('--fg-faint').trim() || '#6d747f',
    accent: styles.getPropertyValue('--accent').trim() || '#ff7a2f',
  }
}

function draw(time: number) {
  if (!ctx) return
  const { rows, cols, amp } = props
  const colors = inkColors()

  pointer.x += (pointer.tx - pointer.x) * 0.06
  pointer.y += (pointer.ty - pointer.y) * 0.06

  ctx.clearRect(0, 0, width, height)

  const t = time * 0.00042
  // Horizonte alto: deja el peso visual abajo, donde va el texto del héroe.
  const horizon = height * 0.34
  const depth = height * 0.86

  for (let r = 0; r < rows; r++) {
    // Progresión cuadrática: las filas se apiñan cerca del horizonte, como en perspectiva real.
    const rt = r / (rows - 1)
    const z = rt * rt
    const y0 = horizon + z * depth
    const spread = 0.22 + z * 1.5
    const alpha = 0.09 + z * 0.72

    ctx.beginPath()
    for (let c = 0; c < cols; c++) {
      const ct = c / (cols - 1)
      const x = width * (0.5 + (ct - 0.5) * spread)

      const wave
        = Math.sin(ct * 5.2 + t * 2.1 + r * 0.32) * 0.6
          + Math.sin(ct * 2.1 - t * 1.4 + r * 0.11) * 0.4

      // Realce local: el puntero levanta el plano a su alrededor, con caída suave.
      const dx = ct - pointer.x
      const dy = rt - pointer.y
      const lift = Math.exp(-(dx * dx * 9 + dy * dy * 14)) * 34

      const y = y0 + wave * amp * (0.25 + z) - lift * (0.35 + z)
      if (c === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = withAlpha(colors.line, alpha)
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Un solo trazo en ámbar: la línea "viva" que recorre el plano de atrás a delante.
  const pulse = (Math.sin(t * 0.7) * 0.5 + 0.5)
  const pr = Math.min(rows - 1, Math.max(1, Math.round(pulse * (rows - 1))))
  const prt = pr / (rows - 1)
  const pz = prt * prt
  ctx.beginPath()
  for (let c = 0; c < cols; c++) {
    const ct = c / (cols - 1)
    const x = width * (0.5 + (ct - 0.5) * (0.22 + pz * 1.5))
    const wave
      = Math.sin(ct * 5.2 + t * 2.1 + pr * 0.32) * 0.6
        + Math.sin(ct * 2.1 - t * 1.4 + pr * 0.11) * 0.4
    const dx = ct - pointer.x
    const dy = prt - pointer.y
    const lift = Math.exp(-(dx * dx * 9 + dy * dy * 14)) * 34
    const y = horizon + pz * depth + wave * amp * (0.25 + pz) - lift * (0.35 + pz)
    if (c === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = withAlpha(colors.accent, 0.62)
  ctx.lineWidth = 1.4
  ctx.stroke()

  raf = requestAnimationFrame(draw)
}

function withAlpha(color: string, alpha: number) {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex
    const n = Number.parseInt(full, 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
  }
  return color
}

function onPointer(event: PointerEvent) {
  const el = canvas.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  pointer.tx = (event.clientX - rect.left) / rect.width
  pointer.ty = (event.clientY - rect.top) / rect.height
}

function start() {
  if (raf) return
  raf = requestAnimationFrame(draw)
}

function stop() {
  cancelAnimationFrame(raf)
  raf = 0
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  ctx = el.getContext('2d')
  resize()

  if (prefersReducedMotion()) {
    draw(0)
    stop()
    return
  }

  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onPointer, { passive: true })

  // Fuera de pantalla no se pinta: en un portátil esto es la diferencia entre
  // el ventilador encendido y apagado mientras se lee el resto de la página.
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) start()
    else stop()
  }, { threshold: 0 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onPointer)
})
</script>

<template>
  <canvas ref="canvas" class="field" aria-hidden="true" />
</template>

<style scoped>
.field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  /*
   * Doble máscara: la radial recorta el plano contra los bordes, y la lineal
   * lo apaga por la izquierda, que es donde va el texto del héroe. Sin la
   * segunda, la línea ámbar cruza el titular y compite con él.
   */
  mask-image:
    radial-gradient(115% 105% at 62% 34%, #000 34%, transparent 80%),
    linear-gradient(100deg, transparent 2%, rgb(0 0 0 / 55%) 30%, #000 56%);
  mask-composite: intersect;
}
</style>
