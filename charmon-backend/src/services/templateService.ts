import { TemplateGenerator, AgeGroup, CHARACTER_LIMITS } from '../types/pokemon'

export class TemplateService {
  private templates: TemplateGenerator

  constructor() {
    this.templates = {
      colorTemplates: [
        '{color}的{pokemon}',
        '美麗的{color}{pokemon}',
        '可愛的{color}小{pokemon}',
        '閃亮的{color}{pokemon}',
        '溫暖的{color}{pokemon}'
      ],
      descriptionTemplates: [
        '活潑可愛的{pokemon}',
        '聰明伶俐又{trait}',
        '溫柔善良的小夥伴',
        '充滿活力的{pokemon}',
        '友善可愛又{trait}',
        '機靈活潑的{pokemon}'
      ],
      locationTemplates: [
        '在美麗的{place}裡',
        '住在{place}中',
        '生活在{place}',
        '在{place}裡玩耍',
        '快樂地住在{place}'
      ],
      actionTemplates: [
        '開心地{action}',
        '快樂地{action}',
        '輕鬆地{action}',
        '愉快地{action}',
        '自由自在地{action}'
      ],
      rhetoricTemplates: [
        '像{metaphor}一樣{quality}',
        '如同{metaphor}般{quality}',
        '宛如{metaphor}',
        '好比{metaphor}一樣{quality}',
        '就像{metaphor}那麼{quality}'
      ]
    }
  }

  // 根據寶可夢名稱生成模板化描述
  generatePokemonElements(pokemonName: string, ageGroup: AgeGroup): string[] {
    const limits = CHARACTER_LIMITS[ageGroup]
    const pokemonData = this.getPokemonData(pokemonName)

    const elements = [
      this.generateColorElement(pokemonName, pokemonData, limits.color),
      this.generateDescriptionElement(pokemonName, pokemonData, limits.description),
      this.generateLocationElement(pokemonName, pokemonData, limits.location),
      this.generateActionElement(pokemonName, pokemonData, limits.action),
      this.generateRhetoricElement(pokemonName, pokemonData, limits.rhetoric)
    ]

    return elements
  }

  // 生成顏色元素
  private generateColorElement(pokemonName: string, data: PokemonData, limit: number): string {
    const template = this.getRandomTemplate(this.templates.colorTemplates)
    const color = this.getRandomItem(data.colors)

    let result = template
      .replace('{color}', color)
      .replace('{pokemon}', pokemonName)

    return this.truncateToLimit(result, limit)
  }

  // 生成形容元素
  private generateDescriptionElement(pokemonName: string, data: PokemonData, limit: number): string {
    const template = this.getRandomTemplate(this.templates.descriptionTemplates)
    const trait = this.getRandomItem(data.traits)

    let result = template
      .replace('{pokemon}', pokemonName)
      .replace('{trait}', trait)

    return this.truncateToLimit(result, limit)
  }

  // 生成地點元素
  private generateLocationElement(pokemonName: string, data: PokemonData, limit: number): string {
    const template = this.getRandomTemplate(this.templates.locationTemplates)
    const place = this.getRandomItem(data.locations)

    let result = template
      .replace('{place}', place)

    return this.truncateToLimit(result, limit)
  }

  // 生成動作元素
  private generateActionElement(pokemonName: string, data: PokemonData, limit: number): string {
    const template = this.getRandomTemplate(this.templates.actionTemplates)
    const action = this.getRandomItem(data.actions)

    let result = template
      .replace('{action}', action)

    return this.truncateToLimit(result, limit)
  }

  // 生成修辭元素
  private generateRhetoricElement(pokemonName: string, data: PokemonData, limit: number): string {
    const template = this.getRandomTemplate(this.templates.rhetoricTemplates)
    const metaphor = this.getRandomItem(data.metaphors)
    const quality = this.getRandomItem(data.qualities)

    let result = template
      .replace('{metaphor}', metaphor)
      .replace('{quality}', quality)

    return this.truncateToLimit(result, limit)
  }

  // 獲取寶可夢數據
  private getPokemonData(pokemonName: string): PokemonData {
    // 根據寶可夢名稱返回相應的數據
    const commonData = this.getCommonPokemonData()

    // 如果有特定寶可夢的數據，可以在這裡擴展
    const specificData = this.getSpecificPokemonData(pokemonName)

    return {
      ...commonData,
      ...specificData
    }
  }

  // 通用寶可夢數據
  private getCommonPokemonData(): PokemonData {
    return {
      colors: ['金黃色', '粉紅色', '藍色', '綠色', '紅色', '紫色', '白色', '黑色', '橙色', '銀色'],
      traits: ['可愛', '聰明', '勇敢', '溫柔', '活潑', '善良', '機靈', '友善'],
      locations: ['森林', '草原', '花園', '公園', '山谷', '湖邊', '海邊', '小屋'],
      actions: ['奔跑', '跳躍', '玩耍', '歌唱', '舞蹈', '游泳', '飛翔', '探險'],
      metaphors: ['陽光', '星星', '彩虹', '花朵', '蝴蝶', '小鳥', '雲朵', '寶石'],
      qualities: ['溫暖', '美麗', '閃亮', '可愛', '優雅', '靈活', '純潔', '珍貴']
    }
  }

  // 特定寶可夢數據
  private getSpecificPokemonData(pokemonName: string): Partial<PokemonData> {
    const specificData: Record<string, Partial<PokemonData>> = {
      '皮卡丘': {
        colors: ['金黃色', '電光黃', '亮黃色'],
        traits: ['電氣', '活潑', '聰明'],
        actions: ['放電', '奔跑', '跳躍'],
        metaphors: ['閃電', '陽光', '黃金'],
        qualities: ['迅速', '明亮', '活力']
      },
      '小火龍': {
        colors: ['橙紅色', '火紅色', '溫暖橙'],
        traits: ['勇敢', '熱情', '堅強'],
        actions: ['噴火', '飛行', '戰鬥'],
        metaphors: ['火焰', '太陽', '勇士'],
        qualities: ['熱情', '勇敢', '強大']
      },
      '傑尼龜': {
        colors: ['海藍色', '水藍色', '清藍色'],
        traits: ['冷靜', '智慧', '溫和'],
        actions: ['游泳', '噴水', '潛水'],
        metaphors: ['海洋', '清泉', '藍天'],
        qualities: ['清涼', '寧靜', '深邃']
      }
    }

    return specificData[pokemonName] || {}
  }

  // 隨機選擇模板
  private getRandomTemplate(templates: string[]): string {
    return templates[Math.floor(Math.random() * templates.length)]
  }

  // 隨機選擇項目
  private getRandomItem(items: string[]): string {
    return items[Math.floor(Math.random() * items.length)]
  }

  // 截斷到指定長度
  private truncateToLimit(text: string, limit: number): string {
    if (text.length <= limit) {
      return text
    }
    return text.substring(0, limit - 1) + '…'
  }
}

// 寶可夢數據介面
interface PokemonData {
  colors: string[]
  traits: string[]
  locations: string[]
  actions: string[]
  metaphors: string[]
  qualities: string[]
}