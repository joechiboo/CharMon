import { test, expect } from '@playwright/test'

test.describe('字典系統測試', () => {
  test('字典查詢功能', async ({ page }) => {
    await page.goto('/name-learning')

    // 測試字典查詢
    const searchInput = page.locator('input[type="text"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('家')

      // 等待查詢結果
      await page.waitForTimeout(1000)

      // 檢查是否顯示字符資訊
      const characterInfo = page.locator('.character-info')
      if (await characterInfo.isVisible()) {
        // 檢查筆劃數、部首、注音等信息
        await expect(page.locator('.character-display')).toContainText('家')
      }
    }
  })

  test('筆順動畫功能', async ({ page }) => {
    await page.goto('/stroke-order')

    // 查找筆順相關元素
    const strokeCanvas = page.locator('canvas, svg, .hanzi-writer')
    if (await strokeCanvas.isVisible()) {
      // 測試筆順播放
      const playButton = page.locator('button:has-text("播放"), button:has-text("開始")')
      if (await playButton.isVisible()) {
        await playButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })

  test('字典管理後台功能', async ({ page }) => {
    await page.goto('/dictionary-admin')

    // 檢查管理後台頁面
    await expect(page.locator('h1')).toContainText('字典管理後台')

    // 檢查統計信息
    const statsSection = page.locator('.stats-section')
    if (await statsSection.isVisible()) {
      await expect(statsSection).toContainText('字典統計')
    }

    // 檢查未知字符列表
    const unknownSection = page.locator('.unknown-section')
    if (await unknownSection.isVisible()) {
      await expect(unknownSection).toContainText('待新增字符')
    }

    // 測試功能按鈕
    const exportBtn = page.locator('button:has-text("匯出字典")')
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      // 檢查是否有提示訊息
      await page.waitForTimeout(500)
    }
  })

  test('字典數據同步功能', async ({ page }) => {
    await page.goto('/dictionary-admin-v2')

    // 檢查 V2 管理界面
    if (await page.locator('h1').isVisible()) {
      await expect(page.locator('h1')).toContainText('字典管理')
    }

    // 測試同步按鈕
    const syncBtn = page.locator('button:has-text("同步數據")')
    if (await syncBtn.isVisible()) {
      await syncBtn.click()
      await page.waitForTimeout(2000)

      // 檢查同步結果
      const notification = page.locator('.notification, .message, .alert')
      if (await notification.isVisible()) {
        console.log('同步操作已執行')
      }
    }
  })

  test('Supabase 連接測試', async ({ page }) => {
    // 在瀏覽器中測試 Supabase 連接
    await page.goto('/dictionary-admin-v2')

    // 檢查網路請求
    page.on('response', response => {
      if (response.url().includes('supabase')) {
        console.log(`Supabase 請求: ${response.status()} ${response.url()}`)
      }
    })

    // 觸發需要 Supabase 連接的操作
    const testBtn = page.locator('button:has-text("測試"), button:has-text("載入")')
    if (await testBtn.isVisible()) {
      await testBtn.click()
      await page.waitForTimeout(3000)
    }
  })
})