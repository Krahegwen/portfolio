import type { I18nText } from './profile'

/**
 * Política de privacidad.
 *
 * Escrita a mano y no copiada de una plantilla, porque una plantilla describe
 * cookies que esta web no pone y omite lo que sí hace. Si cambia algo de lo que
 * se cuenta aquí —un servicio nuevo, otro canal de aviso— **este fichero se
 * actualiza en el mismo commit**: una política que miente es peor que no tenerla.
 *
 * Estado a 2026-08-21, verificado contra el código:
 *   · Ninguna cookie. Ni propia ni de terceros.
 *   · localStorage: solo la clave `kw-theme` (claro/oscuro).
 *   · Fuentes autoalojadas: no hay petición a Google.
 *   · Vercel Analytics y Speed Insights: sin cookies ni identificador persistente.
 *   · Sentry: `sendDefaultPii: false`, sin IP.
 *   · Formulario: nombre, correo y mensaje, con consentimiento expreso.
 *   · Descarga de CV: variante, idioma y hora. Nunca quién.
 */

export interface Bloque {
  id: string
  titulo: I18nText
  parrafos: I18nText[]
  lista?: I18nText[]
}

export const actualizado = '2026-08-21'

export const intro: I18nText = {
  es: 'Esta es una web personal. No vende nada, no tiene usuarios registrados y no vive de la publicidad, así que recoge muy poco. Lo que recoge está aquí, en el mismo orden en que ocurre.',
  en: 'This is a personal site. It sells nothing, has no registered users and does not live off advertising, so it collects very little. What it does collect is listed here, in the order it happens.',
}

