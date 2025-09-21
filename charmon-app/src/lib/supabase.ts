import { createClient } from '@supabase/supabase-js'

// 這些值需要從 Supabase 專案設定中獲取
// 在生產環境中應該使用環境變量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// 檢查環境變數是否有效
const isValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' &&
                      supabaseAnonKey !== 'placeholder-key' &&
                      supabaseUrl.startsWith('https://') &&
                      supabaseAnonKey.length > 50

console.log('Supabase 配置檢查:', {
  url: supabaseUrl,
  hasValidKey: supabaseAnonKey.length > 50,
  isValid: isValidConfig
})

export const supabase = isValidConfig ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 我們不需要用戶認證會話
  }
}) : null

// 數據庫類型定義
export interface Database {
  public: {
    Tables: {
      dictionary_characters: {
        Row: {
          id: string
          character: string
          stroke_count: number
          radical: string
          radical_zhuyin: string | null
          zhuyin: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          character: string
          stroke_count: number
          radical: string
          radical_zhuyin?: string | null
          zhuyin: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          character?: string
          stroke_count?: number
          radical?: string
          radical_zhuyin?: string | null
          zhuyin?: string
          created_at?: string
          updated_at?: string
        }
      }
      unknown_characters: {
        Row: {
          id: string
          character: string
          first_seen: string
          occurrence_count: number
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          character: string
          first_seen?: string
          occurrence_count?: number
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          character?: string
          first_seen?: string
          occurrence_count?: number
          resolved?: boolean
          created_at?: string
        }
      }
    }
  }
}