// 萌典 API 服務 - 取得完整中文字典資料
// 資料來源：g0v 萌典專案，基於教育部重編國語辭典修訂本

export interface MoedictResult {
  title: string  // 字符
  heteronyms: MoedictHeteronym[]  // 多音字資料
  radical?: string  // 部首
  stroke_count?: number  // 總筆劃數
  non_radical_stroke_count?: number  // 非部首筆劃數
}

export interface MoedictHeteronym {
  bopomofo?: string  // 注音符號 (如: ㄨㄤˊ)
  bopomofo2?: string  // 羅馬拼音 (如: wáng)
  pinyin?: string  // 漢語拼音
  definitions?: MoedictDefinition[]  // 字義定義
}

export interface MoedictDefinition {
  type?: string  // 詞性 (如: 名詞、動詞)
  def: string  // 定義內容
  quote?: string[]  // 引用出處
  example?: string[]  // 例句
}

export class MoedictService {
  private static readonly BASE_URL = 'https://www.moedict.tw'

  /**
   * 查詢單一字符的完整資料
   */
  static async getCharacterInfo(character: string): Promise<MoedictResult | null> {
    try {
      console.log('🔍 查詢萌典:', character)

      const response = await fetch(`${this.BASE_URL}/a/${encodeURIComponent(character)}.json`)

      if (!response.ok) {
        console.log('❌ 萌典查詢失敗:', response.status, response.statusText)
        console.log('🔍 嘗試的 URL:', `${this.BASE_URL}/a/${encodeURIComponent(character)}.json`)
        return null
      }

      const data = await response.json()
      console.log('✅ 萌典查詢成功:', data)

      return this.mapMoedictData(data)
    } catch (error) {
      console.error('💥 萌典查詢錯誤:', error)
      return null
    }
  }

  /**
   * 取得字符的筆劃數
   */
  static async getStrokeCount(character: string): Promise<number | null> {
    const result = await this.getCharacterInfo(character)
    return result?.stroke_count || null
  }

  /**
   * 取得字符的部首
   */
  static async getRadical(character: string): Promise<string | null> {
    const result = await this.getCharacterInfo(character)
    return result?.radical || null
  }

  /**
   * 取得字符的注音（第一個讀音）
   */
  static async getZhuyin(character: string): Promise<string | null> {
    const result = await this.getCharacterInfo(character)
    // 萌典 API 中注音可能在 b 欄位或 bopomofo 欄位
    return result?.heteronyms?.[0]?.b || result?.heteronyms?.[0]?.bopomofo || null
  }

  /**
   * 取得字符的所有讀音
   */
  static async getAllZhuyin(character: string): Promise<string[]> {
    const result = await this.getCharacterInfo(character)
    if (!result?.heteronyms) return []

    return result.heteronyms
      .map(h => h.b || h.bopomofo)
      .filter(Boolean) as string[]
  }

  /**
   * 轉換萌典 API 資料格式
   */
  private static mapMoedictData(data: any): MoedictResult | null {
    if (!data) {
      console.log('❌ 萌典資料為空')
      return null
    }

    console.log('🔍 萌典原始資料:', data)

    // 檢查資料是否有必要欄位
    if (!data.title && !data.c && !data.h) {
      console.log('❌ 萌典資料格式不正確，缺少必要欄位')
      return null
    }

    // 清理部首格式，移除 ` 字首符和 ~ 字尾符
    let cleanRadical = data.r || '？'
    if (typeof cleanRadical === 'string') {
      // 移除開頭的 ` 符號
      if (cleanRadical.startsWith('`')) {
        cleanRadical = cleanRadical.substring(1)
      }
      // 移除結尾的 ~ 符號
      if (cleanRadical.endsWith('~')) {
        cleanRadical = cleanRadical.substring(0, cleanRadical.length - 1)
      }
    }

    // 萌典 API 實際返回的格式：
    // c: 筆劃數, r: 部首, h: 異體字陣列 (heteronyms)
    const result = {
      title: data.title || data.h?.[0]?.title || '？',
      heteronyms: data.h || [],  // h 代表 heteronyms
      radical: cleanRadical,     // r 代表 radical (已清理)
      stroke_count: data.c,      // c 代表筆劃數 (count)
      non_radical_stroke_count: data.c ? data.c - 1 : undefined // 估算非部首筆劃
    }

    console.log('✅ 轉換後資料 (已清理部首):', result)
    return result
  }

  /**
   * 批量查詢多個字符
   */
  static async batchGetCharacters(characters: string[]): Promise<Map<string, MoedictResult>> {
    const results = new Map<string, MoedictResult>()

    // 為了避免過多請求，加入延遲
    for (const char of characters) {
      const result = await this.getCharacterInfo(char)
      if (result) {
        results.set(char, result)
      }

      // 每次請求間隔 100ms，避免過於頻繁
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return results
  }
}