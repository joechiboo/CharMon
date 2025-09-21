// AI 寶可夢文學練習生成器 - 類型定義

export enum AgeGroup {
  KINDERGARTEN = "kindergarten",
  ELEMENTARY_LOW = "elementary-low",
  ELEMENTARY_HIGH = "elementary-high"
}

export enum GenerationType {
  AI = "ai",
  TEMPLATE = "template",
  HYBRID = "hybrid"
}

export enum ElementType {
  COLOR = "顏色",
  DESCRIPTION = "形容",
  LOCATION = "地點",
  ACTION = "動態",
  RHETORIC = "修辭"
}

export enum AIProvider {
  OLLAMA = "ollama",
  LOCAL_AI = "localai",
  TEMPLATE = "template"
}

// 輸入數據結構
export interface PokemonGenerationRequest {
  pokemonName: string
  ageGroup?: AgeGroup
  generationType?: GenerationType
}

// 文學元素數據結構
export interface LiteraryElement {
  type: ElementType
  content: string
  characterCount: number
  ageAppropriate: boolean
}

// 生成結果數據結構
export interface PokemonThemeGeneration {
  pokemonName: string
  elements: LiteraryElement[]
  totalCharacterCount: number
  ageGroup: AgeGroup
  generatedAt: Date
  generationType: GenerationType
  variations: ThemeVariation[]
}

// 用於現有系統的格式
export interface ThemeVariation {
  description: string
}

// 主題文件存儲結構
export interface PokemonThemeFile {
  id: string
  pokemonName: string
  theme: PokemonThemeGeneration
  filePath: string
  createdAt: Date
  updatedAt: Date
}

// AI 生成配置
export interface GenerationStrategy {
  primary: AIProvider
  fallback: AIProvider[]
  template: TemplateGenerator
}

export interface OllamaConfig {
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
  timeout: number
}

// 提示詞模板
export interface PromptTemplate {
  system: string
  user: string
  examples: PromptExample[]
  constraints: string[]
}

export interface PromptExample {
  pokemon: string
  elements: string[]
}

// 範本生成器結構
export interface TemplateGenerator {
  colorTemplates: string[]
  descriptionTemplates: string[]
  locationTemplates: string[]
  actionTemplates: string[]
  rhetoricTemplates: string[]
}

// API 響應結構
export interface GenerateResponse {
  success: boolean
  data?: PokemonThemeGeneration
  error?: string
}

export interface ThemesResponse {
  themes: PokemonThemeFile[]
  total: number
}

export interface ThemeResponse {
  theme: PokemonThemeFile
}

export interface DeleteResponse {
  success: boolean
}

// 字數限制配置
export interface CharacterLimits {
  color: number
  description: number
  location: number
  action: number
  rhetoric: number
}

export const CHARACTER_LIMITS: Record<AgeGroup, CharacterLimits> = {
  [AgeGroup.KINDERGARTEN]: {
    color: 12,
    description: 18,
    location: 18,
    action: 18,
    rhetoric: 12
  },
  [AgeGroup.ELEMENTARY_LOW]: {
    color: 16,
    description: 22,
    location: 22,
    action: 22,
    rhetoric: 16
  },
  [AgeGroup.ELEMENTARY_HIGH]: {
    color: 20,
    description: 25,
    location: 25,
    action: 25,
    rhetoric: 20
  }
}

// 文學元素順序
export const LITERARY_ELEMENTS = [
  ElementType.COLOR,
  ElementType.DESCRIPTION,
  ElementType.LOCATION,
  ElementType.ACTION,
  ElementType.RHETORIC
] as const