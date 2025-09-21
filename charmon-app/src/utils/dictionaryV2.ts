// 統一的中文字典系統 V2 - 支持 Supabase
// 包含筆劃數、部首、注音等資訊

import { DictionaryService } from '@/services/dictionaryService'
import { MoedictService } from '@/services/moedictService'
import dictionaryData from '@/data/dictionary.json'

export interface CharacterInfo {
  character: string
  strokeCount: number
  radical: string
  radicalZhuyin?: string
  zhuyin: string
  zhuyinParts?: ZhuyinPart[]
}

export interface ZhuyinPart {
  type: 'initial' | 'final' | 'tone-mark'
  text: string
}

// 未知字符記錄限制
const MAX_UNKNOWN_CHARS_PER_SESSION = 3
let unknownCharsRecordedInSession = 0

// 是否使用 Supabase（可以通過環境變量控制）
const useSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('Supabase 配置狀態:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  url: import.meta.env.VITE_SUPABASE_URL,
  keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length,
  useSupabase
})

// 測試 Supabase 連接 - 僅測試未知字符表
if (useSupabase) {
  import('@/lib/supabase').then(({ supabase }) => {
    if (supabase) {
      console.log('🔗 測試 Supabase 連接...')

      // 只檢查未知字符表
      supabase.from('unknown_characters').select('count', { count: 'exact', head: true })
        .then(({ error, count }: { error: unknown, count: unknown }) => {
          if (error) {
            console.error('❌ Supabase 未知字符表連接失敗:', error)
          } else {
            console.log('✅ Supabase 未知字符表連接成功! 有', count, '筆未知字符記錄')
          }
        })
    } else {
      console.log('⚠️ Supabase 未正確配置')
    }
  })
}

