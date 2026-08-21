/**
 * Fuente única de verdad del CV.
 *
 * Consolidado a partir de los seis documentos de `CV/` (2022-2023) más lo que el
 * propio git demuestra a 2026. Cada documento original tenía una peculiaridad, y
 * aquí se conserva como metadato en lugar de como archivo aparte: quién ve el
 * nombre, quién ve el teléfono y —la importante— quién ve el nombre del cliente.
 *
 * Los highlights de cliente van marcados `internal: true` porque los CV públicos
 * de origen (`CV_Anon`, `CV_Diego_Portilla_Tejería`) nunca los nombraban: decían
 * "one of the biggest petrochemical companies". Solo el deck interno de Accenture
 * los nombra. La web es pública, así que esa línea se respeta.
 */

export type Locale = 'es' | 'en'

/** Los tres destinatarios: público/recruiter, proceso ciego, staffing interno. */
export type CvVariant = 'recruiter' | 'anon' | 'accenture'

export interface I18nText { es: string, en: string }

export interface Highlight {
  text: I18nText
  /** Nombre del cliente. Solo se pinta en la variante `accenture`. */
  client?: string
  internal?: boolean
}

export interface Job {
  id: string
  company: string
  location: I18nText
  role: I18nText
  /** Título tal y como lo pide el formato interno de Accenture. */
  roleInternal?: I18nText
  start: string
  end: string | null
  highlights: Highlight[]
  stack: string[]
}

export const identity = {
  name: 'Diego Portilla Tejería',
  initials: 'DP',
  handle: 'Krahegwen',
  title: {
    es: 'Desarrollador Front-End Senior',
    en: 'Senior Front-End Developer',
  } as I18nText,
  titleInternal: {
    es: 'Front End Development Sr Analyst',
    en: 'Front End Development Sr Analyst',
  } as I18nText,
  location: { es: 'Cantabria, España', en: 'Cantabria, Spain' } as I18nText,
  email: 'diego.portilla@protonmail.com',
  emailInternal: 'diego.portilla@accenture.com',
  phone: '+34 636 301 977',
  /**
   * Si el teléfono sale en el PDF público. **Por defecto no**, y a conciencia:
   * ese PDF queda en una URL abierta e indexable, no en el adjunto de un correo
   * a un recruiter concreto. Un número ahí lo recogen los rastreadores en
   * cuestión de días y no se puede retirar de las cachés.
   *
   * Ponlo a `true` si prefieres que aparezca; el resto del montaje ya lo
   * respeta y solo afecta al PDF `recruiter` (ni el anónimo ni el interno lo
   * pintan nunca, pase lo que pase con esta bandera).
   */
  publishPhone: false,
  github: 'https://github.com/Krahegwen',
  site: 'https://krahegwen.com',
  /** De aquí salen los años de experiencia. No hay ninguna cifra escrita a mano. */
  careerStart: '2017-06',
  vueStart: '2018-04',
  xrStart: '2021-09',
}

export const tagline: I18nText = {
  es: 'Interfaces que aguantan producción y experiencias 3D en el navegador.',
  en: 'Interfaces that hold up in production, and 3D experiences in the browser.',
}

