import { accessSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

/**
 * Chrome headless como impresora.
 *
 * No se instala Puppeteer a propósito: bajaría un Chromium de ~150 MB para hacer
 * lo que el Chrome (o el Edge) que ya está en la máquina hace con dos banderas.
 * A cambio hay que localizar el binario, que es lo que resuelve este módulo.
 */

const CANDIDATES = process.platform === 'win32'
  ? [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    ]
  : process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      ]
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']

export function findChrome() {
  const fromEnv = process.env.CHROME_PATH
  const list = fromEnv ? [fromEnv, ...CANDIDATES] : CANDIDATES
  for (const path of list) {
    try {
      accessSync(path)
      return path
    }
    catch { /* siguiente candidato */ }
  }
  throw new Error(
    'No encuentro Chrome ni Edge. Instala uno, o apunta CHROME_PATH al binario.',
  )
}

/**
 * Ejecuta Chrome con un perfil desechable. Sin `--user-data-dir` propio, una
 * instancia ya abierta se queda con la orden y el proceso headless sale sin
 * escribir nada — y sin error.
 */
export function runChrome(args, { timeout = 90_000 } = {}) {
  const chrome = findChrome()
  const profile = mkdtempSync(join(tmpdir(), 'kw-chrome-'))

  return new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--no-first-run',
      '--disable-extensions',
      `--user-data-dir=${profile}`,
      ...args,
    ], { stdio: ['ignore', 'pipe', 'pipe'] })

    let stderr = ''
    child.stderr.on('data', chunk => { stderr += chunk })

    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`Chrome no terminó en ${timeout / 1000}s`))
    }, timeout)

    child.on('error', reject)
    child.on('close', (code) => {
      clearTimeout(timer)
      rmSync(profile, { recursive: true, force: true })
      if (code === 0) resolve()
      else reject(new Error(`Chrome salió con código ${code}\n${stderr}`))
    })
  })
}

/** Espera a que una URL responda. Devuelve false si se agota el plazo. */
export async function waitForServer(url, { timeout = 40_000, interval = 400 } = {}) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' })
      if (response.status < 500) return true
    }
    catch { /* todavía no escucha */ }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  return false
}
