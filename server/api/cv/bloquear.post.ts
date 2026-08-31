import { anularPase } from '../../utils/pase'

/**
 * Cierra el pase. Un pestillo que solo se abre no es un pestillo: si desbloqueo
 * el CV en un ordenador prestado quiero poder deshacerlo sin esperar un mes ni
 * ir a borrar cookies a mano.
 *
 * No comprueba nada antes de borrar: pedir un pase válido para retirar un pase
 * sería negarle a alguien el derecho a cerrar la puerta que ya está cerrada.
 */
export default defineEventHandler((event) => {
  anularPase(event)
  return { ok: true }
})