// 常用部首注音對照表
const radicalZhuyinMap: { [key: string]: string } = {
  '一': 'ㄧ',
  '丨': 'ㄍㄨㄣˇ',
  '丶': 'ㄓㄨˇ',
  '丿': 'ㄆㄧㄝˇ',
  '乙': 'ㄧˇ',
  '亅': 'ㄐㄩㄝˊ',
  '二': 'ㄦˋ',
  '亠': 'ㄊㄡˊ',
  '人': 'ㄖㄣˊ',
  '儿': 'ㄖㄣˊ',
  '入': 'ㄖㄨˋ',
  '八': 'ㄅㄚ',
  '冂': 'ㄐㄩㄥ',
  '冖': 'ㄇㄧˋ',
  '冫': 'ㄅㄧㄥ',
  '几': 'ㄐㄧˇ',
  '凵': 'ㄎㄢˇ',
  '刀': 'ㄉㄠ',
  '力': 'ㄌㄧˋ',
  '勹': 'ㄅㄠ',
  '匕': 'ㄅㄧˇ',
  '匚': 'ㄈㄤ',
  '匸': 'ㄒㄧˋ',
  '十': 'ㄕˊ',
  '卜': 'ㄅㄨˇ',
  '卩': 'ㄐㄧㄝ',
  '厂': 'ㄏㄢˇ',
  '厶': 'ㄙ',
  '又': 'ㄧㄡˋ',
  '口': 'ㄎㄡˇ',
  '囗': 'ㄨㄟˊ',
  '土': 'ㄊㄨˇ',
  '士': 'ㄕˋ',
  '夂': 'ㄓˇ',
  '夊': 'ㄙㄨㄟ',
  '夕': 'ㄒㄧ',
  '大': 'ㄉㄚˋ',
  '女': 'ㄋㄩˇ',
  '子': 'ㄗˇ',
  '宀': 'ㄇㄧㄢˊ',
  '寸': 'ㄘㄨㄣˋ',
  '小': 'ㄒㄧㄠˇ',
  '尢': 'ㄨㄤ',
  '尸': 'ㄕ',
  '屮': 'ㄔㄜˋ',
  '山': 'ㄕㄢ',
  '巛': 'ㄔㄨㄢ',
  '工': 'ㄍㄨㄥ',
  '己': 'ㄐㄧˇ',
  '巾': 'ㄐㄧㄣ',
  '干': 'ㄍㄢ',
  '幺': 'ㄧㄠ',
  '广': 'ㄧㄢˇ',
  '廴': 'ㄧㄣˇ',
  '廾': 'ㄍㄨㄥˇ',
  '弋': 'ㄧˋ',
  '弓': 'ㄍㄨㄥ',
  '彐': 'ㄐㄧˋ',
  '彡': 'ㄕㄢ',
  '彳': 'ㄔˋ',
  '心': 'ㄒㄧㄣ',
  '戈': 'ㄍㄜ',
  '戶': 'ㄏㄨˋ',
  '手': 'ㄕㄡˇ',
  '支': 'ㄓ',
  '攴': 'ㄆㄨ',
  '文': 'ㄨㄣˊ',
  '斗': 'ㄉㄡˇ',
  '斤': 'ㄐㄧㄣ',
  '方': 'ㄈㄤ',
  '无': 'ㄨˊ',
  '日': 'ㄖˋ',
  '曰': 'ㄩㄝ',
  '月': 'ㄩㄝˋ',
  '木': 'ㄇㄨˋ',
  '欠': 'ㄑㄧㄢˋ',
  '止': 'ㄓˇ',
  '歹': 'ㄉㄞˇ',
  '殳': 'ㄕㄨ',
  '毋': 'ㄨˊ',
  '比': 'ㄅㄧˇ',
  '毛': 'ㄇㄠˊ',
  '氏': 'ㄕˋ',
  '气': 'ㄑㄧˋ',
  '水': 'ㄕㄨㄟˇ',
  '火': 'ㄏㄨㄛˇ',
  '爪': 'ㄓㄠˇ',
  '父': 'ㄈㄨˋ',
  '爻': 'ㄧㄠˊ',
  '爿': 'ㄆㄢˊ',
  '片': 'ㄆㄧㄢˋ',
  '牙': 'ㄧㄚˊ',
  '牛': 'ㄋㄧㄡˊ',
  '犬': 'ㄑㄩㄢˇ',
  '玄': 'ㄒㄩㄢˊ',
  '玉': 'ㄩˋ',
  '瓜': 'ㄍㄨㄚ',
  '瓦': 'ㄨㄚˇ',
  '甘': 'ㄍㄢ',
  '生': 'ㄕㄥ',
  '用': 'ㄩㄥˋ',
  '田': 'ㄊㄧㄢˊ',
  '疋': 'ㄆㄧˇ',
  '疒': 'ㄋㄧˋ',
  '癶': 'ㄅㄛˊ',
  '白': 'ㄅㄞˊ',
  '皮': 'ㄆㄧˊ',
  '皿': 'ㄇㄧㄣˇ',
  '目': 'ㄇㄨˋ',
  '矛': 'ㄇㄠˊ',
  '矢': 'ㄕˇ',
  '石': 'ㄕˊ',
  '示': 'ㄕˋ',
  '禸': 'ㄖㄡˊ',
  '禾': 'ㄏㄜˊ',
  '穴': 'ㄒㄩㄝˋ',
  '立': 'ㄌㄧˋ',
  '竹': 'ㄓㄨˊ',
  '米': 'ㄇㄧˇ',
  '糸': 'ㄇㄧˋ',
  '缶': 'ㄈㄡˇ',
  '网': 'ㄨㄤˇ',
  '羊': 'ㄧㄤˊ',
  '羽': 'ㄩˇ',
  '老': 'ㄌㄠˇ',
  '而': 'ㄦˊ',
  '耒': 'ㄌㄟˇ',
  '耳': 'ㄦˇ',
  '聿': 'ㄩˋ',
  '肉': 'ㄖㄡˋ',
  '臣': 'ㄔㄣˊ',
  '自': 'ㄗˋ',
  '至': 'ㄓˋ',
  '臼': 'ㄐㄧㄡˋ',
  '舌': 'ㄕㄜˊ',
  '舛': 'ㄔㄨㄢˇ',
  '舟': 'ㄓㄡ',
  '艮': 'ㄍㄣˋ',
  '色': 'ㄙㄜˋ',
  '艸': 'ㄘㄠˇ',
  '虍': 'ㄏㄨ',
  '虫': 'ㄔㄨㄥˊ',
  '血': 'ㄒㄧㄝˇ',
  '行': 'ㄒㄧㄥˊ',
  '衣': 'ㄧ',
  '襾': 'ㄧㄚˋ'
}

// 載入靜態字典檔案
// 將 JSON 陣列轉換為物件格式以便快速查詢
const fallbackDictionary: { [key: string]: CharacterInfo } = {}

// 初始化字典
dictionaryData.forEach((char: CharacterInfo) => {
  fallbackDictionary[char.character] = char
})

console.log(`📚 已載入靜態字典，共 ${Object.keys(fallbackDictionary).length} 個字符`)