export const bloques: Bloque[] = [
  {
    id: 'responsable',
    titulo: { es: 'Quién responde de esto', en: 'Who is responsible' },
    parrafos: [
      {
        es: 'Diego Portilla Tejería, a título particular, desde Cantabria (España). Para cualquier cosa relacionada con tus datos —incluido pedir que los borre— el canal es el correo que aparece en el pie de esta página.',
        en: 'Diego Portilla Tejería, in a personal capacity, from Cantabria (Spain). For anything to do with your data — including asking me to delete it — the channel is the email address in the footer of this page.',
      },
    ],
  },
  {
    id: 'cookies',
    titulo: { es: 'Cookies: no hay', en: 'Cookies: there are none' },
    parrafos: [
      {
        es: 'Ni propias ni de terceros. Por eso no verás un banner pidiéndote permiso: un aviso de cookies en una web sin cookies es ruido que se firma sin leer y que enseña a firmar sin leer los que sí importan.',
        en: 'None of my own, none from third parties. That is why you will not see a banner asking for permission: a cookie notice on a site with no cookies is noise that gets clicked through without reading, and it teaches people to click through the ones that do matter.',
      },
      {
        es: 'Lo único que esta web guarda en tu navegador es una clave llamada `kw-theme` con el valor `light` o `dark`, para recordar si elegiste el tema claro. No se envía a ningún sitio, no identifica a nadie y desaparece si borras los datos del navegador.',
        en: 'The only thing this site stores in your browser is a key called `kw-theme` holding `light` or `dark`, so it remembers whether you picked the light theme. It is never sent anywhere, it identifies nobody, and it disappears if you clear your browser data.',
      },
    ],
  },
  {
    id: 'analitica',
    titulo: { es: 'Analítica', en: 'Analytics' },
    parrafos: [
      {
        es: 'Uso Vercel Web Analytics y Speed Insights para saber qué páginas se leen y si el sitio va rápido. Ninguno de los dos pone cookies ni crea un identificador que te siga entre visitas: los datos son agregados y no permiten reconstruir el recorrido de una persona concreta.',
        en: 'I use Vercel Web Analytics and Speed Insights to know which pages get read and whether the site is fast. Neither sets cookies nor creates an identifier that follows you between visits: the data is aggregated and cannot be used to reconstruct one person’s path.',
      },
      {
        es: 'Además registro dos acciones concretas, y solo como recuento: cuántas veces se descarga cada versión del CV y en qué idioma, y cuántos mensajes llegan por el formulario. De la descarga se guarda la variante, el idioma y la hora. No se guarda quién.',
        en: 'I also record two specific actions, purely as counts: how many times each version of the CV is downloaded and in which language, and how many messages arrive through the form. For a download, what is stored is the variant, the language and the time. Not who.',
      },
      {
        es: 'Base legal: interés legítimo en saber si lo que publico se lee y funciona, con un tratamiento que no permite identificarte.',
        en: 'Legal basis: legitimate interest in knowing whether what I publish gets read and works, using processing that cannot identify you.',
      },
    ],
  },
  {
    id: 'errores',
    titulo: { es: 'Errores', en: 'Errors' },
    parrafos: [
      {
        es: 'Si algo se rompe mientras navegas, el fallo se envía a Sentry para que pueda arreglarlo. Va configurado con la recogida de datos personales desactivada: llega el error y en qué parte del código ocurrió, no tu dirección IP.',
        en: 'If something breaks while you browse, the failure is sent to Sentry so I can fix it. It is configured with personal-data collection switched off: what arrives is the error and where in the code it happened, not your IP address.',
      },
      {
        es: 'Base legal: interés legítimo en mantener el sitio en funcionamiento.',
        en: 'Legal basis: legitimate interest in keeping the site working.',
      },
    ],
  },
  {
    id: 'formulario',
    titulo: { es: 'El formulario de contacto', en: 'The contact form' },
    parrafos: [
      {
        es: 'Aquí sí hay datos personales, y son los que tú escribes: tu nombre, tu correo y tu mensaje. Los recojo con un único fin, responderte, y por eso la casilla de consentimiento es obligatoria y no viene marcada.',
        en: 'This is where personal data does appear, and it is what you type: your name, your email and your message. I collect it for one purpose, replying to you, which is why the consent box is mandatory and not pre-ticked.',
      },
      {
        es: 'Un detalle que conviene que sepas porque no es lo habitual: el aviso de que has escrito me llega a través de Sentry, la misma herramienta con la que vigilo los errores. Es decir, tu mensaje pasa por Sentry además de llegarme a mí. No hay una base de datos con formularios: lo que hay es ese aviso.',
        en: 'One detail worth knowing because it is not the usual setup: the alert telling me you have written arrives through Sentry, the same tool I use to watch for errors. That means your message passes through Sentry as well as reaching me. There is no database of form submissions: there is that alert.',
      },
      {
        es: 'Para frenar el spam automatizado, el servidor cuenta cuántos envíos llegan desde una misma conexión en los últimos diez minutos. Para eso no guarda tu IP, sino una huella criptográfica suya que vive en memoria y se descarta al cerrarse esa ventana.',
        en: 'To slow down automated spam, the server counts how many submissions arrive from the same connection within the last ten minutes. To do that it does not store your IP, but a cryptographic fingerprint of it that lives in memory and is discarded when that window closes.',
      },
      {
        es: 'Base legal: tu consentimiento, que puedes retirar cuando quieras escribiéndome. Conservación: mientras dure la conversación y un tiempo razonable después; si me pides que lo borre, lo borro.',
        en: 'Legal basis: your consent, which you may withdraw at any time by writing to me. Retention: for as long as the conversation lasts and a reasonable period after; if you ask me to delete it, I delete it.',
      },
    ],
  },
  {
    id: 'terceros',
    titulo: { es: 'Quién más toca esto', en: 'Who else is involved' },
    parrafos: [
      {
        es: 'Dos proveedores, y ninguno más:',
        en: 'Two providers, and no others:',
      },
    ],
    lista: [
      {
        es: '**Vercel** — aloja la web y presta la analítica. Como cualquier servidor, registra las peticiones que recibe para poder operar y defenderse de abusos.',
        en: '**Vercel** — hosts the site and provides the analytics. Like any server, it logs the requests it receives in order to operate and to defend against abuse.',
      },
      {
        es: '**Sentry** — recoge los errores y transporta los avisos del formulario.',
        en: '**Sentry** — collects the errors and carries the contact-form alerts.',
      },
      {
        es: 'Las tipografías están alojadas en este mismo dominio a propósito. Cargarlas desde Google Fonts, que es lo normal, habría enviado tu IP a Google en cada visita; se descargaron una vez y se sirven desde aquí.',
        en: 'The typefaces are hosted on this domain on purpose. Loading them from Google Fonts, which is the usual approach, would have sent your IP to Google on every visit; they were downloaded once and are served from here.',
      },
    ],
  },
  {
    id: 'derechos',
    titulo: { es: 'Tus derechos', en: 'Your rights' },
    parrafos: [
      {
        es: 'Puedes pedirme acceso a lo que tenga sobre ti, su rectificación o su supresión, oponerte al tratamiento o pedir que lo limite. Basta un correo, y no tienes que justificarte. Si crees que no te he atendido como debía, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).',
        en: 'You can ask me for access to whatever I hold about you, for it to be corrected or deleted, object to the processing, or ask me to restrict it. An email is enough, and you do not need to justify yourself. If you think I have not handled it properly, you can complain to the Spanish Data Protection Agency (aepd.es).',
      },
      {
        es: 'En la práctica, si me escribiste por el formulario y quieres que lo borre todo, dímelo en respuesta a mi correo y queda hecho.',
        en: 'In practice, if you wrote through the form and want everything deleted, say so in reply to my email and it is done.',
      },
    ],
  },
]
