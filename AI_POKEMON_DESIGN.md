# AI 寶可夢文學練習生成器 - 數據結構設計

## 概述
基於用戶需求設計一個localhost-only的AI寶可夢文學練習生成器，輸入寶可夢名稱，生成包含5個文學元素的練習內容，總字數不超過108字。

## 現有系統分析

### 現有文學元素結構
```javascript
const literaryElements = ['顏色', '形容', '地點', '動態', '修辭']
```

### 現有URL參數結構
```
/worksheets?pokemonTheme=皮卡丘&variations=[{description:"金黃色的電氣小寶可夢"},{description:"活潑可愛充滿電力"},{description:"在青翠的森林中奔跑"},{description:"歡快地蹦蹦跳跳"},{description:"像閃電一樣迅速"}]
```

### 現有資料流程
1. URL參數傳入 pokemonTheme 和 variations
2. variations 是JSON數組，每個元素包含 description 字段
3. 每行對應一個文學元素
4. 總字數限制108字（約每個元素20字內）

## AI 生成器數據結構設計

### 1. 輸入數據結構
```typescript
interface PokemonGenerationRequest {
  pokemonName: string           // 寶可夢名稱，例如："皮卡丘"
  ageGroup?: AgeGroup          // 年齡適宜性（可選）
  generationType?: GenerationType // 生成類型（可選）
}

enum AgeGroup {
  KINDERGARTEN = "kindergarten",    // 幼稚園 (3-6歲)
  ELEMENTARY_LOW = "elementary-low", // 小學低年級 (6-9歲)
  ELEMENTARY_HIGH = "elementary-high" // 小學高年級 (9-12歲)
}

enum GenerationType {
  AI = "ai",                    // AI 生成
  TEMPLATE = "template",        // 範本生成
  HYBRID = "hybrid"            // 混合生成
}
```

### 2. 文學元素數據結構
```typescript
interface LiteraryElement {
  type: ElementType             // 文學元素類型
  content: string              // 具體內容
  characterCount: number       // 字數統計
  ageAppropriate: boolean      // 年齡適宜性
}

enum ElementType {
  COLOR = "顏色",           // 顏色描述
  DESCRIPTION = "形容",     // 形容描述
  LOCATION = "地點",        // 地點描述
  ACTION = "動態",          // 動作描述
  RHETORIC = "修辭"         // 修辭描述
}
```

### 3. 生成結果數據結構
```typescript
interface PokemonThemeGeneration {
  pokemonName: string          // 寶可夢名稱
  elements: LiteraryElement[]  // 5個文學元素
  totalCharacterCount: number  // 總字數
  ageGroup: AgeGroup          // 適用年齡群
  generatedAt: Date           // 生成時間
  generationType: GenerationType // 生成方式
  variations: ThemeVariation[] // 用於現有系統的格式
}

interface ThemeVariation {
  description: string          // 對應現有系統格式
}
```

### 4. 主題文件存儲結構
```typescript
interface PokemonThemeFile {
  id: string                   // 唯一標識符
  pokemonName: string          // 寶可夢名稱
  theme: PokemonThemeGeneration // 主題內容
  filePath: string            // 文件路徑
  createdAt: Date             // 創建時間
  updatedAt: Date             // 更新時間
}
```

## AI 生成策略設計

### 1. 多層次生成方案
```typescript
interface GenerationStrategy {
  primary: AIProvider          // 主要AI提供者
  fallback: AIProvider[]       // 備用方案
  template: TemplateGenerator  // 範本生成器
}

enum AIProvider {
  OLLAMA = "ollama",           // Ollama本地模型
  LOCAL_AI = "localai",        // LocalAI
  TEMPLATE = "template"        // 範本生成
}
```

### 2. Ollama 配置
```typescript
interface OllamaConfig {
  baseUrl: string              // http://localhost:11434
  model: string               // 推薦: qwen2.5:3b, yi:6b
  maxTokens: number           // 最大令牌數
  temperature: number         // 創造性參數
  timeout: number             // 超時設置
}
```

### 3. 提示詞模板
```typescript
interface PromptTemplate {
  system: string              // 系統提示詞
  user: string               // 用戶提示詞模板
  examples: PromptExample[]   // 示例
  constraints: string[]       // 約束條件
}

interface PromptExample {
  pokemon: string            // 寶可夢名稱
  elements: string[]         // 對應5個元素的示例
}
```

### 4. 範本生成器結構
```typescript
interface TemplateGenerator {
  colorTemplates: string[]    // 顏色範本
  descriptionTemplates: string[] // 形容範本
  locationTemplates: string[]  // 地點範本
  actionTemplates: string[]   // 動作範本
  rhetoricTemplates: string[] // 修辭範本
}
```

## 文件系統設計

### 目錄結構
```
src/
├── services/
│   ├── aiPokemonService.ts      # 主要服務
│   ├── ollamaService.ts         # Ollama集成
│   ├── templateService.ts       # 範本生成
│   └── themeFileService.ts      # 文件管理
├── data/
│   ├── pokemon-themes/          # 生成的主題文件
│   ├── templates/               # 範本數據
│   └── prompts/                 # 提示詞模板
├── types/
│   └── pokemon.ts               # 類型定義
└── views/
    └── PokemonAdminView.vue     # 管理界面
```

### 主題文件命名規範
```
pokemon-themes/
├── pikachu-20250921-001.json   # 皮卡丘-日期-序號
├── charizard-20250921-001.json # 噴火龍-日期-序號
└── index.json                  # 索引文件
```

## API 設計

