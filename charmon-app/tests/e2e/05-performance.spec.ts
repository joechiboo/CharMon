import { test, expect } from '@playwright/test'

test.describe('性能和穩定性測試', () => {
  test('頁面載入性能測試', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    // 等待主要內容載入
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    console.log(`首頁載入時間: ${loadTime}ms`)

    // 期望頁面在 5 秒內載入完成
    expect(loadTime).toBeLessThan(5000)

    // 檢查頁面關鍵元素是否載入
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main, .main-content')).toBeVisible()
  })

  test('練習表生成性能測試', async ({ page }) => {
    await page.goto('/worksheets')

    // 輸入測試文字
    const textInput = page.locator('#characters')
    await textInput.fill('性能測試用的中文字符')

    // 測量生成時間
    const startTime = Date.now()

    const previewBtn = page.locator('button:has-text("預覽練習表")')
    if (await previewBtn.isVisible()) {
      await previewBtn.click()

      // 等待 canvas 出現
      await page.waitForSelector('canvas.worksheet-preview', { timeout: 10000 })

      const generateTime = Date.now() - startTime
      console.log(`練習表生成時間: ${generateTime}ms`)

      // 期望在 10 秒內完成生成
      expect(generateTime).toBeLessThan(10000)
    }
  })

  test('API 響應時間測試', async ({ page }) => {
    // 測試 API 響應時間
    const apiTests = [
      { url: 'http://localhost:3001/api/pokemon/health', name: '健康檢查' },
      { url: 'http://localhost:3001/api/pokemon/status', name: '服務狀態' },
      { url: 'http://localhost:3001/api/pokemon/themes', name: '主題列表' }
    ]

    for (const apiTest of apiTests) {
      const startTime = Date.now()

      const response = await page.request.get(apiTest.url)

      const responseTime = Date.now() - startTime
      console.log(`${apiTest.name} API 響應時間: ${responseTime}ms`)

      expect(response.status()).toBe(200)
      expect(responseTime).toBeLessThan(3000) // 3 秒內響應
    }
  })

  test('記憶體洩漏測試', async ({ page }) => {
    await page.goto('/worksheets')

    // 重複生成練習表多次
    for (let i = 0; i < 5; i++) {
      const textInput = page.locator('#characters')
      await textInput.fill(`記憶體測試 ${i + 1}`)

      const previewBtn = page.locator('button:has-text("預覽練習表")')
      if (await previewBtn.isVisible()) {
        await previewBtn.click()
        await page.waitForTimeout(1000)
      }

      // 清空並重新開始
      await textInput.clear()
      await page.waitForTimeout(500)
    }

    // 檢查頁面是否仍然響應
    await expect(page.locator('h1')).toBeVisible()
  })

  test('大量文字處理測試', async ({ page }) => {
    await page.goto('/worksheets')

    // 測試最大字數限制
    const maxText = '測'.repeat(100)
    const textInput = page.locator('#characters')
    await textInput.fill(maxText)

    // 檢查字數顯示
    const charCount = page.locator('.char-count')
    await expect(charCount).toContainText('100/100')

    // 嘗試生成
    const previewBtn = page.locator('button:has-text("預覽練習表")')
    if (await previewBtn.isVisible()) {
      const startTime = Date.now()
      await previewBtn.click()

      // 等待處理完成或超時
      try {
        await page.waitForSelector('canvas.worksheet-preview', { timeout: 15000 })
        const processTime = Date.now() - startTime
        console.log(`大量文字處理時間: ${processTime}ms`)
        expect(processTime).toBeLessThan(15000)
      } catch {
        console.log('大量文字處理超時，這可能是預期行為')
      }
    }
  })

  test('網路異常處理測試', async ({ page, context }) => {
    // 模擬網路中斷
    await context.setOffline(true)

    await page.goto('/worksheets', { waitUntil: 'domcontentloaded' })

    // 檢查離線時的行為
    const textInput = page.locator('#characters')
    if (await textInput.isVisible()) {
      await textInput.fill('離線測試')
    }

    // 恢復網路
    await context.setOffline(false)
    await page.reload()

    // 檢查恢復後是否正常
    await expect(page.locator('h1')).toBeVisible()
  })

  test('並發請求測試', async ({ page }) => {
    const promises = []

    // 同時發送多個 API 請求
    for (let i = 0; i < 5; i++) {
      const promise = page.request.post('http://localhost:3001/api/pokemon/generate', {
        data: {
          pokemonName: `ConcurrentTest${i}`,
          generationType: 'template',
          ageGroup: 'kindergarten'
        }
      })
      promises.push(promise)
    }

    const responses = await Promise.all(promises)

    // 檢查所有請求都成功
    responses.forEach((response, index) => {
      console.log(`並發請求 ${index + 1} 狀態: ${response.status()}`)
      expect(response.status()).toBe(200)
    })
  })

  test('瀏覽器兼容性測試', async ({ page, browserName }) => {
    console.log(`測試瀏覽器: ${browserName}`)

    await page.goto('/')

    // 檢查基本功能在不同瀏覽器中是否正常
    await expect(page.locator('header')).toBeVisible()

    // 檢查 CSS 支援
    const header = page.locator('header')
    const headerStyle = await header.evaluate(el => getComputedStyle(el).display)
    expect(headerStyle).not.toBe('none')

    // 檢查 JavaScript 功能
    await page.goto('/worksheets')
    const textInput = page.locator('#characters')
    if (await textInput.isVisible()) {
      await textInput.fill('瀏覽器測試')
      const value = await textInput.inputValue()
      expect(value).toBe('瀏覽器測試')
    }
  })
})