// 工具函數
export async function getCharacterInfo(char: string): Promise<CharacterInfo | null> {
  try {
    let info: CharacterInfo | null = null

    // 步驟 1: 檢查本地字典檔
    const localInfo = fallbackDictionary[char]
    console.log('🔍 檢查本地字典檔:', char, '存在:', !!localInfo)
    if (localInfo) {
      console.log('✅ 使用本地字典檔:', char, localInfo)
      info = localInfo
    } else {
      // 步驟 2: 不在本地字典檔中，檢查限制後記錄到 Supabase 並嘗試萌典 API
      if (char.trim() && /[\u4e00-\u9fff]/.test(char)) {
        console.log('📝 不在本地字典檔，檢查是否需要記錄:', char)

        // 檢查是否已達到會話記錄上限
        if (unknownCharsRecordedInSession >= MAX_UNKNOWN_CHARS_PER_SESSION) {
          console.log('⚠️ 已達到會話記錄上限 (', MAX_UNKNOWN_CHARS_PER_SESSION, ')，跳過記錄:', char)
        } else {
          // 直接寫入 Supabase
          if (useSupabase) {
            try {
              await DictionaryService.recordUnknownCharacter(char)
              unknownCharsRecordedInSession++
              console.log('✅ 已記錄到 Supabase:', char, '(', unknownCharsRecordedInSession, '/', MAX_UNKNOWN_CHARS_PER_SESSION, ')')
            } catch (error) {
              console.error('❌ 記錄到 Supabase 失敗:', error)
            }
          } else {
            console.log('⚠️ Supabase 未配置，跳過記錄:', char)
          }
        }

        console.log('🔍 嘗試萌典 API 獲取資料:', char)
        const moedictResult = await MoedictService.getCharacterInfo(char)

        if (moedictResult) {
          // 嘗試獲取部首注音
          let radicalZhuyin: string | undefined = undefined
          const radical = moedictResult.radical
          if (radical && radical !== '？') {
            // 方法 1: 先查本地部首注音對照表
            if (radicalZhuyinMap[radical]) {
              radicalZhuyin = radicalZhuyinMap[radical]
              console.log('✅ 使用部首注音對照表:', radical, '→', radicalZhuyin)
            } else {
              // 方法 2: 查詢萌典 API
              try {
                console.log('🔍 查詢萌典部首注音:', radical)
                const radicalResult = await MoedictService.getCharacterInfo(radical)
                if (radicalResult?.heteronyms?.[0]) {
                  radicalZhuyin = radicalResult.heteronyms[0].b || radicalResult.heteronyms[0].bopomofo
                  console.log('✅ 萌典部首注音:', radical, '→', radicalZhuyin)
                }
              } catch (error) {
                console.warn('⚠️ 獲取部首注音失敗:', error)
              }
            }
          }

          info = {
            character: char,
            strokeCount: moedictResult.stroke_count || 10,
            radical: moedictResult.radical || '？',
            radicalZhuyin: radicalZhuyin,
            zhuyin: moedictResult.heteronyms?.[0]?.b || moedictResult.heteronyms?.[0]?.bopomofo || 'ㄅㄆㄇ'
          }
          console.log('📄 萌典 API 獲得資料 (含部首注音):', char, info)
        } else {
          console.log('❌ 萌典 API 也沒有資料:', char)
        }
      }
    }

    return info
  } catch (error) {
    console.error('獲取字符信息失敗:', error)
    // 降級到本地字典
    return fallbackDictionary[char] || null
  }
}

export async function getStrokeCount(char: string): Promise<number> {
  const info = await getCharacterInfo(char)
  return info?.strokeCount || 10 // 預設值
}

export async function getRadical(char: string): Promise<string> {
  const info = await getCharacterInfo(char)
  return info?.radical || '？' // 預設值
}

export async function getRadicalZhuyin(char: string): Promise<string | null> {
  const info = await getCharacterInfo(char)
  return info?.radicalZhuyin || null
}

export async function getRadicalWithZhuyin(char: string): Promise<string> {
  const info = await getCharacterInfo(char)
  if (!info) return '？'

  const radical = info.radical
  const radicalZhuyin = info.radicalZhuyin

  if (radicalZhuyin) {
    return `${radical} (${radicalZhuyin})`
  } else {
    return radical
  }
}

export async function getZhuyin(char: string): Promise<string> {
  const info = await getCharacterInfo(char)
  return info?.zhuyin || 'ㄅㄆㄇ' // 預設值
}

