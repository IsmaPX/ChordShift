# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Página principal - Transformación Anime Musical >> la página de ear-training carga correctamente
- Location: e2e\homepage.spec.ts:50:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/ear-training/
Received string:  "https://vercel.com/login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fweb-1tmdqw12l-maikel-js-projects.vercel.app%252Fear-training%26nonce%3Dc6de6c8e9ac006512fb3d8e29e4fb03991b74a3d4c4dc465c662d6b50d278a10"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    11 × unexpected value "https://vercel.com/login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fweb-1tmdqw12l-maikel-js-projects.vercel.app%252Fear-training%26nonce%3Dc6de6c8e9ac006512fb3d8e29e4fb03991b74a3d4c4dc465c662d6b50d278a10"

```

```yaml
- link "Skip to content":
  - /url: "#geist-skip-nav"
- banner:
  - link "Vercel logo":
    - /url: /home
    - button "Vercel Logo":
      - img "Vercel Logo"
  - navigation:
    - navigation:
      - link "Sign Up":
        - /url: /signup?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fweb-1tmdqw12l-maikel-js-projects.vercel.app%252Fear-training%26nonce%3Dc6de6c8e9ac006512fb3d8e29e4fb03991b74a3d4c4dc465c662d6b50d278a10
        - paragraph: Sign Up
- main:
  - heading "Log in to Vercel" [level=1]
  - textbox "Email Address"
  - button "Continue with Email"
  - button "Continue with Google":
    - img
    - text: Continue with Google
  - button "Continue with GitHub":
    - img
    - text: Continue with GitHub
  - button "Continue with Apple":
    - img
    - text: Continue with Apple
  - button "Continue with SAML SSO":
    - img
    - text: Continue with SAML SSO
  - button "Continue with Passkey":
    - img
    - text: Continue with Passkey
  - button "Show other options"
  - paragraph:
    - text: Don't have an account?
    - link "Sign Up":
      - /url: /signup?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fweb-1tmdqw12l-maikel-js-projects.vercel.app%252Fear-training%26nonce%3Dc6de6c8e9ac006512fb3d8e29e4fb03991b74a3d4c4dc465c662d6b50d278a10
  - link "Terms":
    - /url: /legal/terms
  - link "Privacy Policy":
    - /url: /legal/privacy-policy
- alert
- img
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Página principal - Transformación Anime Musical', () => {
  4  | 
  5  |   test('la página carga correctamente con el layout base', async ({ page }) => {
  6  |     await page.goto('/')
  7  |     await expect(page).toHaveTitle(/ChordShift|Worship Piano/)
  8  |     await page.waitForLoadState('networkidle')
  9  |   })
  10 | 
  11 |   test('el tema anime-musical está activo con colores vibrantes', async ({ page }) => {
  12 |     await page.goto('/')
  13 |     const body = page.locator('body')
  14 |     const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor)
  15 |     expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  16 |   })
  17 | 
  18 |   test('los elementos del hero tienen animaciones de entrada', async ({ page }) => {
  19 |     await page.goto('/')
  20 |     await page.waitForTimeout(1000)
  21 | 
  22 |     const heading = page.locator('h1')
  23 |     await expect(heading).toBeVisible()
  24 | 
  25 |     const buttons = page.locator('button')
  26 |     const buttonCount = await buttons.count()
  27 |     expect(buttonCount).toBeGreaterThanOrEqual(1)
  28 |   })
  29 | 
  30 |   test('el enrutamiento a /login funciona', async ({ page }) => {
  31 |     await page.goto('/login')
  32 |     await expect(page).toHaveURL(/\/login/)
  33 |     await page.waitForLoadState('networkidle')
  34 |   })
  35 | 
  36 |   test('el enrutamiento a /register funciona', async ({ page }) => {
  37 |     await page.goto('/register')
  38 |     await expect(page).toHaveURL(/\/register/)
  39 |     await page.waitForLoadState('networkidle')
  40 |   })
  41 | 
  42 |   test('las páginas interiores (practice) cargan con layout de navegación', async ({ page }) => {
  43 |     await page.goto('/practice')
  44 |     await expect(page).toHaveURL(/\/practice/)
  45 |     await page.waitForLoadState('networkidle')
  46 |     const nav = page.locator('header nav, nav:has(a)')
  47 |     await expect(nav).toBeVisible()
  48 |   })
  49 | 
  50 |   test('la página de ear-training carga correctamente', async ({ page }) => {
  51 |     await page.goto('/ear-training')
> 52 |     await expect(page).toHaveURL(/\/ear-training/)
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  53 |     await page.waitForLoadState('networkidle')
  54 |   })
  55 | 
  56 |   test('la página de settings carga correctamente', async ({ page }) => {
  57 |     await page.goto('/settings')
  58 |     await expect(page).toHaveURL(/\/settings/)
  59 |     await page.waitForLoadState('networkidle')
  60 |   })
  61 | 
  62 |   test('las transiciones entre páginas se completan sin errores', async ({ page }) => {
  63 |     await page.goto('/')
  64 |     await page.waitForLoadState('networkidle')
  65 | 
  66 |     await page.goto('/practice')
  67 |     await page.waitForLoadState('networkidle')
  68 |     await expect(page).toHaveURL(/\/practice/)
  69 | 
  70 |     await page.goto('/ear-training')
  71 |     await page.waitForLoadState('networkidle')
  72 |     await expect(page).toHaveURL(/\/ear-training/)
  73 |   })
  74 | })
  75 | 
```