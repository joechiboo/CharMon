import { test, expect } from '@playwright/test'

test.describe('寶可夢 API 後端測試', () => {
  const API_BASE = 'http://localhost:3001/api/pokemon'

  test('API 健康檢查', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data.service).toContain('Pokemon Theme Generator')
  })

  test('API 服務狀態檢查', async ({ request }) => {
    const response = await request.get(`${API_BASE}/status`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('ollama')
    expect(data).toHaveProperty('template')
    expect(data.template.available).toBe(true)
  })

  test('寶可夢主題生成 - 模板模式', async ({ request }) => {
    const response = await request.post(`${API_BASE}/generate`, {
      data: {
        pokemonName: 'Pikachu',
        generationType: 'template',
        ageGroup: 'kindergarten'
      }
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('pokemonName', 'Pikachu')
    expect(data.data).toHaveProperty('elements')
    expect(data.data.elements).toHaveLength(5)
    expect(data.data).toHaveProperty('totalCharacterCount')
    expect(data.data.totalCharacterCount).toBeLessThanOrEqual(108)
    expect(data.data).toHaveProperty('variations')
    expect(data.data.variations).toHaveLength(5)

    // 檢查文學元素類型
    const elementTypes = data.data.elements.map((el: { type: string }) => el.type)
    expect(elementTypes).toContain('顏色')
    expect(elementTypes).toContain('形容')
    expect(elementTypes).toContain('地點')
    expect(elementTypes).toContain('動態')
    expect(elementTypes).toContain('修辭')
  })

  test('寶可夢主題生成 - 混合模式', async ({ request }) => {
    const response = await request.post(`${API_BASE}/generate`, {
      data: {
        pokemonName: '小火龍',
        generationType: 'hybrid',
        ageGroup: 'elementary-low'
      }
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.ageGroup).toBe('elementary-low')

    // 檢查字數限制符合小學低年級標準
    data.data.elements.forEach((element: { characterCount: number }, index: number) => {
      const limits = [16, 22, 22, 22, 16] // elementary-low 的限制
      expect(element.characterCount).toBeLessThanOrEqual(limits[index])
    })
  })

  test('無效寶可夢名稱處理', async ({ request }) => {
    const response = await request.post(`${API_BASE}/generate`, {
      data: {
        pokemonName: '',
        generationType: 'template'
      }
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('寶可夢名稱不能為空')
  })

  test('寶可夢名稱驗證', async ({ request }) => {
    // 有效名稱
    let response = await request.post(`${API_BASE}/validate-name`, {
      data: { pokemonName: 'Pikachu' }
    })
    expect(response.status()).toBe(200)
    let data = await response.json()
    expect(data.valid).toBe(true)

    // 無效名稱 (空字串)
    response = await request.post(`${API_BASE}/validate-name`, {
      data: { pokemonName: '' }
    })
    expect(response.status()).toBe(200)
    data = await response.json()
    expect(data.valid).toBe(false)

    // 包含中文的名稱
    response = await request.post(`${API_BASE}/validate-name`, {
      data: { pokemonName: '皮卡丘' }
    })
    expect(response.status()).toBe(200)
    data = await response.json()
    expect(data.valid).toBe(true)
  })

  test('主題列表獲取', async ({ request }) => {
    // 先生成一個主題
    await request.post(`${API_BASE}/generate`, {
      data: {
        pokemonName: 'TestPokemon',
        generationType: 'template',
        ageGroup: 'kindergarten'
      }
    })

    // 獲取主題列表
    const response = await request.get(`${API_BASE}/themes`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('themes')
    expect(data).toHaveProperty('total')
    expect(Array.isArray(data.themes)).toBe(true)
  })

  test('主題搜索功能', async ({ request }) => {
    const response = await request.get(`${API_BASE}/search?q=Pikachu`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('themes')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('query', 'Pikachu')
  })

  test('API 統計信息', async ({ request }) => {
    const response = await request.get(`${API_BASE}/stats`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('totalThemes')
    expect(data).toHaveProperty('byGenerationType')
    expect(data).toHaveProperty('byAgeGroup')
    expect(data).toHaveProperty('averageCharacterCount')
  })

  test('錯誤處理測試', async ({ request }) => {
    // 無效的 endpoint
    const response = await request.get(`${API_BASE}/invalid-endpoint`)
    expect(response.status()).toBe(404)

    const data = await response.json()
    expect(data.error).toContain('API 端點不存在')
  })
})