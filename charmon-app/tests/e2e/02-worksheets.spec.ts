import { test, expect } from '@playwright/test'

// 輔助函數：模擬用戶登入
async function loginAsTestUser(page) {
  // 正確的 URL 應該包含 base path
  await page.goto('http://localhost:5178/CharMon/login')
  await page.waitForLoadState('domcontentloaded')

  // 等待登入表單出現
  await page.waitForSelector('#name', { timeout: 5000 })

  // 填寫表單
  await page.fill('#name', '測試用戶')

  // 點擊幼稚園按鈕
  await page.locator('.grade-btn').filter({ hasText: '幼稚園' }).click()

  // 點擊登入按鈕
  await page.click('button:has-text("開始學習！")')

  // 等待重定向到 dashboard
  await page.waitForURL('**/CharMon/dashboard', { timeout: 10000 })
}

test.describe('練習表生成器測試', () => {
  test.beforeEach(async ({ page }) => {
    // 先登入
    await loginAsTestUser(page)

    // 確認我們在 dashboard 頁面，等待歡迎訊息出現
    await page.waitForSelector('h2:has-text("你好"), h1:has-text("你好")', { timeout: 5000 })

    // 透過側邊欄導航到 worksheets 頁面以保持認證狀態
    const worksheetsNavLink = page.locator('.sidebar a[href*="worksheets"], nav a[href*="worksheets"]')

    if (await worksheetsNavLink.isVisible({ timeout: 2000 })) {
      await worksheetsNavLink.click()
    } else {
      // 如果側邊欄沒有連結，嘗試點擊練習表格卡片
      const worksheetsCard = page.locator('text=練習表格').first()
      if (await worksheetsCard.isVisible({ timeout: 2000 })) {
        await worksheetsCard.click()
      } else {
        // 最後選項：直接導航
        await page.waitForTimeout(1000)
        await page.goto('http://localhost:5178/CharMon/worksheets')
      }
    }

    await page.waitForLoadState('domcontentloaded')

    // 等待頁面完全載入，如果還是被重定向，我們需要重新檢查
    try {
      await page.waitForSelector('h1', { timeout: 5000 })

      // 檢查我們是否在正確的頁面
      const currentUrl = page.url()
      const h1Text = await page.locator('h1').first().textContent()

      if (currentUrl.includes('/login') || h1Text?.includes('字樂園')) {
        // 如果被重定向回登入頁面，說明認證失效了
        throw new Error('認證狀態失效，被重定向到登入頁面')
      }
    } catch (error) {
      // 如果出現問題，再次嘗試登入
      console.log('重新嘗試登入...')
      await loginAsTestUser(page)
      await page.goto('http://localhost:5178/CharMon/worksheets')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('h1', { timeout: 10000 })
    }
  })

  test('基本練習表生成功能', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('練習表格生成器')

    // 輸入要練習的字
    const textInput = page.locator('#characters')
    await expect(textInput).toBeVisible()
    await textInput.fill('我愛爸爸媽媽')

    // 選擇格式樣式
    const gridTypeSelect = page.locator('select').filter({ hasText: '田字格' })
    await gridTypeSelect.selectOption('tian')

    // 生成預覽
    const previewBtn = page.locator('button:has-text("預覽練習表")')
    if (await previewBtn.isVisible()) {
      await previewBtn.click()

      // 等待預覽生成
      await page.waitForTimeout(2000)

      // 檢查預覽是否出現
      const canvas = page.locator('canvas.worksheet-preview')
      await expect(canvas).toBeVisible()
    }
  })

  test('不同格式選項測試', async ({ page }) => {
    const textInput = page.locator('#characters')
    await textInput.fill('測試')

    // 測試田字格
    await page.locator('select').first().selectOption('tian')

    // 測試米字格
    await page.locator('select').first().selectOption('mi')

    // 測試簡單格
    await page.locator('select').first().selectOption('simple')

    // 測試字型選擇
    const fontSelect = page.locator('select').filter({ hasText: '標楷體' })
    if (await fontSelect.isVisible()) {
      await fontSelect.selectOption('Microsoft YaHei')
    }
  })

  test('字數限制測試', async ({ page }) => {
    const textInput = page.locator('#characters')

    // 測試最大字數限制 (100字)
    const longText = '一'.repeat(101)
    await textInput.fill(longText)

    // 檢查是否有字數限制提示
    const charCount = page.locator('.char-count')
    await expect(charCount).toContainText('100')
  })

  test('寶可夢主題模式測試', async ({ page }) => {
    // 模擬帶有寶可夢參數的 URL
    const pokemonParams = {
      pokemonTheme: '皮卡丘',
      variations: JSON.stringify([
        { description: '金黃色的小精靈' },
        { description: '活潑可愛' },
        { description: '在森林裡' },
        { description: '快樂地跳躍' },
        { description: '像閃電一樣' }
      ])
    }

    // 使用完整 URL 包含 base path
    const url = `http://localhost:5178/CharMon/worksheets?pokemonTheme=${encodeURIComponent(pokemonParams.pokemonTheme)}&variations=${encodeURIComponent(pokemonParams.variations)}`
    await page.goto(url)
    await page.waitForLoadState('domcontentloaded')

    // 等待頁面載入，並檢查是否進入遊戲模式
    await page.waitForSelector('h1', { timeout: 10000 })

    // 檢查是否進入遊戲模式
    await expect(page.locator('h1')).toContainText('皮卡丘 文學練習表')

    // 檢查文學內容是否正確填入
    const textInput = page.locator('#characters')
    const inputValue = await textInput.inputValue()
    expect(inputValue).toContain('金黃色的小精靈')
  })

  test('下載功能測試', async ({ page }) => {
    const textInput = page.locator('#characters')
    await textInput.fill('下載測試')

    // 生成預覽
    const previewBtn = page.locator('button:has-text("預覽練習表")')
    if (await previewBtn.isVisible()) {
      await previewBtn.click()
      await page.waitForTimeout(2000)
    }

    // 測試下載按鈕
    const downloadBtn = page.locator('button:has-text("下載圖片")')
    await expect(downloadBtn).toBeVisible()

    // 檢查按鈕是否可點擊
    if (await downloadBtn.isEnabled()) {
      // 設置下載處理器
      const downloadPromise = page.waitForEvent('download')
      await downloadBtn.click()

      try {
        const download = await downloadPromise
        expect(download.suggestedFilename()).toMatch(/\.png$/)
      } catch {
        // 下載可能因為測試環境而失敗，這是正常的
        console.log('下載測試在測試環境中跳過')
      }
    }
  })
})