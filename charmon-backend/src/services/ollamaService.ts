import axios from 'axios'
import { OllamaConfig, PromptTemplate, AgeGroup, CHARACTER_LIMITS } from '../types/pokemon'

export class OllamaService {
  private config: OllamaConfig

  constructor(config?: Partial<OllamaConfig>) {
    this.config = {
      baseUrl: 'http://localhost:11434',
      model: 'qwen2.5:3b',
      maxTokens: 200,
      temperature: 0.7,
      timeout: 30000,
      ...config
    }
  }

  // 檢查 Ollama 是否可用
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/tags`, {
        timeout: 5000
      })
      return response.status === 200
    } catch (error) {
      console.log('Ollama 不可用:', error instanceof Error ? error.message : error)
      return false
    }
  }

  // 生成寶可夢文學元素
  async generatePokemonElements(pokemonName: string, ageGroup: AgeGroup): Promise<string[]> {
    const prompt = this.buildPrompt(pokemonName, ageGroup)

    try {
      const response = await axios.post(`${this.config.baseUrl}/api/generate`, {
        model: this.config.model,
        prompt: prompt.user,
        system: prompt.system,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens
        }
      }, {
        timeout: this.config.timeout
      })

      const generatedText = response.data.response
      return this.parseGeneratedElements(generatedText)
    } catch (error) {
      console.error('Ollama 生成失敗:', error)
      throw new Error('AI 生成失敗')
    }
  }

  // 建構提示詞
  private buildPrompt(pokemonName: string, ageGroup: AgeGroup): PromptTemplate {
    const limits = CHARACTER_LIMITS[ageGroup]
    const ageDescription = this.getAgeDescription(ageGroup)

    return {
      system: `你是一個專業的中文教育內容創作者，專門為${ageDescription}創作適合的文學練習內容。
你需要根據給定的寶可夢名稱，創作5個文學元素的描述，每個元素都要符合年齡適宜性和字數限制。
請使用生動、有趣但適合兒童的語言，避免複雜的詞彙或概念。`,

      user: `請為寶可夢「${pokemonName}」創作以下5個文學元素的描述：
1. 顏色描述 (${limits.color}字內)
2. 形容描述 (${limits.description}字內)
3. 地點描述 (${limits.location}字內)
4. 動作描述 (${limits.action}字內)
5. 修辭描述 (${limits.rhetoric}字內)

要求：
- 每個描述都要生動有趣，適合${ageDescription}
- 嚴格控制字數，不可超過限制
- 使用簡單易懂的詞彙
- 內容要積極正面
- 每行一個元素，格式：「元素類型：描述內容」

範例格式：
顏色：金黃色的小精靈
形容：活潑可愛又聰明
地點：在綠色森林裡
動作：快樂地蹦蹦跳跳
修辭：像陽光般溫暖`,

      examples: [
        {
          pokemon: '皮卡丘',
          elements: [
            '顏色：金黃色的電氣寶可夢',
            '形容：活潑可愛充滿電力',
            '地點：在青翠的森林中',
            '動作：歡快地蹦蹦跳跳',
            '修辭：像閃電一樣迅速'
          ]
        }
      ],

      constraints: [
        `總字數不超過108字`,
        `適合${ageDescription}的語言水平`,
        '積極正面的內容',
        '避免暴力或恐怖元素'
      ]
    }
  }

  // 解析生成的文本
  private parseGeneratedElements(text: string): string[] {
    const lines = text.split('\n').filter(line => line.trim())
    const elements: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.includes('：') || trimmed.includes(':')) {
        // 提取描述部分
        const parts = trimmed.split(/：|:/)
        if (parts.length >= 2) {
          elements.push(parts[1].trim())
        }
      }
    }

    // 確保有5個元素
    while (elements.length < 5) {
      elements.push('需要補充描述')
    }

    return elements.slice(0, 5)
  }

  // 獲取年齡描述
  private getAgeDescription(ageGroup: AgeGroup): string {
    switch (ageGroup) {
      case AgeGroup.KINDERGARTEN:
        return '幼稚園兒童(3-6歲)'
      case AgeGroup.ELEMENTARY_LOW:
        return '小學低年級學生(6-9歲)'
      case AgeGroup.ELEMENTARY_HIGH:
        return '小學高年級學生(9-12歲)'
      default:
        return '兒童'
    }
  }

  // 驗證生成品質
  validateGeneration(elements: string[], ageGroup: AgeGroup): boolean {
    const limits = CHARACTER_LIMITS[ageGroup]
    const expectedLimits = [limits.color, limits.description, limits.location, limits.action, limits.rhetoric]

    for (let i = 0; i < elements.length; i++) {
      if (elements[i].length > expectedLimits[i]) {
        console.warn(`元素 ${i + 1} 超過字數限制: ${elements[i].length} > ${expectedLimits[i]}`)
        return false
      }
    }

    const totalChars = elements.reduce((sum, element) => sum + element.length, 0)
    if (totalChars > 108) {
      console.warn(`總字數超過限制: ${totalChars} > 108`)
      return false
    }

    return true
  }
}