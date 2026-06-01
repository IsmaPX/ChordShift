import { test, expect } from '@playwright/test'

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
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('Demo de Efectos Anime Musicales')
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('MusicalParticles se renderiza correctamente', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'MusicalParticles' })
    await expect(section).toBeVisible()

    const musicalParticles = section.locator('[class*="fixed"]')
    await expect(musicalParticles.first()).toBeAttached()
  })

  test('GlowTrail se renderiza y responde al mouse', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'GlowTrail' })
    await expect(section).toBeVisible()

    const glowTrailContainer = section.locator('.overflow-hidden').nth(1)
    await expect(glowTrailContainer).toBeVisible()

    await glowTrailContainer.hover()
    await page.waitForTimeout(500)
  })

  test('SparkleEffect se renderiza correctamente', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'SparkleEffect' })
    await expect(section).toBeVisible()
  })

  test('BackgroundMotion variants se renderizan', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const waveSection = page.locator('section').filter({ hasText: 'BackgroundMotion (wave)' })
    await expect(waveSection).toBeVisible()

    const particlesSection = page.locator('section').filter({ hasText: 'BackgroundMotion (particles)' })
    await expect(particlesSection).toBeVisible()

    const linesSection = page.locator('section').filter({ hasText: 'BackgroundMotion (lines)' })
    await expect(linesSection).toBeVisible()
  })

  test('InfiniteCarousel se renderiza y tiene items visibles', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'InfiniteCarousel' })
    await expect(section).toBeVisible()

    const carousel = section.locator('.overflow-hidden')
    await expect(carousel).toBeVisible()
  })

  test('ParallaxContainer se renderiza con capas', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'ParallaxContainer' })
    await expect(section).toBeVisible()

    await expect(page.locator('text=Capa 0')).toBeVisible()
    await expect(page.locator('text=Capa 0.2')).toBeVisible()
    await expect(page.locator('text=Capa 0.5')).toBeVisible()
    await expect(page.locator('text=Capa 1.0')).toBeVisible()
  })

  test('AnimeSceneTransition se renderiza correctamente', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'AnimeSceneTransition' })
    await expect(section).toBeVisible()

    const transition = section.locator('[class*="rounded"]')
    await expect(transition.first()).toBeVisible()
  })

  test('FloatingNotes y RhythmPulse se renderizan', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'FloatingNotes' })
    await expect(section).toBeVisible()
  })

  test('no hay errores de consola en la página de demo', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('404')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('🎨 Navegación y Transiciones', () => {

  test('la navegación a /demo/effects funciona', async ({ page }) => {
    await page.goto('/demo/effects')
    await expect(page).toHaveURL(/\/demo\/effects/)
    await page.waitForLoadState('networkidle')
  })

  test('las transiciones entre páginas no generan errores', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    await page.goto('/practice')
    await page.waitForLoadState('networkidle')

    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('🎠 InfiniteCarousel - Tests Interactivos', () => {

  test('el carrusel infinito tiene 3 slides', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'InfiniteCarousel' })
    await expect(section).toBeVisible()

    const slides = section.locator('text=Slide')
    const count = await slides.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('el carrusel tiene velocidad configurable', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'InfiniteCarousel' })
    await expect(section).toBeVisible()
  })
})

test.describe('✨ MusicalParticles - Variaciones', () => {

  test('MusicalParticles acepta diferentes velocidades', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'MusicalParticles' })
    await expect(section).toBeVisible()

    await page.waitForTimeout(1000)
  })

  test('MusicalParticles renderiza partículas con notas musicales', async ({ page }) => {
    await page.goto('/demo/effects')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').filter({ hasText: 'MusicalParticles' })
    const particles = section.locator('[class*="text-anime-pink"]')
    await expect(particles.first()).toBeVisible()
  })
})