// 解析注音為部件（用於顯示）
export function parseZhuyinToParts(zhuyin: string): ZhuyinPart[] {
  const consonants = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ']
  const vowels = ['ㄧ', 'ㄨ', 'ㄩ', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ']
  const tones = ['ˊ', 'ˇ', 'ˋ']
  const lightTone = '˙'

  const result = []
  const zhuyinParts = []
  let toneChar = ''
  let hasLightTone = false

  // 拆分注音符號
  for (let i = 0; i < zhuyin.length; i++) {
    const char = zhuyin[i]
    if (char === lightTone) {
      hasLightTone = true
    } else if (tones.includes(char)) {
      toneChar = char
    } else if (consonants.includes(char) || vowels.includes(char)) {
      zhuyinParts.push(char)
    }
  }

  // 如果有輕聲，放在最上面
  if (hasLightTone) {
    result.push({ text: lightTone, type: 'tone-mark' as const })
  }

  // 添加聲母和韻母（每個符號單獨成一個部件）
  zhuyinParts.forEach((part, index) => {
    if (index === zhuyinParts.length - 1 && toneChar && vowels.includes(part)) {
      // 最後一個韻母，有聲調時分開顯示
      result.push({ text: part, type: 'final' as const })
      result.push({ text: toneChar, type: 'tone-mark' as const })
    } else {
      result.push({ text: part, type: consonants.includes(part) ? 'initial' as const : 'final' as const })
    }
  })

  return result
}

export async function getZhuyinParts(char: string): Promise<ZhuyinPart[]> {
  const zhuyin = await getZhuyin(char)
  return parseZhuyinToParts(zhuyin)
}

// 未知字符管理
export async function getUnknownCharacters(): Promise<string[]> {
  if (useSupabase) {
    try {
      // 從 Supabase 獲取未知字符
      const unknownChars = await DictionaryService.getUnknownCharacters()
      const result = unknownChars.map(char => char.character).sort()
      console.log('📋 從 Supabase 獲取未知字符列表:', result, '總數:', result.length)
      return result
    } catch (error) {
      console.error('從 Supabase 獲取未知字符失敗:', error)
      return []
    }
  }

  console.log('📋 Supabase 未配置，返回空列表')
  return []
}

export async function clearUnknownCharacters(): Promise<boolean> {
  if (useSupabase) {
    return await DictionaryService.clearUnknownCharacters()
  } else {
    console.log('⚠️ Supabase 未配置，無法清空未知字符')
    return false
  }
}

// 字典統計
export async function getDictionaryStats(): Promise<{ totalCharacters: number; charactersWithRadicalZhuyin: number; unknownCount?: number }> {
  // 統計本地字典數據
  console.log('📊 計算本地字典統計')
  const localCharacters = Object.values(fallbackDictionary)
  const totalCharacters = localCharacters.length
  const charactersWithRadicalZhuyin = localCharacters.filter(char => char.radicalZhuyin).length

  // 從 Supabase 獲取未知字符數量（如果可用）
  let unknownCount = 0
  if (useSupabase) {
    try {
      const unknownChars = await DictionaryService.getUnknownCharacters()
      unknownCount = unknownChars.length
      console.log('📊 Supabase 未知字符數量:', unknownCount)
    } catch (error) {
      console.error('獲取 Supabase 未知字符失敗:', error)
    }
  }

  const result = {
    totalCharacters,
    charactersWithRadicalZhuyin,
    unknownCount
  }
  console.log('📊 最終統計結果:', result)
  return result
}

// 字典管理 - 使用靜態字典，不支援動態新增
export async function addCharacter(characterInfo: CharacterInfo): Promise<boolean> {
  console.log('⚠️ 靜態字典模式，不支援動態新增字符')
  console.log('💡 請直接編輯 src/data/dictionary.json 檔案')

  // 如果 Supabase 可用，仍然標記未知字符為已解決
  if (useSupabase) {
    try {
      await DictionaryService.markUnknownCharacterResolved(characterInfo.character)
      console.log('✅ 已在 Supabase 標記字符為已解決:', characterInfo.character)
    } catch (error) {
      console.error('標記 Supabase 未知字符失敗:', error)
    }
  }

  return false
}

export async function updateCharacter(): Promise<boolean> {
  console.log('⚠️ 靜態字典模式，不支援動態更新字符')
  console.log('💡 請直接編輯 src/data/dictionary.json 檔案')
  return false
}

export async function exportDictionary(): Promise<CharacterInfo[]> {
  return Object.values(fallbackDictionary)
}

// 檢查是否啟用 Supabase
export function isSupabaseEnabled(): boolean {
  return useSupabase
}

// 清除本地緩存
export function clearCache(): void {
  // 目前沒有實現本地緩存，預留接口
  console.log('🧹 已清除本地緩存')
}

// 重置會話未知字符記錄計數器
export function resetSessionUnknownCounter(): void {
  unknownCharsRecordedInSession = 0
  console.log('🔄 已重置會話未知字符計數器')
}

// 獲取當前會話狀態
export function getSessionStatus(): { recorded: number; max: number; remaining: number } {
  return {
    recorded: unknownCharsRecordedInSession,
    max: MAX_UNKNOWN_CHARS_PER_SESSION,
    remaining: MAX_UNKNOWN_CHARS_PER_SESSION - unknownCharsRecordedInSession
  }
}
