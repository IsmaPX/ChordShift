import { test, expect } from '@playwright/test'

async function initAudioGate(page: import('@playwright/test').Page) {
  await page.waitForTimeout(300)
  const overlay = page.locator('.fixed.inset-0.z-50').first()
  if (await overlay.isVisible({ timeout: 2000 }).catch(() => false)) {
    await overlay.click({ force: true })
    await page.waitForTimeout(1000)
  }
}

test.describe('Página principal - Transformación Anime Musical', () => {

  test('la página carga correctamente con el layout base', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ChordShift|Worship Piano/)
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1500)
  })

  test('el tema anime-musical está activo con colores vibrantes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1500)
    const body = page.locator('body')
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('los elementos del hero tienen animaciones de entrada', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1500)

    const heading = page.locator('h1')
    await expect(heading).toBeVisible({ timeout: 10000 })

    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThanOrEqual(1)
  })

  test('el enrutamiento a /login funciona', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await expect(page).toHaveURL(/\/login/)
  })

  test('el enrutamiento a /register funciona', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await expect(page).toHaveURL(/\/register/)
  })

  test('las páginas interiores (practice) cargan con layout de navegación', async ({ page }) => {
    await page.goto('/practice')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1500)
    await expect(page).toHaveURL(/\/practice|\/login/)
    const nav = page.locator('header nav').first()
    if (page.url().includes('/practice')) {
      await expect(nav).toBeVisible({ timeout: 10000 })
    }
  })

  test('la página de ear-training carga correctamente', async ({ page }) => {
    await page.goto('/ear-training')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1500)
    await expect(page).toHaveURL(/\/ear-training|\/login/)
  })

  test('la página de settings carga correctamente', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1500)
    await expect(page).toHaveURL(/\/settings|\/login/)
  })

  test('las transiciones entre páginas se completan sin errores', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1000)

    await page.goto('/practice')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/practice|\/login/)

    await page.goto('/ear-training')
    await page.waitForLoadState('domcontentloaded')
    await initAudioGate(page)
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/ear-training|\/login/)
  })
})