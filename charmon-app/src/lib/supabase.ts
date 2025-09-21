import { createClient } from '@supabase/supabase-js'

// 這些值需要從 Supabase 專案設定中獲取
// 在生產環境中應該使用環境變量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 我們不需要用戶認證會話
  }
})

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