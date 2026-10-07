/**
 * Browser smoke test for every page in the sitemap.
 *
 * The build catches MDX and type errors, but not a visualizer that throws when
 * stepped, a hydration mismatch, or a layout that scrolls sideways on a phone.
 * This loads each page in Chromium at phone width, presses Next once on every
 * step player, and fails if anything logs an error or overflows horizontally.
 *
 * Usage: start the production server, then `yarn smoke`.
 *   BASE_URL     server to test (default http://localhost:3000)
 *   CONCURRENCY  pages tested in parallel (default 4)
 */
import { chromium } from 'playwright'

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 4)
const SERVER_WAIT_MS = 60_000

async function waitForServer() {
  const deadline = Date.now() + SERVER_WAIT_MS
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE_URL}/sitemap.xml`)
      if (res.ok) return res.text()
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`Server at ${BASE_URL} did not respond within ${SERVER_WAIT_MS / 1000}s`)
}

/** Sitemap URLs use the production origin; test the same paths locally. */
function pathsFromSitemap(xml) {
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const url = new URL(m[1])
    return url.pathname + url.search
  })
  return [...new Set(paths)]
}

async function checkPage(context, path) {
  const page = await context.newPage()
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))

  try {
    const res = await page.goto(BASE_URL + path, { waitUntil: 'load', timeout: 30_000 })
    if (!res || res.status() !== 200) errors.push(`status ${res?.status() ?? 'none'}`)

    // Step every visualizer once, so a frame that only breaks after the first
    // one (most of them) is exercised too.
    const nextButtons = page.getByRole('button', { name: 'Next', exact: true })
    const count = await nextButtons.count()
    for (let i = 0; i < count; i++) {
      await nextButtons.nth(i).click({ timeout: 5_000 })
    }
    await page.waitForTimeout(100)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    if (overflow > 1) errors.push(`horizontal overflow of ${overflow}px`)
  } catch (err) {
    errors.push(`exception: ${err.message.split('\n')[0]}`)
  } finally {
    await page.close()
  }
  return errors
}

async function main() {
  const xml = await waitForServer()
  const paths = pathsFromSitemap(xml)
  console.log(`Smoke-testing ${paths.length} pages at ${BASE_URL} (concurrency ${CONCURRENCY})`)

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })

  const failures = []
  let next = 0
  async function worker() {
    while (next < paths.length) {
      const path = paths[next++]
      const errors = await checkPage(context, path)
      if (errors.length > 0) failures.push({ path, errors })
    }
  }
  const started = Date.now()
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  await browser.close()

  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  if (failures.length === 0) {
    console.log(`All ${paths.length} pages passed in ${seconds}s`)
    return
  }
  console.error(`\n${failures.length} of ${paths.length} pages failed:`)
  for (const { path, errors } of failures) {
    console.error(`\n  ${path}`)
    for (const e of errors) console.error(`    - ${e}`)
  }
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
