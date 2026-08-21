import type { Locale } from '~~/content/profile'

/**
 * Aritmética de fechas del CV.
 *
 * Todo lo que en un CV de papel es un número escrito a mano —"+5 años de
 * experiencia"— aquí se calcula desde la fecha de inicio. Es la diferencia entre
 * un CV que envejece y uno que no: los seis documentos originales decían "+5
 * años" tres años después de ser ciertos.
 */

const MONTHS: Record<Locale, string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

/** Convierte `2021-09` en el instante del día 1 de ese mes, en local. */
export function parseMonth(value: string): Date {
  const [year, month] = value.split('-').map(Number)
  return new Date(year!, (month ?? 1) - 1, 1)
}

/** Meses completos entre dos marcas `YYYY-MM`. `end` nulo significa hoy. */
export function monthsBetween(start: string, end: string | null, now = new Date()): number {
  const a = parseMonth(start)
  const b = end ? parseMonth(end) : now
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()))
}

/** Años enteros transcurridos. Lo que se pinta en los contadores. */
export function yearsSince(start: string, now = new Date()): number {
  return Math.floor(monthsBetween(start, null, now) / 12)
}

/** `2021-09` → `sep 2021` / `Sep 2021`. */
export function formatMonth(value: string, locale: Locale): string {
  const date = parseMonth(value)
  return `${MONTHS[locale][date.getMonth()]} ${date.getFullYear()}`
}

/** `sep 2021 — actualidad`, con la palabra correcta según el idioma. */
export function formatRange(start: string, end: string | null, locale: Locale): string {
  const now = locale === 'es' ? 'actualidad' : 'Present'
  return `${formatMonth(start, locale)} — ${end ? formatMonth(end, locale) : now}`
}

/** `4 años 11 meses`, sin dejar caer el plural ni el cero. */
export function formatDuration(start: string, end: string | null, locale: Locale, now = new Date()): string {
  const total = monthsBetween(start, end, now)
  const years = Math.floor(total / 12)
  const months = total % 12

  const parts: string[] = []
  if (years > 0) {
    parts.push(locale === 'es'
      ? `${years} ${years === 1 ? 'año' : 'años'}`
      : `${years} ${years === 1 ? 'yr' : 'yrs'}`)
  }
  if (months > 0 || years === 0) {
    parts.push(locale === 'es'
      ? `${months} ${months === 1 ? 'mes' : 'meses'}`
      : `${months} ${months === 1 ? 'mo' : 'mos'}`)
  }
  return parts.join(' ')
}