export const summary: Record<CvVariant, I18nText> = {
  recruiter: {
    es: 'Desarrollador front-end en Cantabria, con casi una década construyendo interfaces que aguantan producción. Empecé en ERPs industriales —distribución eléctrica, automoción, petroquímica— y desde 2021 me dedico a experiencias 3D en el navegador: showrooms y configuradores con Babylon.js sobre Vue. Fuera del horario mantengo sistemas completos de punta a punta, de un e-commerce con Nuxt 4 y Medusa a dos sistemas de trading algorítmico en Python con su propia suite de tests.',
    en: 'Front-end developer based in northern Spain, with close to a decade of shipping interfaces that hold up in production. I started on industrial ERPs — power distribution, automotive, petrochemical — and since 2021 I have focused on 3D experiences in the browser: showrooms and configurators built with Babylon.js on top of Vue. Off the clock I run whole systems end to end, from a Nuxt 4 + Medusa storefront to two algorithmic trading systems in Python with their own test suite.',
  },
  anon: {
    es: 'Desarrollador front-end con casi una década de experiencia. Primeros años en ERPs industriales para sectores regulados (distribución eléctrica, automoción, química); desde 2021, especializado en experiencias 3D y WebXR en el navegador con Babylon.js sobre Vue. Perfil de producto completo: llevo proyectos propios desde el diseño de la API hasta el despliegue y su monitorización.',
    en: 'Front-end developer with close to a decade of experience. Early years on industrial ERPs for regulated sectors (power distribution, automotive, chemical); since 2021, specialised in 3D and WebXR browser experiences with Babylon.js on top of Vue. Full-product profile: personal projects taken from API design through to deployment and monitoring.',
  },
  accenture: {
    es: 'Senior Front-End Developer con más de 9 años de experiencia profesional, 8 de ellos con Vue.js. Especializado en experiencias 3D/WebXR en el navegador (Babylon.js) para eCommerce global, con recorrido previo en ERPs de gran cliente. Scrum y Kanban, interlocución directa con cliente y co-redacción de documentación técnica.',
    en: 'Senior Front-End Developer with 9+ years of professional experience, 8 of them with Vue.js. Specialised in 3D/WebXR browser experiences (Babylon.js) for global eCommerce, with prior background in large-client ERPs. Scrum and Kanban, direct client interaction, and co-authoring of technical documentation.',
  },
}

