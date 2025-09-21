import { OllamaService } from './ollamaService'
import { TemplateService } from './templateService'
import { ThemeFileService } from './themeFileService'
import {
  PokemonGenerationRequest,
  PokemonThemeGeneration,
  GenerationType,
  AgeGroup,
  ElementType,
  LiteraryElement,
  LITERARY_ELEMENTS,
  CHARACTER_LIMITS
} from '../types/pokemon'

export class PokemonService {
  private ollamaService: OllamaService
  private templateService: TemplateService
  private themeFileService: ThemeFileService

  constructor() {
    this.ollamaService = new OllamaService()
    this.templateService = new TemplateService()
    this.themeFileService = new ThemeFileService()
  }

  // 生成寶可夢主題
  async generatePokemonTheme(request: PokemonGenerationRequest): Promise<PokemonThemeGeneration> {
    const ageGroup = request.ageGroup || AgeGroup.KINDERGARTEN
    const generationType = request.generationType || GenerationType.HYBRID

    console.log(`🎮 開始生成寶可夢主題: ${request.pokemonName} (${ageGroup})`)

    let elements: string[]
    let actualGenerationType: GenerationType

    try {
      // 根據生成類型選擇策略
      switch (generationType) {
        case GenerationType.AI:
          elements = await this.generateWithAI(request.pokemonName, ageGroup)
          actualGenerationType = GenerationType.AI
          break

        case GenerationType.TEMPLATE:
          elements = await this.generateWithTemplate(request.pokemonName, ageGroup)
          actualGenerationType = GenerationType.TEMPLATE
          break

        case GenerationType.HYBRID:
        default:
          // 混合策略：優先嘗試AI，失敗則使用模板
          try {
            elements = await this.generateWithAI(request.pokemonName, ageGroup)
            actualGenerationType = GenerationType.AI
            console.log('✅ 使用 AI 生成成功')
          } catch (error) {
            console.log('⚠️ AI 生成失敗，使用模板生成:', error)
            elements = await this.generateWithTemplate(request.pokemonName, ageGroup)
            actualGenerationType = GenerationType.TEMPLATE
          }
          break
      }

      // 構建文學元素對象
      const literaryElements = this.buildLiteraryElements(elements, ageGroup)

      // 創建主題生成結果
      const themeGeneration: PokemonThemeGeneration = {
        pokemonName: request.pokemonName,
        elements: literaryElements,
        totalCharacterCount: literaryElements.reduce((sum, el) => sum + el.characterCount, 0),
        ageGroup,
        generatedAt: new Date(),
        generationType: actualGenerationType,
        variations: literaryElements.map(el => ({ description: el.content }))
      }

      // 保存到文件
      await this.themeFileService.saveTheme(themeGeneration)

      console.log(`🎉 寶可夢主題生成完成: ${request.pokemonName}`)
      return themeGeneration

    } catch (error) {
      console.error('💥 寶可夢主題生成失敗:', error)
      throw new Error(`生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  // 使用AI生成
  private async generateWithAI(pokemonName: string, ageGroup: AgeGroup): Promise<string[]> {
    const isAvailable = await this.ollamaService.isAvailable()
    if (!isAvailable) {
      throw new Error('Ollama 服務不可用')
    }

    const elements = await this.ollamaService.generatePokemonElements(pokemonName, ageGroup)

    // 驗證生成品質
    if (!this.ollamaService.validateGeneration(elements, ageGroup)) {
      throw new Error('AI 生成品質不符合要求')
    }

    return elements
  }

  // 使用模板生成
  private async generateWithTemplate(pokemonName: string, ageGroup: AgeGroup): Promise<string[]> {
    return this.templateService.generatePokemonElements(pokemonName, ageGroup)
  }

  // 構建文學元素對象
  private buildLiteraryElements(elements: string[], ageGroup: AgeGroup): LiteraryElement[] {
    const limits = CHARACTER_LIMITS[ageGroup]
    const limitValues = [limits.color, limits.description, limits.location, limits.action, limits.rhetoric]

    return LITERARY_ELEMENTS.map((type, index) => {
      const content = elements[index] || '需要補充描述'
      const characterCount = content.length
      const expectedLimit = limitValues[index]

      return {
        type,
        content,
        characterCount,
        ageAppropriate: characterCount <= expectedLimit
      }
    })
  }

  // 獲取所有主題
  async getAllThemes(): Promise<PokemonThemeGeneration[]> {
    return await this.themeFileService.getAllThemes()
  }

  // 根據ID獲取主題
  async getThemeById(id: string): Promise<PokemonThemeGeneration | null> {
    return await this.themeFileService.getThemeById(id)
  }

  // 刪除主題
  async deleteTheme(id: string): Promise<boolean> {
    return await this.themeFileService.deleteTheme(id)
  }

  // 檢查服務狀態
  async getServiceStatus() {
    const ollamaAvailable = await this.ollamaService.isAvailable()

    return {
      ollama: {
        available: ollamaAvailable,
        url: 'http://localhost:11434'
      },
      template: {
        available: true,
        description: '模板生成器始終可用'
      }
    }
  }

  // 驗證寶可夢名稱
  validatePokemonName(pokemonName: string): boolean {
    if (!pokemonName || pokemonName.trim().length === 0) {
      return false
    }

    // 檢查是否包含適當的字符（中文、英文、數字）
    const validPattern = /^[\u4e00-\u9fff\w\s]{1,20}$/
    return validPattern.test(pokemonName.trim())
  }

  // 生成統計信息
  async getGenerationStats() {
    const themes = await this.getAllThemes()

    return {
      totalThemes: themes.length,
      byGenerationType: {
        ai: themes.filter(t => t.generationType === GenerationType.AI).length,
        template: themes.filter(t => t.generationType === GenerationType.TEMPLATE).length,
        hybrid: themes.filter(t => t.generationType === GenerationType.HYBRID).length
      },
      byAgeGroup: {
        kindergarten: themes.filter(t => t.ageGroup === AgeGroup.KINDERGARTEN).length,
        elementaryLow: themes.filter(t => t.ageGroup === AgeGroup.ELEMENTARY_LOW).length,
        elementaryHigh: themes.filter(t => t.ageGroup === AgeGroup.ELEMENTARY_HIGH).length
      },
      averageCharacterCount: themes.reduce((sum, t) => sum + t.totalCharacterCount, 0) / (themes.length || 1)
    }
  }
}