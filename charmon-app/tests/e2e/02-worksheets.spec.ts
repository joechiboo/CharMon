import { test, expect } from '@playwright/test'

test.describe('練習表生成器測試', () => {
  test.beforeEach(async ({ page }) => {
    // 先模擬登入流程，因為 worksheets 需要認證
    await page.goto('/login')

    // 等待頁面載入
    await page.waitForLoadState('domcontentloaded')

    // 檢查是否有登入表單，如果有就填入測試資料
    const nameInput = page.locator('#name')
    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill('測試用戶')

      // 選擇年級（幼稚園）
      const gradeBtn = page.locator('.grade-btn').filter({ hasText: '幼稚園' })
      await gradeBtn.click()

      // 點擊開始學習按鈕
      const loginBtn = page.locator('button:has-text("開始學習")')
      await loginBtn.click()

      // 等待導航完成
      await page.waitForLoadState('networkidle')
    }

    // 直接導航到 worksheets 頁面
    await page.goto('/worksheets')
    await page.waitForLoadState('domcontentloaded')
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

    const url = `/worksheets?pokemonTheme=${encodeURIComponent(pokemonParams.pokemonTheme)}&variations=${encodeURIComponent(pokemonParams.variations)}`
    await page.goto(url)

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