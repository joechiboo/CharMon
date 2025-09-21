import { test, expect } from '@playwright/test'

test.describe('應用導航測試', () => {
  test('首頁載入正常', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/字樂園|CharMon/)

    // 檢查首頁主要元素（未登入狀態）
    await expect(page.locator('.hero')).toBeVisible()
    await expect(page.locator('.rainbow-text')).toContainText('字樂園')
    await expect(page.locator('.start-btn')).toBeVisible()
  })

  test('主選單導航功能', async ({ page }) => {
    await page.goto('/')

    // 檢查主要頁面連結
    const dashboardLink = page.locator('a[href="/dashboard"]')
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click()
      await expect(page).toHaveURL(/.*dashboard/)
    }

    // 檢查練習表生成器
    await page.goto('/')
    const worksheetsLink = page.locator('a[href="/worksheets"]')
    if (await worksheetsLink.isVisible()) {
      await worksheetsLink.click()
      await expect(page).toHaveURL(/.*worksheets/)
    }
  })

  test('響應式設計測試', async ({ page }) => {
    // 桌面版本
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await expect(page.locator('.hero')).toBeVisible()

    // 平板版本
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await expect(page.locator('.hero')).toBeVisible()

    // 手機版本
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await expect(page.locator('.hero')).toBeVisible()
  })
})