export const jobs: Job[] = [
  {
    id: 'accenture',
    company: 'Accenture',
    location: { es: 'Remoto, España', en: 'Remote, Spain' },
    role: { es: 'Desarrollador Front-End Senior', en: 'Senior Front-End Developer' },
    roleInternal: { es: 'Front End Development Sr Analyst', en: 'Front End Development Sr Analyst' },
    start: '2021-09',
    end: null,
    stack: ['Vue.js', 'Babylon.js', 'WebGL', 'WebXR', 'JavaScript', 'TypeScript', 'SCSS', 'Jira', 'AWS', 'Azure'],
    highlights: [
      {
        client: 'Vertiv',
        internal: true,
        text: {
          es: 'Showroom 3D y tour virtual para un fabricante mundial de hardware de centro de datos: widget en Vue, integración de los assets 3D en la página, diseño de las animaciones y mantenimiento contra el feedback del cliente.',
          en: '3D showroom and virtual tour for a global data-centre hardware manufacturer: Vue widget, 3D asset integration into the page, animation design, and maintenance driven by client feedback.',
        },
      },
      {
        client: 'Kering · Prada',
        internal: true,
        text: {
          es: 'Configurador 3D de producto para marcas de moda de lujo, como experience product lead: aplicación Vue desde cero, integración con los servicios existentes y eCommerce con personalización en 3D.',
          en: '3D product configurator for luxury fashion brands, as experience product lead: Vue application from scratch, integration with the existing services, and an eCommerce flow with 3D customisation.',
        },
      },
      {
        text: {
          es: 'Pipeline de assets digitales (glTF/Babylon.js) e iteración con el equipo de artistas 3D para adaptar los modelos al framework y al presupuesto de la página.',
          en: 'Digital asset pipeline (glTF/Babylon.js) and iteration with the 3D art team to fit models to the framework and to the page budget.',
        },
      },
      {
        text: {
          es: 'Pruebas de concepto de configurador y de realidad aumentada para retail y gran distribución, más widgets a medida embebibles en sitios de terceros.',
          en: 'Configurator and augmented-reality proofs of concept for retail and large distribution, plus bespoke widgets embeddable in third-party sites.',
        },
      },
      {
        text: {
          es: 'Scrum y Kanban, reuniones directas con cliente para desarrollo y feedback continuos, y ticketing en Jira para el mantenimiento.',
          en: 'Scrum and Kanban, direct client meetings for continuous development and feedback, and Jira ticketing for maintenance.',
        },
      },
    ],
  },
  {
    id: 'fieldeas-senior',
    company: 'FIELDEAS',
    location: { es: 'Santander, Cantabria', en: 'Santander, Cantabria, Spain' },
    role: { es: 'Desarrollador Front-End Vue.js', en: 'Vue.js Front-End Developer' },
    start: '2019-03',
    end: '2021-09',
    stack: ['Vue.js', 'JavaScript', 'HTML', 'CSS', 'MySQL', 'SQL Server', 'REST'],
    highlights: [
      {
        client: 'Seat',
        internal: true,
        text: {
          es: 'Parte del equipo a cargo del ERP de la mayor compañía de automoción de España.',
          en: 'Part of the team behind the ERP for the largest car company in Spain.',
        },
      },
      {
        client: 'Repsol',
        internal: true,
        text: {
          es: 'Desarrollador web principal del ERP de la división química de una de las mayores compañías energéticas y petroquímicas del mundo.',
          en: 'Main web developer for the ERP of the chemical division of one of the largest energy and petrochemical companies in the world.',
        },
      },
      {
        text: {
          es: 'Aplicaciones híbridas web y móvil con Vue.js, contra bases MySQL y SQL Server y APIs de terceros.',
          en: 'Hybrid web and mobile applications with Vue.js, against MySQL and SQL Server databases and third-party APIs.',
        },
      },
      {
        text: {
          es: 'Co-redacción de la documentación técnica que se entregaba al cliente.',
          en: 'Co-authoring of the technical documentation delivered to clients.',
        },
      },
    ],
  },
  {
    id: 'fieldeas-junior',
    company: 'FIELDEAS',
    location: { es: 'Santander, Cantabria', en: 'Santander, Cantabria, Spain' },
    role: { es: 'Desarrollador Web', en: 'Developer' },
    start: '2018-04',
    end: '2019-03',
    stack: ['Vue.js', 'JavaScript', 'Java', 'Android', 'AR', 'MySQL', 'SQL Server'],
    highlights: [
      {
        text: {
          es: 'Reconstrucción con Vue.js del ERP de una de las mayores distribuidoras eléctricas de España.',
          en: 'Rebuilt the ERP of one of the largest electricity distribution companies in Spain using Vue.js.',
        },
      },
      {
        text: {
          es: 'Trabajo Fin de Grado sobre realidad aumentada en Android y Java, con gafas de AR.',
          en: 'Final degree project on augmented reality in Android and Java, targeting AR glasses.',
        },
      },
    ],
  },
  {
    id: 'netkia',
    company: 'Netkia',
    location: { es: 'Torrelavega, Cantabria', en: 'Torrelavega, Cantabria, Spain' },
    role: { es: 'Desarrollador web y móvil — prácticas', en: 'Web & Mobile Developer — Internship' },
    start: '2017-06',
    end: '2018-04',
    stack: ['AngularJS 1.5', 'JavaScript', 'HTML', 'CSS', 'PHP'],
    highlights: [
      {
        text: {
          es: 'Mantenimiento de los proyectos existentes en AngularJS 1.5.',
          en: 'Maintenance of the existing AngularJS 1.5 projects.',
        },
      },
      {
        text: {
          es: 'CMS y aplicación móvil para una pequeña compañía aseguradora.',
          en: 'CMS and mobile application for a small insurance company.',
        },
      },
      {
        text: {
          es: 'Arranque de un proyecto en PHP para una empresa minera.',
          en: 'Kick-off of a PHP project for a mining company.',
        },
      },
    ],
  },
]

export const education = [
  {
    id: 'uc',
    title: { es: 'Grado en Ingeniería Informática', en: 'BSc in Computer Engineering' } as I18nText,
    org: { es: 'Universidad de Cantabria', en: 'Universidad de Cantabria' } as I18nText,
    location: { es: 'Santander, Cantabria', en: 'Santander, Cantabria, Spain' } as I18nText,
    start: '2014-09',
    end: '2019-02',
    note: {
      es: 'TFG sobre realidad aumentada en Android y Java.',
      en: 'Final degree project on augmented reality in Android and Java.',
    } as I18nText,
  },
]

