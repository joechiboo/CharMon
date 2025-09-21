import { supabase, type Database } from '@/lib/supabase'
import type { CharacterInfo } from '@/utils/dictionaryV2'

type DictionaryCharacter = Database['public']['Tables']['dictionary_characters']['Row']
type UnknownCharacter = Database['public']['Tables']['unknown_characters']['Row']
type UnknownCharacterUpdate = Database['public']['Tables']['unknown_characters']['Update']
type UnknownCharacterInsert = Database['public']['Tables']['unknown_characters']['Insert']

export class DictionaryService {
  // 獲取所有字典字符 - 現在只返回空數組，因為我們不使用 Supabase 字典表
  static async getAllCharacters(): Promise<CharacterInfo[]> {
    console.log('⚠️ 已停用 Supabase 字典表功能，返回空數組')
    return []
  }

  // 獲取單個字符信息 - 已停用，因為我們不使用 Supabase 字典表
  static async getCharacter(character: string): Promise<CharacterInfo | null> {
    console.log('⚠️ 已停用 Supabase 字典表功能，無法查詢字符:', character)
    return null
  }

  // 添加新字符 - 已停用，因為我們不使用 Supabase 字典表
  static async addCharacter(characterInfo: CharacterInfo): Promise<boolean> {
    console.log('⚠️ 已停用 Supabase 字典表功能，無法添加字符:', characterInfo.character)
    console.log('💡 請將字符添加到本地字典文件中')

    // 仍然標記未知字符為已解決
    await this.markUnknownCharacterResolved(characterInfo.character)

    return false
  }

  // 更新字符信息 - 已停用，因為我們不使用 Supabase 字典表
  static async updateCharacter(characterInfo: CharacterInfo): Promise<boolean> {
    console.log('⚠️ 已停用 Supabase 字典表功能，無法更新字符:', characterInfo.character)
    console.log('💡 請在本地字典文件中更新字符信息')
    return false
  }

  // 記錄未知字符
  static async recordUnknownCharacter(character: string): Promise<void> {
    try {
      if (!supabase) {
        console.log('⚠️ Supabase 未配置，無法記錄未知字符:', character)
        return
      }

      // 檢查是否已存在
      const { data: existing } = await supabase
        .from('unknown_characters')
        .select('id, occurrence_count')
        .eq('character', character)
        .eq('resolved', false)
        .single()

      if (existing) {
        // 增加出現次數
        await supabase
          .from('unknown_characters')
          .update({ occurrence_count: (existing as UnknownCharacter).occurrence_count + 1 } as UnknownCharacterUpdate)
          .eq('id', (existing as UnknownCharacter).id)
      } else {
        // 新增未知字符
        await supabase
          .from('unknown_characters')
          .insert({
            character,
            occurrence_count: 1
          } as UnknownCharacterInsert)
      }
    } catch (error) {
      console.error('記錄未知字符失敗:', error)
    }
  }

  // 獲取所有未知字符
  static async getUnknownCharacters(): Promise<UnknownCharacter[]> {
    try {
      if (!supabase) {
        console.log('⚠️ Supabase 未配置，返回空数组')
        return []
      }

      console.log('🔍 開始查詢 unknown_characters 表...')
      const { data, error } = await supabase
        .from('unknown_characters')
        .select('*')
        .eq('resolved', false)
        .order('occurrence_count', { ascending: false })

      if (error) {
        console.error('❌ Supabase 查詢錯誤:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Supabase 查詢成功，返回數據:', data?.length, '筆')
      return data || []
    } catch (error) {
      console.error('獲取未知字符失敗:', error)
      return []
    }
  }

  // 標記未知字符為已解決
  static async markUnknownCharacterResolved(character: string): Promise<void> {
    try {
      if (!supabase) {
        console.log('⚠️ Supabase 未配置，無法標記未知字符:', character)
        return
      }

      console.log(`🔄 正在標記字符 "${character}" 為已解決...`)

      const { data, error } = await supabase
        .from('unknown_characters')
        .update({ resolved: true } as UnknownCharacterUpdate)
        .eq('character', character)
        .select()

      if (error) {
        console.error(`❌ 標記字符 "${character}" 失敗:`, error)
        throw error
      }

      console.log(`✅ 成功標記字符 "${character}" 為已解決，影響行數:`, data?.length || 0)

      if (!data || data.length === 0) {
        console.warn(`⚠️ 字符 "${character}" 在 Supabase 中未找到或已解決`)
      }
    } catch (error) {
      console.error('標記未知字符已解決失敗:', error)
      throw error
    }
  }

  // 清空所有未知字符
  static async clearUnknownCharacters(): Promise<boolean> {
    try {
      if (!supabase) {
        console.log('⚠️ Supabase 未配置，無法清空未知字符')
        return false
      }

      const { error } = await supabase
        .from('unknown_characters')
        .delete()
        .eq('resolved', false)

      if (error) throw error
      return true
    } catch (error) {
      console.error('清空未知字符失敗:', error)
      return false
    }
  }

  // 獲取字典統計 - 只統計未知字符，字典統計由本地處理
  static async getDictionaryStats(): Promise<{ totalCharacters: number; charactersWithRadicalZhuyin: number; unknownCount: number }> {
    try {
      if (!supabase) {
        console.log('⚠️ Supabase 未配置，返回默認統計')
        return {
          totalCharacters: 0,
          charactersWithRadicalZhuyin: 0,
          unknownCount: 0
        }
      }

      // 只查詢未知字符數量
      const { count: unknownCount, error } = await supabase
        .from('unknown_characters')
        .select('*', { count: 'exact' })
        .eq('resolved', false)

      if (error) {
        console.error('未知字符查詢錯誤:', error)
        throw error
      }

      return {
        totalCharacters: 0, // 由本地字典處理
        charactersWithRadicalZhuyin: 0, // 由本地字典處理
        unknownCount: unknownCount || 0
      }
    } catch (error) {
      console.error('獲取未知字符統計失敗:', error)
      // 重新拋出錯誤，讓上層函數可以降級到本地統計
      throw error
    }
  }

  // 匯出字典數據 - 已停用，因為我們不使用 Supabase 字典表
  static async exportDictionary(): Promise<CharacterInfo[]> {
    console.log('⚠️ 已停用 Supabase 字典表功能，無法匯出')
    console.log('💡 請直接使用本地字典文件')
    return []
  }

  // 清空字典表 - 已停用，因為我們不使用 Supabase 字典表
  static async clearDictionary(): Promise<boolean> {
    console.log('⚠️ 已停用 Supabase 字典表功能，無法清空字典')
    return false
  }

  // 批量導入字典數據 - 已停用，因為我們不使用 Supabase 字典表
  static async importDictionary(): Promise<boolean> {
    console.log('⚠️ 已停用 Supabase 字典表功能，無法導入字典')
    console.log('💡 請更新本地字典文件')
    return false
  }

  // 數據庫記錄轉換為 CharacterInfo
  private static mapDbToCharacterInfo(dbChar: DictionaryCharacter): CharacterInfo {
    return {
      character: dbChar.character,
      strokeCount: dbChar.stroke_count,
      radical: dbChar.radical,
      radicalZhuyin: dbChar.radical_zhuyin || undefined,
      zhuyin: dbChar.zhuyin
    }
  }
}