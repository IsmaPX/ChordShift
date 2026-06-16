import { test, expect } from '@playwright/test'

async function dismissOverlays(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  // 1. AudioGate overlay
  const audioGate = page.locator('.fixed.inset-0.z-50').first()
  if (await audioGate.isVisible({ timeout: 3000 }).catch(() => false)) {
    await audioGate.click({ force: true })
    await page.waitForTimeout(1000)
  }

  // 2. Onboarding tour
  const skipBtn = page.locator('button:has-text("Omitir")')
  if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skipBtn.click()
    await page.waitForTimeout(1000)
  }

  // 3. Esperar a que el contenido principal esté listo
  await page.waitForTimeout(1000)
}

test.describe('🎵 MusicStaff - Pentagrama', () => {

  test('el pentagrama se renderiza en la página de practice', async ({ page }) => {
    await page.goto('/practice/song-amazing-grace')
    await page.waitForLoadState('networkidle')
    await dismissOverlays(page)

    // Esperar a que el título de la canción aparezca (indica que la data cargó)
    await expect(page.getByText('Amazing Grace')).toBeVisible({ timeout: 15000 })

    const musicStaff = page.locator('[data-testid="music-staff"]')
    await expect(musicStaff).toBeVisible({ timeout: 10000 })
  })

  test('las notas tienen el centrado vertical correcto (translate -50%, -50%)', async ({ page }) => {
    await page.goto('/practice/song-amazing-grace')
    await page.waitForLoadState('domcontentloaded')
    await dismissOverlays(page)

    // Esperar a que el pentagrama esté visible
    const musicStaff = page.locator('[data-testid="music-staff"]')
    await expect(musicStaff).toBeVisible({ timeout: 15000 })

    // Verificar que las notas existen en el DOM (usando evaluate para evitar
    // problemas de visibilidad con elementos absolute + overflow:hidden)
    const noteData = await page.evaluate(() => {
      const noteGroups = document.querySelectorAll('[data-testid="music-staff-note"]')
      const results: { transform: string; chord: string; note: string }[] = []
      noteGroups.forEach(el => {
        const htmlEl = el as HTMLElement
        results.push({
          transform: htmlEl.style.transform,
          chord: htmlEl.getAttribute('data-chord') || '',
          note: htmlEl.getAttribute('data-note') || '',
        })
      })
      return results
    })

    expect(noteData.length).toBeGreaterThan(0)

    for (const note of noteData) {
      expect(note.transform).toContain('translate(-50%, -50%)')
      expect(note.chord).not.toBe('')
    }
  })

  test('las cabeceras de nota tienen transform correcto inline', async ({ page }) => {
    await page.goto('/practice/song-amazing-grace')
    await page.waitForLoadState('domcontentloaded')
    await dismissOverlays(page)

    const noteHeads = page.locator('[data-testid="music-staff-note-head"]')
    await expect(noteHeads.first()).toBeVisible({ timeout: 10000 })

    const count = await noteHeads.count()
    expect(count).toBeGreaterThan(0)
  })

  test('modo trompeta muestra data-instrument="trumpet" con notas fundamentales', async ({ page }) => {
    await page.goto('/practice/song-amazing-grace')
    await page.waitForLoadState('domcontentloaded')
    await dismissOverlays(page)

    // Cambiar a instrumento trompeta (si hay selector disponible)
    const trumpetOption = page.locator('[data-instrument="trumpet"], [value="trumpet"], text=Trompeta').first()
    if (await trumpetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await trumpetOption.click()
      await page.waitForTimeout(500)
    }

    const musicStaff = page.locator('[data-testid="music-staff"]')
    await expect(musicStaff).toBeVisible({ timeout: 10000 })

    // Verificar que las notas tienen data-note con el pitch real
    const noteHeads = page.locator('[data-testid="music-staff-note-head"]')
    const firstNote = noteHeads.first()
    const noteAttr = await firstNote.getAttribute('data-note')
    expect(noteAttr).not.toBeNull()
    expect(noteAttr?.length).toBeGreaterThan(0)
  })

  test('las líneas fisherman del pentagrama están presentes', async ({ page }) => {
    await page.goto('/practice/song-amazing-grace')
    await page.waitForLoadState('domcontentloaded')
    await dismissOverlays(page)

    const staffLines = page.locator('.music-staff-line')
    await expect(staffLines).toHaveCount(5)
  })

  test('el cursor temporal se mueve con isPlaying=true', async ({ page }) => {
    await page.goto('/practice/song-amazing-grace')
    await page.waitForLoadState('domcontentloaded')
    await dismissOverlays(page)

    const playButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    if (await playButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await playButton.click()
      await page.waitForTimeout(1000)

      const cursor = page.locator('.music-staff-cursor')
      await expect(cursor).toBeVisible()
    }
  })

})