export interface Skill {
  name: string | I18nText
  level: number
}

export interface SkillGroup {
  id: string
  label: I18nText
  skills: Skill[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'front',
    label: { es: 'Front-end', en: 'Front-end' },
    skills: [
      { name: 'Vue 3 · Composition API', level: 95 },
      { name: 'JavaScript (ES2023)', level: 93 },
      { name: 'CSS3 · SCSS', level: 90 },
      { name: 'Pinia · Vue Router', level: 88 },
      { name: 'Nuxt 4 · SSR', level: 85 },
      { name: 'Vuetify', level: 85 },
      { name: 'Vite · PWA / Workbox', level: 82 },
      { name: 'TypeScript', level: 78 },
    ],
  },
  {
    id: 'xr',
    label: { es: '3D · WebXR', en: '3D · WebXR' },
    skills: [
      { name: 'Babylon.js', level: 88 },
      { name: 'GSAP · animación', level: 84 },
      { name: 'glTF · pipeline de assets', level: 82 },
      { name: 'WebGL', level: 80 },
      { name: 'AR (Android · Java)', level: 60 },
    ],
  },
  {
    id: 'platform',
    label: { es: 'Plataforma y datos', en: 'Platform & data' },
    skills: [
      { name: 'Node.js', level: 80 },
      { name: 'Python', level: 80 },
      { name: 'Vercel · Cloudflare · VPS', level: 80 },
      { name: 'Cloudflare Workers · D1 · R2', level: 78 },
      { name: 'GitHub Actions · CI/CD', level: 78 },
      { name: 'PostgreSQL · SQLite · MySQL', level: 75 },
      { name: 'Medusa 2.0 · headless commerce', level: 72 },
    ],
  },
  {
    id: 'craft',
    label: { es: 'Método', en: 'Ways of working' },
    skills: [
      { name: 'Scrum · Kanban', level: 90 },
      { name: { es: 'Interlocución con cliente', en: 'Client-facing work' }, level: 88 },
      { name: { es: 'Documentación técnica', en: 'Technical documentation' }, level: 85 },
      { name: 'Vitest · pytest', level: 82 },
      { name: 'AWS · Azure (básico)', level: 55 },
    ],
  },
]

export const industries: I18nText[] = [
  { es: 'eCommerce y retail de lujo', en: 'eCommerce & luxury retail' },
  { es: 'Hardware y centros de datos', en: 'Hardware & data centres' },
  { es: 'Automoción', en: 'Automotive' },
  { es: 'Energía y petroquímica', en: 'Energy & petrochemical' },
  { es: 'Distribución eléctrica', en: 'Power distribution' },
  { es: 'Logística y distribución', en: 'Logistics & distribution' },
  { es: 'Seguros', en: 'Insurance' },
]

export const languages = [
  { name: { es: 'Español', en: 'Spanish' } as I18nText, level: { es: 'Nativo', en: 'Native' } as I18nText, value: 100 },
  { name: { es: 'Inglés', en: 'English' } as I18nText, level: { es: 'B2', en: 'B2' } as I18nText, value: 70 },
]

/** Lo que el formato interno de Accenture pide y ningún otro CV tiene. */
export const functionalExpertise: I18nText[] = [
  { es: 'Desarrollo front-end (Vue.js)', en: 'Front-end development (Vue.js)' },
  { es: 'Desarrollo Web XR (Babylon.js)', en: 'Web XR development (Babylon.js)' },
  { es: 'Metodología Scrum', en: 'Scrum methodologies' },
  { es: 'Metodología Kanban', en: 'Kanban methodologies' },
  { es: 'Nociones de AWS y Azure', en: 'AWS and Azure basics' },
]
