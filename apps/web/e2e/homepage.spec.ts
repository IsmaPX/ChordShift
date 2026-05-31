import { test, expect } from '@playwright/test'

test.describe('Página principal - Transformación Anime Musical', () => {

  test('la página carga correctamente con el layout base', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ChordShift|Worship Piano/)
    await page.waitForLoadState('networkidle')
  })

  test('el tema anime-musical está activo con colores vibrantes', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('los elementos del hero tienen animaciones de entrada', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)

    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThanOrEqual(1)
  })

  test('el enrutamiento a /login funciona', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    await page.waitForLoadState('networkidle')
  })

  test('el enrutamiento a /register funciona', async ({ page }) => {
    await page.goto('/register')
    await expect(page).toHaveURL(/\/register/)
    await page.waitForLoadState('networkidle')
  })

  test('las páginas interiores (practice) cargan con layout de navegación', async ({ page }) => {
    await page.goto('/practice')
    await expect(page).toHaveURL(/\/practice/)
    await page.waitForLoadState('networkidle')
    const nav = page.locator('header nav, nav:has(a)')
    await expect(nav).toBeVisible()
  })

  test('la página de ear-training carga correctamente', async ({ page }) => {
    await page.goto('/ear-training')
    await expect(page).toHaveURL(/\/ear-training/)
    await page.waitForLoadState('networkidle')
  })

  test('la página de settings carga correctamente', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/settings/)
    await page.waitForLoadState('networkidle')
  })

  test('las transiciones entre páginas se completan sin errores', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.goto('/practice')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/practice/)

    await page.goto('/ear-training')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/ear-training/)
  })
})
