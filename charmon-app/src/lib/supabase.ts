import { createClient, SupabaseClient } from '@supabase/supabase-js'

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
  keyPrefix: supabaseAnonKey.substring(0, 20) + '...',
  keyLength: supabaseAnonKey.length,
  hasValidKey: supabaseAnonKey.length > 50,
  isValid: isValidConfig,
  envCheck: {
    hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  }
})

// 嘗試創建 supabase 客戶端並測試
let supabaseClient: SupabaseClient<Database> | null = null
if (isValidConfig) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // 我們不需要用戶認證會話
      }
    })
    console.log('✅ Supabase 客戶端創建成功')
  } catch (error) {
    console.error('❌ Supabase 客戶端創建失敗:', error)
    supabaseClient = null
  }
} else {
  console.log('⚠️ Supabase 配置無效，跳過客戶端創建')
}

export const supabase = supabaseClient

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