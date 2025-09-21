import { supabase, type Database } from '@/lib/supabase'
import type { CharacterInfo } from '@/utils/dictionaryV2'

type DictionaryCharacter = Database['public']['Tables']['dictionary_characters']['Row']
type UnknownCharacter = Database['public']['Tables']['unknown_characters']['Row']

export class DictionaryService {
  // 獲取所有字典字符
  static async getAllCharacters(): Promise<CharacterInfo[]> {
    try {
      const { data, error } = await supabase
        .from('dictionary_characters')
        .select('*')
        .order('character')

      if (error) throw error

      return data.map(this.mapDbToCharacterInfo)
    } catch (error) {
      console.error('獲取字典字符失敗:', error)
      return []
    }
  }

  // 獲取單個字符信息
  static async getCharacter(character: string): Promise<CharacterInfo | null> {
    try {
      console.log('🔍 查詢字符:', character)
      const { data, error } = await supabase
        .from('dictionary_characters')
        .select('*')
        .eq('character', character)
        .single()

      console.log('📊 查詢結果:', { data, error })

      if (error) {
        console.log('❌ 查詢錯誤:', error.code, error.message)
        if (error.code === 'PGRST116') {
          // 字符不存在，記錄為未知字符
          console.log('📝 記錄未知字符:', character)
          await this.recordUnknownCharacter(character)
          return null
        }
        throw error
      }

      const result = this.mapDbToCharacterInfo(data)
      console.log('✅ 找到字符:', result)
      return result
    } catch (error) {
      console.error('💥 獲取字符信息失敗:', error)
      return null
    }
  }

  // 添加新字符
  static async addCharacter(characterInfo: CharacterInfo): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('dictionary_characters')
        .insert({
          character: characterInfo.character,
          stroke_count: characterInfo.strokeCount,
          radical: characterInfo.radical,
          radical_zhuyin: characterInfo.radicalZhuyin || null,
          zhuyin: characterInfo.zhuyin
        })

      if (error) throw error

      // 如果添加成功，將未知字符標記為已解決
      await this.markUnknownCharacterResolved(characterInfo.character)

      return true
    } catch (error) {
      console.error('添加字符失敗:', error)
      return false
    }
  }

  // 更新字符信息
  static async updateCharacter(characterInfo: CharacterInfo): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('dictionary_characters')
        .update({
          stroke_count: characterInfo.strokeCount,
          radical: characterInfo.radical,
          radical_zhuyin: characterInfo.radicalZhuyin || null,
          zhuyin: characterInfo.zhuyin,
          updated_at: new Date().toISOString()
        })
        .eq('character', characterInfo.character)

      if (error) throw error
      return true
    } catch (error) {
      console.error('更新字符失敗:', error)
      return false
    }
  }

  // 記錄未知字符
  static async recordUnknownCharacter(character: string): Promise<void> {
    try {
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
          .update({ occurrence_count: existing.occurrence_count + 1 })
          .eq('id', existing.id)
      } else {
        // 新增未知字符
        await supabase
          .from('unknown_characters')
          .insert({
            character,
            occurrence_count: 1
          })
      }
    } catch (error) {
      console.error('記錄未知字符失敗:', error)
    }
  }

  // 獲取所有未知字符
  static async getUnknownCharacters(): Promise<UnknownCharacter[]> {
    try {
      const { data, error } = await supabase
        .from('unknown_characters')
        .select('*')
        .eq('resolved', false)
        .order('occurrence_count', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('獲取未知字符失敗:', error)
      return []
    }
  }

  // 標記未知字符為已解決
  static async markUnknownCharacterResolved(character: string): Promise<void> {
    try {
      await supabase
        .from('unknown_characters')
        .update({ resolved: true })
        .eq('character', character)
    } catch (error) {
      console.error('標記未知字符已解決失敗:', error)
    }
  }

  // 清空所有未知字符
  static async clearUnknownCharacters(): Promise<boolean> {
    try {
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

  // 獲取字典統計
  static async getDictionaryStats(): Promise<{ totalCharacters: number; charactersWithRadicalZhuyin: number; unknownCount: number }> {
    try {
      const [charactersResult, unknownResult] = await Promise.all([
        supabase
          .from('dictionary_characters')
          .select('radical_zhuyin', { count: 'exact' }),
        supabase
          .from('unknown_characters')
          .select('*', { count: 'exact' })
          .eq('resolved', false)
      ])

      // 檢查是否有錯誤
      if (charactersResult.error) {
        console.error('字典字符查詢錯誤:', charactersResult.error)
        throw charactersResult.error
      }
      if (unknownResult.error) {
        console.error('未知字符查詢錯誤:', unknownResult.error)
        throw unknownResult.error
      }

      const totalCharacters = charactersResult.count || 0
      const charactersWithRadicalZhuyin = charactersResult.data?.filter(item => item.radical_zhuyin).length || 0
      const unknownCount = unknownResult.count || 0

      return {
        totalCharacters,
        charactersWithRadicalZhuyin,
        unknownCount
      }
    } catch (error) {
      console.error('獲取字典統計失敗:', error)
      // 重新拋出錯誤，讓上層函數可以降級到本地統計
      throw error
    }
  }

  // 匯出字典數據
  static async exportDictionary(): Promise<CharacterInfo[]> {
    return await this.getAllCharacters()
  }

  // 批量導入字典數據
  static async importDictionary(characters: CharacterInfo[]): Promise<boolean> {
    try {
      const dbCharacters = characters.map(char => ({
        character: char.character,
        stroke_count: char.strokeCount,
        radical: char.radical,
        radical_zhuyin: char.radicalZhuyin || null,
        zhuyin: char.zhuyin
      }))

      const { error } = await supabase
        .from('dictionary_characters')
        .upsert(dbCharacters, {
          onConflict: 'character',
          ignoreDuplicates: false
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('導入字典失敗:', error)
      return false
    }
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