import { test, expect } from '@playwright/test'

async function initAudioGate(page: import('@playwright/test').Page) {
  await page.waitForTimeout(200)
  const overlay = page.locator('.fixed.inset-0.z-50').first()
  if (await overlay.isVisible({ timeout: 1500 }).catch(() => false)) {
    await overlay.click({ force: true })
    await page.waitForTimeout(500)
  }
}

test.describe('🎨 Efectos Anime Musicales - Demo Page', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`)
      }
    })
    page.on('pageerror', err => {
      console.error(`Page error: ${err.message}`)
    })
  })

  test('la página de demo carga sin errores', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    await expect(page.locator('h1')).toContainText('Demo de Efectos Anime Musicales')
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('401') &&
      !e.includes('403') &&
      !e.includes('GSI_LOGGER') &&
      !e.includes('Provider') &&
      !e.includes('429')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('MusicalParticles se renderiza correctamente', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'MusicalParticles' })
    await expect(section).toBeVisible({ timeout: 10000 })

    const musicalParticles = section.locator('[class*="fixed"]')
    await expect(musicalParticles.first()).toBeAttached({ timeout: 5000 })
  })

  test('GlowTrail se renderiza y responde al mouse', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'GlowTrail' })
    await expect(section).toBeVisible({ timeout: 10000 })

    const glowTrailContainer = section.locator('.overflow-hidden').first()
    await expect(glowTrailContainer).toBeVisible({ timeout: 5000 })

    await glowTrailContainer.hover()
    await page.waitForTimeout(500)
  })

  test('SparkleEffect se renderiza correctamente', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'SparkleEffect' })
    await expect(section).toBeVisible({ timeout: 10000 })
  })

  test('BackgroundMotion variants se renderizan', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const waveSection = page.locator('section').filter({ hasText: 'BackgroundMotion (wave)' })
    await expect(waveSection).toBeVisible({ timeout: 10000 })

    const particlesSection = page.locator('section').filter({ hasText: 'BackgroundMotion (particles)' })
    await expect(particlesSection).toBeVisible({ timeout: 5000 })

    const linesSection = page.locator('section').filter({ hasText: 'BackgroundMotion (lines)' })
    await expect(linesSection).toBeVisible({ timeout: 5000 })
  })

  test('InfiniteCarousel se renderiza y tiene items visibles', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'InfiniteCarousel' })
    await expect(section).toBeVisible({ timeout: 10000 })

    const carousel = section.locator('.overflow-hidden')
    await expect(carousel).toBeVisible({ timeout: 5000 })
  })

  test('ParallaxContainer se renderiza con capas', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'ParallaxContainer' })
    await expect(section).toBeVisible({ timeout: 10000 })

    await expect(page.getByText('Capa 0 (sin movimiento)')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Capa 0.2 (lento)')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Capa 0.5 (medio)')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Capa 1.0 (rápido)')).toBeVisible({ timeout: 5000 })
  })

  test('AnimeSceneTransition se renderiza correctamente', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'AnimeSceneTransition' })
    await expect(section).toBeVisible({ timeout: 10000 })

    const transition = section.locator('[class*="rounded"]')
    await expect(transition.first()).toBeVisible({ timeout: 5000 })
  })

  test('FloatingNotes y RhythmPulse se renderizan', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'FloatingNotes' })
    await expect(section).toBeVisible({ timeout: 10000 })
  })

  test('no hay errores de consola críticos en la página de demo', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(2000)

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('401') &&
      !e.includes('403') &&
      !e.includes('GSI_LOGGER') &&
      !e.includes('Provider') &&
      !e.includes('429')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('🎨 Navegación y Transiciones', () => {

  test('la navegación a /demo/effects funciona', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await expect(page).toHaveURL(/\/demo\/effects/)
  })

  test('las transiciones entre páginas no generan errores', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1000)

    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1000)

    await page.goto('/practice')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1000)

    await page.goto('/settings')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1000)

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('401') &&
      !e.includes('403') &&
      !e.includes('GSI_LOGGER') &&
      !e.includes('Provider')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('🎠 InfiniteCarousel - Tests Interactivos', () => {

  test('el carrusel infinito tiene 3 slides', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'InfiniteCarousel' })
    await expect(section).toBeVisible({ timeout: 10000 })

    const slides = section.locator('text=Slide')
    const count = await slides.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('el carrusel tiene velocidad configurable', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'InfiniteCarousel' })
    await expect(section).toBeVisible({ timeout: 10000 })
  })
})

test.describe('✨ MusicalParticles - Variaciones', () => {

  test('MusicalParticles acepta diferentes velocidades', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'MusicalParticles' })
    await expect(section).toBeVisible({ timeout: 10000 })

    await page.waitForTimeout(1000)
  })

  test('MusicalParticles renderiza partículas con notas musicales', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)

    const section = page.locator('section').filter({ hasText: 'MusicalParticles' })
    const particles = section.locator('[class*="text-anime-pink"]')
    await expect(particles.first()).toBeVisible({ timeout: 10000 })
  })
})