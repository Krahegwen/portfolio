import type { I18nText } from './profile'

/**
 * Política de privacidad.
 *
 * Escrita a mano y no copiada de una plantilla, porque una plantilla describe
 * cookies que esta web no pone y omite lo que sí hace. Si cambia algo de lo que
 * se cuenta aquí —un servicio nuevo, otro canal de aviso— **este fichero se
 * actualiza en el mismo commit**: una política que miente es peor que no tenerla.
 *
 * Estado a 2026-08-31, verificado contra el código:
 *   · Ninguna cookie para quien solo lee. Una, `cv_pase` (30 días), si se
 *     desbloquean las versiones no públicas del CV. Ninguna de terceros.
 *   · localStorage: `kw-theme` (claro/oscuro) y, tras ese desbloqueo, `kw-cv`.
 *   · Fuentes autoalojadas: no hay petición a Google.
 *   · Cloudflare Web Analytics: sin cookies ni identificador persistente.
 *   · Formulario: nombre, correo y mensaje, con consentimiento expreso. El aviso
 *     sale por Telegram, que por tanto ve el mensaje. Hay que decirlo.
 *   · Descarga de CV: variante e idioma. Nunca quién.
 *   · Dos proveedores: Cloudflare y Telegram.
 */

export interface Bloque {
  id: string
  titulo: I18nText
  parrafos: I18nText[]
  lista?: I18nText[]
}

export const actualizado = '2026-08-31'

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
    titulo: { es: 'Cookies: ninguna, salvo una', en: 'Cookies: none, except one' },
    parrafos: [
      {
        es: 'Si estás leyendo esta web, no llevas ninguna. Ni propia ni de terceros. Por eso no verás un banner pidiéndote permiso: un aviso de cookies en una web sin cookies es ruido que se firma sin leer y que enseña a firmar sin leer los que sí importan.',
        en: 'If you are reading this site, you are carrying none. None of my own, none from third parties. That is why you will not see a banner asking for permission: a cookie notice on a site with no cookies is noise that gets clicked through without reading, and it teaches people to click through the ones that do matter.',
      },
      {
        es: 'La excepción no te afecta, y la cuento igual, porque una política que se calla lo incómodo no sirve para nada. La página del CV publica una sola versión, la pública; las otras dos —una anónima y una interna— se abren tecleando una contraseña que solo tengo yo, y al acertar el servidor deja una cookie llamada `cv_pase` que caduca a los treinta días. Dentro hay una fecha y su firma, nada más: no dice quién, no mide y no viaja a ningún tercero. No pide consentimiento porque es estrictamente necesaria para una función que se solicita de forma expresa —escribiendo esa contraseña— y sin eso no ocurre. Para que nadie pruebe contraseñas a lo bruto, el servidor cuenta los intentos de una misma conexión con la misma huella criptográfica que usa el formulario, y solo mientras dura esa media hora.',
        en: 'The exception does not affect you, and I am telling you anyway, because a policy that stays quiet about the awkward part is worth nothing. The CV page publishes a single version, the public one; the other two — an anonymous one and an internal one — open by typing a password only I have, and on success the server leaves a cookie called `cv_pase` that expires after thirty days. Inside there is a date and its signature, nothing else: it says nothing about who, it measures nothing, and it travels to no third party. It asks for no consent because it is strictly necessary for a feature that is expressly requested — by typing that password — and without that it never happens. So that nobody tries passwords in bulk, the server counts attempts from the same connection using the same cryptographic fingerprint as the form, and only for as long as that half hour lasts.',
      },
      {
        es: 'Lo único que esta web guarda en tu navegador es una clave llamada `kw-theme` con el valor `light` o `dark`, para recordar si elegiste el tema claro. No se envía a ningún sitio, no identifica a nadie y desaparece si borras los datos del navegador. Si algún día desbloqueas las versiones no públicas del CV se le suma `kw-cv`, que solo apunta cuándo caduca ese desbloqueo.',
        en: 'The only thing this site stores in your browser is a key called `kw-theme` holding `light` or `dark`, so it remembers whether you picked the light theme. It is never sent anywhere, it identifies nobody, and it disappears if you clear your browser data. If you ever unlock the non-public versions of the CV, `kw-cv` joins it, and all it notes is when that unlock expires.',
      },
    ],
  },
  {
    id: 'analitica',
    titulo: { es: 'Analítica', en: 'Analytics' },
    parrafos: [
      {
        es: 'Uso Cloudflare Web Analytics para saber qué páginas se leen. No pone cookies ni crea un identificador que te siga entre visitas: los datos son agregados y no permiten reconstruir el recorrido de una persona concreta.',
        en: 'I use Cloudflare Web Analytics to know which pages get read. It sets no cookies and creates no identifier that follows you between visits: the data is aggregated and cannot be used to reconstruct one person’s path.',
      },
      {
        es: 'Aparte, cuando alguien se descarga un CV me llega un aviso con la versión y el idioma. Nada más: ni quién, ni desde dónde, ni con qué navegador. Saber que hoy se han bajado tres CV en inglés me sirve; saber quién lo hizo, no.',
        en: 'Separately, when someone downloads a CV I get a notification with the version and the language. Nothing else: not who, not from where, not with which browser. Knowing that three English CVs were downloaded today is useful to me; knowing who downloaded them is not.',
      },
      {
        es: 'Base legal: interés legítimo en saber si lo que publico se lee y funciona, con un tratamiento que no permite identificarte.',
        en: 'Legal basis: legitimate interest in knowing whether what I publish gets read and works, using processing that cannot identify you.',
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
        es: 'Un detalle que conviene que sepas, porque no es lo que uno se imagina: el aviso de que has escrito me llega **por Telegram**, así que tu mensaje pasa por sus servidores además de llegarme a mí. No hay base de datos de formularios ni panel donde queden almacenados — lo que hay es ese aviso, en un chat mío. Si prefieres que tu mensaje no pase por ahí, escríbeme directamente al correo del pie.',
        en: 'One detail worth knowing, because it is not what you would assume: the alert telling me you have written arrives **over Telegram**, so your message passes through their servers as well as reaching me. There is no form database and no dashboard where submissions pile up — there is that alert, in a chat of mine. If you would rather your message did not go through there, write to the address in the footer instead.',
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
        es: 'Dos, y ninguno más:',
        en: 'Two, and no others:',
      },
    ],
    lista: [
      {
        es: '**Cloudflare** — aloja la web y presta la analítica. Como cualquier servidor, registra las peticiones que recibe para poder operar y defenderse de abusos.',
        en: '**Cloudflare** — hosts the site and provides the analytics. Like any server, it logs the requests it receives in order to operate and to defend against abuse.',
      },
      {
        es: '**Telegram** — transporta los avisos, así que ve el contenido del formulario. Solo interviene si escribes; si únicamente lees la web, Telegram no se entera de que existes.',
        en: '**Telegram** — carries the notifications, so it sees the contents of the form. It only comes into play if you write; if you simply read the site, Telegram never learns you exist.',
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
