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
  ThemeVariation,
  LITERARY_ELEMENTS,
  CHARACTER_LIMITS
} from '../types/pokemon'
import * as fs from 'fs'
import * as path from 'path'

export class PokemonService {
  private ollamaService: OllamaService
  private templateService: TemplateService
  private themeFileService: ThemeFileService
  private pokemonNameMap: { [key: string]: string } = {}
  private reverseNameMap: { [key: string]: string } = {}
  private pokemonConfig: { [key: string]: { id: number, emoji: string, theme: string } } = {}

  constructor() {
    this.ollamaService = new OllamaService()
    this.templateService = new TemplateService()
    this.themeFileService = new ThemeFileService()
    this.loadPokemonNameMap()
    this.loadPokemonConfig()
  }

  // 載入中英文對照表
  private loadPokemonNameMap() {
    try {
      const mapPath = path.join(__dirname, '../data/pokemon-names.json')
      if (fs.existsSync(mapPath)) {
        const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf-8'))
        this.pokemonNameMap = mapData.pokemonNameMap || {}
        this.reverseNameMap = mapData.reverseMap || {}
        console.log(`✅ 載入了 ${Object.keys(this.pokemonNameMap).length} 個寶可夢中英文對照`)
      }
    } catch (error) {
      console.warn('⚠️ 無法載入寶可夢名稱對照表:', error)
    }
  }

  // 載入寶可夢配置 (ID, emoji, theme)
  private loadPokemonConfig() {
    try {
      const configPath = path.join(__dirname, '../data/pokemon-config.json')
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        this.pokemonConfig = configData.pokemonConfig || {}
        console.log(`✅ 載入了 ${Object.keys(this.pokemonConfig).length} 個寶可夢配置`)
      }
    } catch (error) {
      console.warn('⚠️ 無法載入寶可夢配置:', error)
    }
  }

  // 中文轉英文
  private chineseToEnglish(chineseName: string): string {
    return this.pokemonNameMap[chineseName] || chineseName
  }

  // 英文轉中文
  private englishToChinese(englishName: string): string {
    return this.reverseNameMap[englishName] || englishName
  }

  // 生成寶可夢主題
  async generatePokemonTheme(request: PokemonGenerationRequest): Promise<PokemonThemeGeneration> {
    const ageGroup = request.ageGroup || AgeGroup.KINDERGARTEN
    const generationType = request.generationType || GenerationType.HYBRID

    // 處理中英文名稱轉換
    const originalName = request.pokemonName
    const englishName = this.chineseToEnglish(originalName)
    const chineseName = this.englishToChinese(originalName)

    console.log(`🎮 開始生成寶可夢主題: ${originalName}`)
    console.log(`📝 中文名稱: ${chineseName}, 英文名稱: ${englishName}`)

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

      // 獲取寶可夢配置
      const pokemonConfig = this.getPokemonConfig(request.pokemonName)

      // 創建主題生成結果 (前端相容格式)
      const themeGeneration: PokemonThemeGeneration = {
        id: pokemonConfig.id,
        pokemonName: request.pokemonName,
        name: request.pokemonName, // alias for frontend
        emoji: pokemonConfig.emoji,
        theme: pokemonConfig.theme,
        elements: literaryElements,
        totalCharacterCount: literaryElements.reduce((sum, el) => sum + el.characterCount, 0),
        ageGroup,
        generatedAt: new Date(),
        generationType: actualGenerationType,
        variations: this.buildFrontendVariations(literaryElements)
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

  // 構建前端相容的變化格式
  private buildFrontendVariations(elements: LiteraryElement[]): ThemeVariation[] {
    return elements.map(element => ({
      type: element.type,
      description: element.content
    }))
  }

  // 獲取寶可夢的額外配置信息
  private getPokemonConfig(pokemonName: string) {
    const config = this.pokemonConfig[pokemonName]
    if (config) {
      return config
    }

    // 嘗試中英文轉換後再查找
    const englishName = this.chineseToEnglish(pokemonName)
    const chineseName = this.englishToChinese(pokemonName)

    return this.pokemonConfig[englishName] || this.pokemonConfig[chineseName] || {
      id: Math.floor(Math.random() * 1000) + 100, // 隨機ID
      emoji: '❓',
      theme: 'unknown'
    }
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

    const trimmedName = pokemonName.trim()

    // 檢查長度（1-50 字符）
    if (trimmedName.length === 0 || trimmedName.length > 50) {
      console.log(`❌ 寶可夢名稱長度無效: "${trimmedName}" (${trimmedName.length} 字符)`)
      return false
    }

    // 檢查是否在已知寶可夢列表中（中文或英文）
    const isKnownPokemon = this.pokemonNameMap[trimmedName] || this.reverseNameMap[trimmedName]
    if (isKnownPokemon) {
      console.log(`✅ 已知寶可夢名稱驗證通過: "${trimmedName}"`)
      return true
    }

    // 如果不在已知列表中，進行基本字符檢查
    const dangerousChars = /[<>{}[\]\\\/\|`~!@#$%^&*()+={};:'"?]/
    if (dangerousChars.test(trimmedName)) {
      console.log(`❌ 寶可夢名稱包含危險字符: "${trimmedName}"`)
      return false
    }

    console.log(`⚠️ 未知寶可夢名稱但格式有效: "${trimmedName}"`)
    return true
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