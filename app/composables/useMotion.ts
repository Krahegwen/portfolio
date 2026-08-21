import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Capa de animación.
 *
 * Un único sitio registra ScrollTrigger y un único sitio decide si hay que
 * animar. `prefers-reduced-motion` no se comprueba dentro de cada componente:
 * si está activo, los helpers colocan el estado final de una vez y no crean
 * ningún trigger. Así "sin movimiento" significa realmente sin movimiento, no
 * las mismas animaciones a 0.01s.
 */

let registered = false

export function useGsap() {
  if (import.meta.client && !registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  return { gsap, ScrollTrigger }
}

export function prefersReducedMotion(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface RevealOptions {
  y?: number
  delay?: number
  duration?: number
  stagger?: number
  start?: string
  once?: boolean
}

/**
 * Aparición al entrar en pantalla. Devuelve el trigger para poder matarlo.
 * `targets` puede ser un elemento, una lista o un selector dentro de `scope`.
 */
export function revealOnScroll(
  targets: gsap.TweenTarget,
  { y = 28, delay = 0, duration = 0.9, stagger = 0.075, start = 'top 85%', once = true }: RevealOptions = {},
) {
  const { gsap } = useGsap()
  const list = gsap.utils.toArray<HTMLElement>(targets)
  if (!list.length) return null

  if (prefersReducedMotion()) {
    gsap.set(list, { opacity: 1, y: 0, clearProps: 'transform' })
    return null
  }

  gsap.set(list, { opacity: 0, y })
  const tween = gsap.to(list, {
    opacity: 1,
    y: 0,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
    scrollTrigger: { trigger: list[0], start, once },
  })
  return tween.scrollTrigger ?? null
}

/**
 * Parallax vertical ligado al scroll. `depth` positivo va más lento que la
 * página (se queda atrás); negativo, más rápido.
 */
export function parallax(target: gsap.TweenTarget, depth = 0.2, trigger?: Element | string) {
  const { gsap } = useGsap()
  if (prefersReducedMotion()) return null

  const tween = gsap.fromTo(
    target,
    { yPercent: -depth * 50 },
    {
      yPercent: depth * 50,
      ease: 'none',
      scrollTrigger: {
        trigger: trigger ?? (target as Element),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  )
  return tween.scrollTrigger ?? null
}

/** Cuenta hasta `value` cuando la caja entra en pantalla. */
export function countUp(el: HTMLElement, value: number, duration = 1.6) {
  const { gsap } = useGsap()

  if (prefersReducedMotion()) {
    el.textContent = String(value)
    return null
  }

  const state = { n: 0 }
  el.textContent = '0'
  const tween = gsap.to(state, {
    n: value,
    duration,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = String(Math.round(state.n)) },
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  })
  return tween.scrollTrigger ?? null
}

/**
 * Limpia todos los ScrollTriggers creados por un componente.
 * Sin esto, navegar entre páginas deja triggers apuntando a nodos muertos y el
 * cálculo de posiciones se va desviando en cada visita.
 */
export function useMotionScope() {
  const triggers: Array<ScrollTrigger | null> = []

  function track<T extends ScrollTrigger | null>(trigger: T): T {
    if (trigger) triggers.push(trigger)
    return trigger
  }

  onBeforeUnmount(() => {
    triggers.forEach(trigger => trigger?.kill())
    triggers.length = 0
  })

  return { track }
}