### 後端 API 端點
```typescript
// POST /api/pokemon/generate
interface GenerateRequest {
  pokemonName: string
  ageGroup?: AgeGroup
  options?: GenerationOptions
}

interface GenerateResponse {
  success: boolean
  data?: PokemonThemeGeneration
  error?: string
}

// GET /api/pokemon/themes
interface ThemesResponse {
  themes: PokemonThemeFile[]
  total: number
}

// GET /api/pokemon/themes/:id
interface ThemeResponse {
  theme: PokemonThemeFile
}

// DELETE /api/pokemon/themes/:id
interface DeleteResponse {
  success: boolean
}
```

### 前端集成
```typescript
// 與現有 WorksheetsView 集成
const generatePokemonTheme = async (pokemonName: string) => {
  const response = await pokemonService.generate({
    pokemonName,
    ageGroup: userStore.currentUser?.gradeLevel
  })

  if (response.success) {
    // 轉換為現有URL格式
    const variations = response.data.variations
    router.push({
      path: '/worksheets',
      query: {
        pokemonTheme: pokemonName,
        variations: JSON.stringify(variations)
      }
    })
  }
}
```

## 字數控制策略

### 總字數限制 (108字)
- 顏色: 15-20字
- 形容: 20-25字
- 地點: 20-25字
- 動態: 20-25字
- 修辭: 15-20字

### 年齡適宜性調整
```typescript
const characterLimits = {
  kindergarten: {
    color: 12, description: 18, location: 18, action: 18, rhetoric: 12
  },
  'elementary-low': {
    color: 16, description: 22, location: 22, action: 22, rhetoric: 16
  },
  'elementary-high': {
    color: 20, description: 25, location: 25, action: 25, rhetoric: 20
  }
}
```

## ✅ 實作完成狀態

### 第一階段：後端API服務 (已完成)
- ✅ **Express.js API 服務器** (http://localhost:3001)
- ✅ **類型定義系統** - 完整的 TypeScript 介面和枚舉
- ✅ **多層次生成策略** - AI + 模板備援機制
- ✅ **模板生成服務** - 可靠的文學元素生成
- ✅ **Ollama AI 服務** - 本地 LLM 集成（支援 qwen2.5, yi 等模型）
- ✅ **文件存儲系統** - 自動主題保存和索引管理
- ✅ **API 端點實現**：
  - `POST /api/pokemon/generate` - 生成寶可夢主題
  - `GET /api/pokemon/health` - 健康檢查
  - `GET /api/pokemon/status` - 服務狀態
  - `GET /api/pokemon/themes` - 主題列表
  - `GET /api/pokemon/themes/:id` - 單個主題
  - `DELETE /api/pokemon/themes/:id` - 刪除主題
  - `GET /api/pokemon/search` - 搜索主題
  - `POST /api/pokemon/validate-name` - 名稱驗證

### 實作成果展示
```json
{
  "pokemonName": "Pikachu",
  "elements": [
    {"type": "顏色", "content": "溫暖的綠色Pikachu", "characterCount": 12},
    {"type": "形容", "content": "充滿活力的Pikachu", "characterCount": 12},
    {"type": "地點", "content": "在美麗的花園裡", "characterCount": 7},
    {"type": "動態", "content": "快樂地飛翔", "characterCount": 5},
    {"type": "修辭", "content": "宛如蝴蝶", "characterCount": 4}
  ],
  "totalCharacterCount": 40,
  "ageGroup": "kindergarten",
  "generationType": "template",
  "variations": [
    {"description": "溫暖的綠色Pikachu"},
    {"description": "充滿活力的Pikachu"},
    {"description": "在美麗的花園裡"},
    {"description": "快樂地飛翔"},
    {"description": "宛如蝴蝶"}
  ]
}
```

### 技術架構
```
charmon-backend/
├── src/
│   ├── types/pokemon.ts          ✅ 完整類型定義
│   ├── services/
│   │   ├── pokemonService.ts     ✅ 主要業務邏輯
│   │   ├── ollamaService.ts      ✅ AI 生成服務
│   │   ├── templateService.ts    ✅ 模板生成服務
│   │   └── themeFileService.ts   ✅ 文件管理服務
│   ├── routes/pokemonRoutes.ts   ✅ API 路由
│   ├── index.ts                  ✅ 服務器入口
│   └── data/pokemon-themes/      ✅ 主題存儲目錄
├── package.json                  ✅ 依賴配置
└── tsconfig.json                 ✅ TypeScript 配置
```

## 📋 下一步實作計劃

### 第二階段：前端管理界面 (進行中)
- 🔄 **創建 PokemonAdminView.vue** - 寶可夢主題管理頁面
- ⏳ **生成表單界面** - 用戶輸入寶可夢名稱和選項
- ⏳ **主題列表管理** - 顯示、編輯、刪除已生成主題
- ⏳ **預覽功能** - 即時查看生成的文學元素
- ⏳ **導航集成** - 加入主菜單和路由

### 第三階段：AI 整合優化 (待完成)
- ⏳ **Ollama 模型下載指南** - 設置本地 AI 模型
- ⏳ **AI 生成品質優化** - 調整提示詞和參數
- ⏳ **錯誤處理完善** - 網路異常和模型不可用處理

### 第四階段：測試和優化 (待完成)
- ⏳ **端到端測試** - 完整流程驗證
- ⏳ **性能優化** - 生成速度和資源使用
- ⏳ **用戶體驗優化** - 界面響應性和易用性

---

**設計完成時間**: 2025-01-21
**後端實作完成**: 2025-01-21
**當前進度**: 實作前端管理界面
**預計完成時間**: 2025-01-21