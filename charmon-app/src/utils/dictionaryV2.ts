// 統一的中文字典系統 V2 - 支持 Supabase
// 包含筆劃數、部首、注音等資訊

import { DictionaryService } from '@/services/dictionaryService'
import { MoedictService } from '@/services/moedictService'

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

// 本地緩存
const localCache = new Map<string, CharacterInfo>()
const unknownCharactersCache = new Set<string>()

// 是否使用 Supabase（可以通過環境變量控制）
const useSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('Supabase 配置狀態:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  url: import.meta.env.VITE_SUPABASE_URL,
  keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length,
  useSupabase
})

// 測試 Supabase 連接
if (useSupabase) {
  import('@/lib/supabase').then(({ supabase }) => {
    if (supabase) {
      console.log('🔗 測試 Supabase 連接...')

      // 簡單的表格檢查
      supabase.from('dictionary_characters').select('count', { count: 'exact', head: true })
        .then(({ error, count }) => {
          if (error) {
            console.error('❌ Supabase 連接失敗:', error)
          } else {
            console.log('✅ Supabase 連接成功! 字典表格有', count, '筆記錄')
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

// 本地字典數據
const fallbackDictionary: { [key: string]: CharacterInfo } = {
  // 常見姓氏
  '王': { character: '王', strokeCount: 4, radical: '王', radicalZhuyin: 'ㄨㄤˊ', zhuyin: 'ㄨㄤˊ' },
  '李': { character: '李', strokeCount: 7, radical: '木', radicalZhuyin: 'ㄇㄨˋ', zhuyin: 'ㄌㄧˇ' },
  '張': { character: '張', strokeCount: 11, radical: '弓', radicalZhuyin: 'ㄍㄨㄥ', zhuyin: 'ㄓㄤ' },
  '劉': { character: '劉', strokeCount: 15, radical: '刀', radicalZhuyin: 'ㄉㄠ', zhuyin: 'ㄌㄧㄡˊ' },
  '陳': { character: '陳', strokeCount: 10, radical: '阝', radicalZhuyin: 'ㄈㄨˋ', zhuyin: 'ㄔㄣˊ' },
  '周': { character: '周', strokeCount: 8, radical: '口', radicalZhuyin: 'ㄎㄡˇ', zhuyin: 'ㄓㄡ' },
  '吳': { character: '吳', strokeCount: 7, radical: '口', radicalZhuyin: 'ㄎㄡˇ', zhuyin: 'ㄨˊ' },
  '小': { character: '小', strokeCount: 3, radical: '小', radicalZhuyin: 'ㄒㄧㄠˇ', zhuyin: 'ㄒㄧㄠˇ' },
  '明': { character: '明', strokeCount: 8, radical: '日', radicalZhuyin: 'ㄖˋ', zhuyin: 'ㄇㄧㄥˊ' },
  '家': { character: '家', strokeCount: 10, radical: '宀', radicalZhuyin: 'ㄇㄧㄢˊ', zhuyin: 'ㄐㄧㄚ' },
  '紀': { character: '紀', strokeCount: 9, radical: '糸', radicalZhuyin: 'ㄇㄧˋ', zhuyin: 'ㄐㄧˋ' },
  '禾': { character: '禾', strokeCount: 5, radical: '禾', radicalZhuyin: 'ㄏㄜˊ', zhuyin: 'ㄏㄜˊ' }
}

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
      // 步驟 2: 不在本地字典檔中，直接記錄到 Supabase 並嘗試萌典 API
      if (char.trim() && /[\u4e00-\u9fff]/.test(char)) {
        console.log('📝 不在本地字典檔，記錄到 Supabase:', char)

        // 直接寫入 Supabase，不使用本地緩存
        if (useSupabase) {
          try {
            await DictionaryService.recordUnknownCharacter(char)
            console.log('✅ 已記錄到 Supabase:', char)
          } catch (error) {
            console.error('❌ 記錄到 Supabase 失敗，降級使用本地緩存:', error)
            unknownCharactersCache.add(char)
          }
        } else {
          // 沒有 Supabase 時使用本地緩存
          unknownCharactersCache.add(char)
          console.log('📝 已加入本地緩存，當前大小:', unknownCharactersCache.size)
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
  let zhuyinParts = []
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
      console.error('從 Supabase 獲取未知字符失敗，使用本地緩存:', error)
    }
  }

  // 降級使用本地緩存
  const result = Array.from(unknownCharactersCache).sort()
  console.log('📋 使用本地緩存未知字符列表:', result, '總數:', result.length)
  return result
}

export async function clearUnknownCharacters(): Promise<boolean> {
  if (useSupabase) {
    return await DictionaryService.clearUnknownCharacters()
  } else {
    unknownCharactersCache.clear()
    return true
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
  let unknownCount = unknownCharactersCache.size
  if (useSupabase) {
    try {
      const unknownChars = await DictionaryService.getUnknownCharacters()
      unknownCount = unknownChars.length
      console.log('📊 Supabase 未知字符數量:', unknownCount)
    } catch (error) {
      console.error('獲取 Supabase 未知字符失敗，使用本地緩存:', error)
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

// 字典管理（只處理未知字符標記）
export async function addCharacter(characterInfo: CharacterInfo): Promise<boolean> {
  console.log('📝 新增字符到本地字典:', characterInfo.character)

  // 將字符添加到本地字典
  fallbackDictionary[characterInfo.character] = characterInfo

  // 如果 Supabase 可用，標記未知字符為已解決
  if (useSupabase) {
    try {
      await DictionaryService.markUnknownCharacterResolved(characterInfo.character)
      console.log('✅ 已在 Supabase 標記字符為已解決:', characterInfo.character)
    } catch (error) {
      console.error('標記 Supabase 未知字符失敗:', error)
    }
  } else {
    // 沒有 Supabase 時才操作本地緩存
    unknownCharactersCache.delete(characterInfo.character)
  }

  console.log('✅ 字符已新增到本地字典:', characterInfo.character)
  return true
}

export async function updateCharacter(characterInfo: CharacterInfo): Promise<boolean> {
  console.log('📝 更新本地字典字符:', characterInfo.character)

  // 更新本地字典
  fallbackDictionary[characterInfo.character] = characterInfo

  console.log('✅ 字符已更新:', characterInfo.character)
  return true
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
  localCache.clear()
  console.log('🧹 已清除本地緩存')
}
