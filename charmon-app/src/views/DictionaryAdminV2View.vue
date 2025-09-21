<template>
  <div class="dictionary-admin">
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        ← 返回
      </button>
      <h1>字典管理後台</h1>
    </div>

    <div class="admin-content">
      <!-- 狀態消息 -->
      <div v-if="showStatusMessage" class="status-message" :class="statusMessage.includes('成功') ? 'success' : statusMessage.includes('失敗') || statusMessage.includes('錯誤') ? 'error' : 'info'">
        <div class="status-content">
          <span class="status-text">{{ statusMessage }}</span>
          <button @click="showStatusMessage = false" class="close-btn">✕</button>
        </div>
      </div>

      <!-- 統計信息 -->
      <div class="stats-section">
        <div class="stat-card">
          <h3>字典統計</h3>
          <div class="stat-item">
            <span class="label">已收錄字符：</span>
            <span class="value">{{ stats.totalCharacters }} 個</span>
          </div>
          <div class="stat-item">
            <span class="label">含部首注音：</span>
            <span class="value">{{ stats.charactersWithRadicalZhuyin }} 個</span>
          </div>
          <div class="stat-item">
            <span class="label">未知字符：</span>
            <span class="value">{{ unknownCharacters.length }} 個</span>
          </div>
          <div class="stat-item">
            <span class="label">數據源：</span>
            <span class="value" :class="{ 'supabase': isSupabaseEnabled(), 'local': !isSupabaseEnabled() }">
              {{ isSupabaseEnabled() ? 'Supabase' : '本地字典' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Supabase 配置提示 -->
      <div v-if="!isSupabaseEnabled" class="config-notice">
        <div class="notice-card">
          <h3>🔧 Supabase 配置</h3>
          <p>目前使用本地字典。要啟用完整的字典管理功能，請配置 Supabase：</p>
          <ol>
            <li>複製 <code>.env.example</code> 為 <code>.env</code></li>
            <li>在 Supabase 控制台創建專案</li>
            <li>運行 <code>sql/setup.sql</code> 腳本設置數據庫</li>
            <li>填入 <code>VITE_SUPABASE_URL</code> 和 <code>VITE_SUPABASE_ANON_KEY</code></li>
          </ol>
        </div>
      </div>

      <!-- 未知字符列表 -->
      <div class="unknown-section">
        <div class="section-header">
          <h2>待新增字符</h2>
          <div class="header-actions">
            <button @click="refreshUnknownCharacters" class="refresh-btn" :disabled="loading">
              🔄 刷新
            </button>
            <button v-if="isLocalhost" @click="syncData" class="action-btn sync" :disabled="loading">
              🔄 同步數據
            </button>
            <button v-if="!isLocalhost" @click="cleanupExisting" class="action-btn cleanup" :disabled="loading">
              🧹 清理已有字符
            </button>
          </div>
        </div>

      <!-- 同步結果代碼區域 -->
      <div v-if="showSyncedCode" class="synced-code-section">
        <h2>📄 同步結果代碼</h2>
        <div class="code-instructions">
          <p>請將以下代碼複製並添加到 <code>dictionaryV2.ts</code> 的 <code>fallbackDictionary</code> 物件中：</p>
        </div>
        <div class="code-container">
          <textarea
            v-model="syncedCode"
            readonly
            placeholder="同步的代碼將顯示在這裡..."
            rows="15"
            class="code-textarea"
          ></textarea>
          <div class="action-buttons">
            <button @click="copyCode" class="copy-btn">📋 複製代碼</button>
            <button @click="selectAllCode" class="select-btn">🎯 全選</button>
            <button @click="clearCode" class="clear-btn">🗑️ 清除</button>
          </div>
        </div>
      </div>

        <p v-if="unknownCharacters.length === 0" class="empty-message">
          目前沒有未知字符需要處理
        </p>
        <div v-else class="unknown-grid">
          <div
            v-for="char in unknownCharacters"
            :key="char"
            class="unknown-char-card"
            @click="selectCharForEdit(char)"
          >
            <div class="char-display">{{ char }}</div>
            <div class="char-status">未收錄</div>
          </div>
        </div>
      </div>

      <!-- 字符編輯表單 -->
      <div v-if="editingChar" class="edit-section">
        <h2>編輯字符：{{ editingChar }}</h2>
        <form @submit.prevent="saveCharacter" class="edit-form">
          <div class="form-group">
            <label>字符：</label>
            <input v-model="editForm.character" readonly />
          </div>

          <div class="form-group">
            <label>筆劃數：</label>
            <input
              v-model.number="editForm.strokeCount"
              type="number"
              min="1"
              max="50"
              required
            />
          </div>

          <div class="form-group">
            <label>部首：</label>
            <input v-model="editForm.radical" required />
          </div>

          <div class="form-group">
            <label>部首注音：</label>
            <input v-model="editForm.radicalZhuyin" placeholder="選填，例如：ㄇㄧㄢˊ" />
          </div>

          <div class="form-group">
            <label>注音：</label>
            <input v-model="editForm.zhuyin" required placeholder="例如：ㄐㄧㄚ" />
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
            <button type="button" @click="cancelEdit" class="cancel-btn">取消</button>
          </div>
        </form>
      </div>

      <!-- 文章檢查功能 - 暫時隱藏 -->
      <div v-if="false" class="article-check-section">
        <h3>📝 文章字典檢查</h3>
        <p>貼上文章內容，檢查哪些字符不在字典中，並可批量新增到 Supabase</p>

        <div class="form-group">
          <label for="articleText">文章內容</label>
          <textarea
            id="articleText"
            v-model="articleText"
            placeholder="請貼上要檢查的文章內容..."
            rows="6"
            class="article-textarea"
          ></textarea>
        </div>

        <div class="article-actions">
          <button @click="checkArticle" class="action-btn check" :disabled="!articleText.trim() || checking">
            🔍 {{ checking ? '檢查中...' : '檢查文章' }}
          </button>
          <button
            v-if="missingChars.length > 0"
            @click="addMissingChars"
            class="action-btn add-all"
            :disabled="adding"
          >
            ➕ {{ adding ? '新增中...' : `新增 ${missingChars.length} 個字符` }}
          </button>
        </div>

        <!-- 檢查結果 -->
        <div v-if="checkResult" class="check-result">
          <div class="result-stats">
            <span class="stat-item">
              📊 總字符: {{ checkResult?.totalChars }}
            </span>
            <span class="stat-item">
              ✅ 已在字典: {{ checkResult?.foundChars }}
            </span>
            <span class="stat-item">
              ❌ 缺少字符: {{ checkResult?.missingChars }}
            </span>
          </div>

          <div v-if="missingChars.length > 0" class="missing-chars">
            <h4>缺少的字符：</h4>
            <div class="missing-list">
              <span
                v-for="char in missingChars"
                :key="char"
                class="missing-char"
                @click="selectCharForEdit(char)"
              >
                {{ char }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getUnknownCharacters,
  getDictionaryStats,
  addCharacter,
  updateCharacter,
  isSupabaseEnabled,
  getCharacterInfo,
  exportDictionary,
  type CharacterInfo
} from '@/utils/dictionaryV2'
import { MoedictService } from '@/services/moedictService'
import { DictionaryService } from '@/services/dictionaryService'
import { supabase } from '@/lib/supabase'

const router = useRouter()

// 數據
const stats = ref({
  totalCharacters: 0,
  charactersWithRadicalZhuyin: 0,
  unknownCount: 0
})
const unknownCharacters = ref<string[]>([])
const editingChar = ref<string | null>(null)
const editForm = ref({
  character: '',
  strokeCount: 1,
  radical: '',
  radicalZhuyin: '',
  zhuyin: ''
})

// 文章檢查功能
const articleText = ref('')
const checking = ref(false)
const adding = ref(false)
const checkResult = ref<{
  totalChars: number
  foundChars: number
  missingChars: number
} | null>(null)
const missingChars = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)
const statusMessage = ref<string>('')
const showStatusMessage = ref(false)
const syncedCode = ref<string>('')
const showSyncedCode = ref(false)

// 顯示狀態消息
const showStatus = (message: string, autoHide = true) => {
  statusMessage.value = message
  showStatusMessage.value = true

  if (autoHide) {
    setTimeout(() => {
      showStatusMessage.value = false
    }, 5000) // 5秒後自動隱藏
  }
}

// 計算屬性
const supabaseEnabled = computed(() => !!supabase)
const isLocalhost = computed(() => {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1'
})

// 方法
const goBack = () => {
  router.push('/dashboard')
}

const loadStats = async () => {
  try {
    console.log('🔄 開始載入統計...')
    console.log('📋 Supabase 狀態:', isSupabaseEnabled())
    const result = await getDictionaryStats()
    console.log('📊 統計結果:', result)
    stats.value = {
      totalCharacters: result.totalCharacters,
      charactersWithRadicalZhuyin: result.charactersWithRadicalZhuyin,
      unknownCount: result.unknownCount || 0
    }
    console.log('✅ 統計載入完成:', stats.value)
  } catch (error) {
    console.error('❌ 載入統計失敗:', error)
  }
}

const loadUnknownCharacters = async () => {
  try {
    unknownCharacters.value = await getUnknownCharacters()
  } catch (error) {
    console.error('載入未知字符失敗:', error)
  }
}

const refreshUnknownCharacters = async () => {
  loading.value = true
  try {
    await loadUnknownCharacters()
    await loadStats()
  } finally {
    loading.value = false
  }
}

const selectCharForEdit = (char: string) => {
  editingChar.value = char
  editForm.value = {
    character: char,
    strokeCount: 10, // 預設值，適合文章檢查功能
    radical: '？',
    radicalZhuyin: '',
    zhuyin: 'ㄅㄆㄇ'
  }

  // 滾動到編輯表單
  document.querySelector('.edit-section')?.scrollIntoView({ behavior: 'smooth' })
}

const cancelEdit = () => {
  editingChar.value = null
  editForm.value = {
    character: '',
    strokeCount: 1,
    radical: '',
    radicalZhuyin: '',
    zhuyin: ''
  }
}

const saveCharacter = async () => {
  if (!isSupabaseEnabled()) {
    showStatus('⚠️ 字典管理功能需要 Supabase 配置')
    return
  }

  saving.value = true
  try {
    const characterInfo: CharacterInfo = {
      character: editForm.value.character,
      strokeCount: editForm.value.strokeCount,
      radical: editForm.value.radical,
      radicalZhuyin: editForm.value.radicalZhuyin || undefined,
      zhuyin: editForm.value.zhuyin
    }

    const success = await addCharacter(characterInfo)

    if (success) {
      showStatus(`✅ 成功保存字符：${editForm.value.character}`)

      // 從未知列表中移除
      unknownCharacters.value = unknownCharacters.value.filter(char => char !== editingChar.value)

      // 重新載入統計
      await loadStats()

      cancelEdit()
    } else {
      showStatus('❌ 保存失敗，請檢查網絡連接或數據庫配置')
    }
  } catch (error) {
    console.error('保存字符失敗:', error)
    showStatus('❌ 保存失敗：' + (error as Error).message)
  } finally {
    saving.value = false
  }
}


// 文章檢查功能
const checkArticle = async () => {
  if (!articleText.value.trim()) return

  checking.value = true
  try {
    // 提取所有中文字符
    const chineseChars = [...new Set(articleText.value.match(/[\u4e00-\u9fff]/g) || [])]
    const totalChars = chineseChars.length
    let foundChars = 0
    const missing: string[] = []

    // 檢查每個字符是否在字典中
    for (const char of chineseChars) {
      const info = await getCharacterInfo(char)
      if (info) {
        foundChars++
      } else {
        missing.push(char)
      }
    }

    // 更新檢查結果
    checkResult.value = {
      totalChars,
      foundChars,
      missingChars: missing.length
    }
    missingChars.value = missing

    console.log('文章檢查完成:', {
      totalChars,
      foundChars,
      missingChars: missing.length,
      missing
    })
  } catch (error) {
    console.error('檢查文章失敗:', error)
    showStatus('❌ 檢查失敗：' + (error as Error).message)
  } finally {
    checking.value = false
  }
}

const addMissingChars = async () => {
  if (!isSupabaseEnabled()) {
    showStatus('⚠️ 批量新增功能需要 Supabase 配置')
    return
  }

  if (missingChars.value.length === 0) return

  adding.value = true
  try {
    let successCount = 0

    for (const char of missingChars.value) {
      // 為每個字符創建基本資料
      const characterInfo: CharacterInfo = {
        character: char,
        strokeCount: 10, // 預設筆劃數
        radical: '？', // 預設部首
        radicalZhuyin: undefined,
        zhuyin: 'ㄅㄆㄇ' // 預設注音，待後續修改
      }

      const success = await addCharacter(characterInfo)
      if (success) {
        successCount++
      }
    }

    if (successCount > 0) {
      await loadStats()
      await loadUnknownCharacters()
      showStatus(`✅ 成功新增 ${successCount} 個字符到字典！\n這些字符使用預設值，請後續手動修改正確的筆劃、部首和注音。`)

      // 清空檢查結果
      checkResult.value = null
      missingChars.value = []
      articleText.value = ''
    } else {
      showStatus('⚠️ 沒有字符被新增，請檢查字符是否已存在')
    }
  } catch (error) {
    console.error('批量新增失敗:', error)
    showStatus('❌ 批量新增失敗：' + (error as Error).message)
  } finally {
    adding.value = false
  }
}


const syncData = async () => {
  loading.value = true
  try {
    console.log('🔄 開始同步數據，將萌典 API 資料寫回源碼檔案...')

    // 取得目前的未知字符列表
    await loadUnknownCharacters()
    const charactersToSync = [...unknownCharacters.value]

    if (charactersToSync.length === 0) {
      showStatus('⚠️ 沒有需要同步的字符')
      return
    }

    // 取得本地字典資料
    const localDictionary = await exportDictionary()
    const localChars = new Set(localDictionary.map(char => char.character))
    console.log(`📚 本地字典共有 ${localChars.size} 個字符`)

    let successCount = 0
    let failCount = 0
    let deletedCount = 0
    const newCharacters: { [key: string]: CharacterInfo } = {}
    const toDelete: string[] = []

    // 第一步：檢查哪些字符已經在本地字典中
    console.log('🔍 檢查本地字典中已有的字符...')
    for (const char of charactersToSync) {
      if (localChars.has(char)) {
        console.log(`✅ 字符 "${char}" 已存在於本地字典，標記為待刪除`)
        toDelete.push(char)
      }
    }

    // 刪除已存在的字符
    if (toDelete.length > 0) {
      console.log(`🗑️ 從 Supabase 刪除 ${toDelete.length} 個已存在的字符:`, toDelete)
      for (const char of toDelete) {
        try {
          await DictionaryService.markUnknownCharacterResolved(char)
          deletedCount++
          console.log(`✅ 已標記字符 "${char}" 為已解決`)
        } catch (error) {
          console.error(`❌ 刪除字符 "${char}" 失敗:`, error)
        }
      }
    }

    // 過濾出需要查詢 API 的字符
    const charsToQuery = charactersToSync.filter(char => !localChars.has(char))
    console.log(`🔎 需要查詢萌典 API 的字符 (${charsToQuery.length}/${charactersToSync.length}):`, charsToQuery)

    // 第二步：使用萌典 API 查詢不在本地字典中的字符
    if (charsToQuery.length > 0) {
      console.log('🌐 開始查詢萌典 API...')
      for (const char of charsToQuery) {
        try {
          console.log(`🔍 查詢字符: ${char}`)

        // 查詢萌典 API 取得字符資料
        const moedictResult = await MoedictService.getCharacterInfo(char)

        if (moedictResult) {
          // 嘗試獲取部首注音
          let radicalZhuyin: string | undefined = undefined
          const radical = moedictResult.radical
          if (radical && radical !== '？') {
            // 先查本地部首注音對照表
            const radicalZhuyinMap: { [key: string]: string } = {
              '宀': 'ㄇㄧㄢˊ', '木': 'ㄇㄨˋ', '弓': 'ㄍㄨㄥ', '刀': 'ㄉㄠ',
              '阝': 'ㄈㄨˋ', '口': 'ㄎㄡˇ', '日': 'ㄖˋ', '小': 'ㄒㄧㄠˇ',
              '糸': 'ㄇㄧˋ', '禾': 'ㄏㄜˊ', '王': 'ㄨㄤˊ', '人': 'ㄖㄣˊ',
              '力': 'ㄌㄧˋ', '卜': 'ㄅㄨˇ', '厶': 'ㄙ', '土': 'ㄊㄨˇ',
              '大': 'ㄉㄚˋ', '山': 'ㄕㄢ', '心': 'ㄒㄧㄣ', '攴': 'ㄆㄨ',
              '水': 'ㄕㄨㄟˇ', '火': 'ㄏㄨㄛˇ', '白': 'ㄅㄞˊ', '皮': 'ㄆㄧˊ',
              '色': 'ㄙㄜˋ', '艸': 'ㄘㄠˇ', '衣': 'ㄧ', '足': 'ㄗㄨˊ',
              '金': 'ㄐㄧㄣ', '門': 'ㄇㄣˊ', '阜': 'ㄈㄨˋ', '黃': 'ㄏㄨㄤˊ',
              '龍': 'ㄌㄨㄥˊ', '一': 'ㄧ'
            }

            if (radicalZhuyinMap[radical]) {
              radicalZhuyin = radicalZhuyinMap[radical]
              console.log(`🎯 從本地對照表找到部首注音: ${radical} → ${radicalZhuyin}`)
            } else {
              // 如果本地對照表沒有，再查萌典 API
              console.log(`🔎 本地對照表無此部首，查詢萌典 API: ${radical}`)
              try {
                const radicalZhuyin_api = await MoedictService.getZhuyin(radical)
                if (radicalZhuyin_api) {
                  radicalZhuyin = radicalZhuyin_api
                  console.log(`✅ 從萌典 API 找到部首注音: ${radical} → ${radicalZhuyin}`)
                } else {
                  console.log(`❌ 萌典 API 查無部首注音: ${radical}`)
                }
                // 部首查詢延遲，避免 API 過載
                await new Promise(resolve => setTimeout(resolve, 200))
              } catch (radicalError) {
                console.log(`❌ 部首注音查詢錯誤: ${radical}`, radicalError)
              }
            }
          }

          // 獲取字符的注音，優先使用更可靠的方法
          let characterZhuyin = 'ㄅㄆㄇ' // 預設值
          try {
            const zhuyinFromService = await MoedictService.getZhuyin(char)
            if (zhuyinFromService) {
              characterZhuyin = zhuyinFromService
            } else {
              // 降級到直接解析
              characterZhuyin = moedictResult.heteronyms?.[0]?.b || moedictResult.heteronyms?.[0]?.bopomofo || 'ㄅㄆㄇ'
            }
          } catch (zhuyinError) {
            console.log(`⚠️ 注音查詢失敗，使用原始數據: ${char}`)
            characterZhuyin = moedictResult.heteronyms?.[0]?.b || moedictResult.heteronyms?.[0]?.bopomofo || 'ㄅㄆㄇ'
          }

          const characterInfo: CharacterInfo = {
            character: char,
            strokeCount: moedictResult.stroke_count || 10,
            radical: moedictResult.radical || '？',
            radicalZhuyin: radicalZhuyin,
            zhuyin: characterZhuyin
          }

          newCharacters[char] = characterInfo
          console.log(`📝 準備新增字符資料:`, characterInfo)
          successCount++
        } else {
          failCount++
          console.log(`❌ 萌典查詢失敗: ${char}`)
        }

        // 每次請求間隔，避免過於頻繁
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`同步字符 ${char} 失敗:`, error)
        failCount++
      }
    }
    } else {
      console.log('✅ 所有未知字符都已存在於本地字典中')
    }

    // 如果有成功獲取的字符，產生手動更新的程式碼
    if (Object.keys(newCharacters).length > 0) {
      console.warn('📝 請將以下字符添加到 fallbackDictionary:')

      // 產生手動更新的程式碼
      let codeToAdd = '\n// 新增的字符 (請複製到 fallbackDictionary 物件中):\n'
      for (const [char, info] of Object.entries(newCharacters)) {
        codeToAdd += `  '${char}': { character: '${char}', strokeCount: ${info.strokeCount}, radical: '${info.radical}', radicalZhuyin: ${info.radicalZhuyin ? `'${info.radicalZhuyin}'` : 'undefined'}, zhuyin: '${info.zhuyin}' },\n`
      }

      console.log(codeToAdd)

      // 從未知字符列表移除已同步的字符
      for (const char of Object.keys(newCharacters)) {
        const index = unknownCharacters.value.indexOf(char)
        if (index > -1) {
          unknownCharacters.value.splice(index, 1)
        }
      }

      // 顯示代碼區域
      syncedCode.value = codeToAdd
      showSyncedCode.value = true

      showStatus(`✅ 同步成功取得 ${successCount} 個字符資料！\n請複製下方的代碼並添加到 fallbackDictionary 物件中。`, false)
    }

    // 重新載入數據
    await loadStats()
    await loadUnknownCharacters()

    // 更新統計結果，包含刪除的字符
    const totalProcessed = successCount + failCount + deletedCount
    if (Object.keys(newCharacters).length > 0) {
      showStatus(`✅ 數據同步完成\n查詢成功: ${successCount} 個字符\n查詢失敗: ${failCount} 個字符\n已存在刪除: ${deletedCount} 個字符\n總處理: ${totalProcessed} 個字符\n\n新字符資料已準備好寫入源碼檔案`, false)
    } else if (deletedCount > 0) {
      showStatus(`✅ 數據同步完成\n查詢成功: ${successCount} 個字符\n查詢失敗: ${failCount} 個字符\n已存在刪除: ${deletedCount} 個字符\n總處理: ${totalProcessed} 個字符\n\n所有未知字符都已存在於本地字典中`)
    } else {
      showStatus(`✅ 數據同步完成\n查詢成功: ${successCount} 個字符\n查詢失敗: ${failCount} 個字符\n總處理: ${totalProcessed} 個字符`)
    }
  } catch (error) {
    console.error('同步失敗:', error)
    showStatus('❌ 同步失敗：' + (error as Error).message)
  } finally {
    loading.value = false
  }
}

// 代碼操作函數
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(syncedCode.value)
    showStatus('📋 代碼已複製到剪貼板')
  } catch (error) {
    console.error('複製失敗:', error)
    showStatus('❌ 複製失敗，請手動選擇並複製')
  }
}

const selectAllCode = () => {
  const textarea = document.querySelector('.code-textarea') as HTMLTextAreaElement
  if (textarea) {
    textarea.select()
    textarea.setSelectionRange(0, 99999) // 對手機瀏覽器
    showStatus('🎯 已全選代碼內容')
  }
}

const clearCode = () => {
  syncedCode.value = ''
  showSyncedCode.value = false
  showStatus('🗑️ 已清除代碼區域')
}

// 清理已存在於本地字典的未知字符
const cleanupExisting = async () => {
  loading.value = true
  try {
    console.log('🧹 開始清理已存在於本地字典的未知字符...')

    // 取得目前的未知字符列表
    await loadUnknownCharacters()
    const unknownChars = [...unknownCharacters.value]

    if (unknownChars.length === 0) {
      showStatus('⚠️ 沒有未知字符需要清理')
      return
    }

    // 取得本地字典資料
    const localDictionary = await exportDictionary()
    const localChars = new Set(localDictionary.map(char => char.character))
    console.log(`📚 本地字典共有 ${localChars.size} 個字符`)

    // 找出需要清理的字符
    const toCleanup = unknownChars.filter(char => localChars.has(char))
    console.log(`🔍 找到 ${toCleanup.length} 個需要清理的字符:`, toCleanup)

    if (toCleanup.length === 0) {
      showStatus('✅ 沒有需要清理的字符，所有未知字符都不在本地字典中')
      return
    }

    let cleanedCount = 0

    // 標記已存在的字符為已解決
    for (const char of toCleanup) {
      try {
        await DictionaryService.markUnknownCharacterResolved(char)
        cleanedCount++
        console.log(`✅ 已清理字符: ${char}`)
      } catch (error) {
        console.error(`❌ 清理字符 "${char}" 失敗:`, error)
      }
    }

    // 重新載入數據
    await loadStats()
    await loadUnknownCharacters()

    showStatus(`✅ 清理完成\n已清理: ${cleanedCount} 個字符\n剩餘未知字符: ${unknownCharacters.value.length} 個`, false)

  } catch (error) {
    console.error('清理失敗:', error)
    showStatus('❌ 清理失敗：' + (error as Error).message)
  } finally {
    loading.value = false
  }
}


onMounted(async () => {
  console.log('🔍 Supabase 狀態檢查:', {
    supabase: !!supabase,
    supabaseEnabled: supabaseEnabled.value,
    isLocalhost: isLocalhost.value,
    hostname: location.hostname,
    env: {
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      url: import.meta.env.VITE_SUPABASE_URL
    }
  })

  await loadStats()
  await loadUnknownCharacters()
})
</script>

<style scoped>
.dictionary-admin {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

/* 狀態消息 */
.status-message {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.status-message.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.status-message.info {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
}

.status-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 15px 20px;
}

.status-text {
  flex: 1;
  white-space: pre-line;
  line-height: 1.5;
}

.status-message.success .status-text {
  color: #155724;
}

.status-message.error .status-text {
  color: #721c24;
}

.status-message.info .status-text {
  color: #0c5460;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0;
  margin-left: 15px;
  line-height: 1;
}

.close-btn:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #5a6268;
}

.page-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0;
}

/* 同步代碼區域 */
.synced-code-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.synced-code-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.code-instructions {
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #17a2b8;
}

.code-instructions p {
  margin: 0;
  color: #666;
}

.code-instructions code {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.code-container {
  position: relative;
}

.code-textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  background: #2d3748;
  color: #e2e8f0;
  resize: vertical;
  margin-bottom: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.copy-btn, .select-btn, .clear-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.copy-btn {
  background: #4CAF50;
  color: white;
}

.copy-btn:hover {
  background: #45a049;
}

.select-btn {
  background: #17a2b8;
  color: white;
}

.select-btn:hover {
  background: #138496;
}

.clear-btn {
  background: #6c757d;
  color: white;
}

.clear-btn:hover {
  background: #5a6268;
}

.admin-content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-section {
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-item .label {
  color: #666;
}

.stat-item .value {
  font-weight: bold;
  color: #2c3e50;
}

.stat-item .value.supabase {
  color: #4CAF50;
}

.stat-item .value.local {
  color: #ff9800;
}

.config-notice {
  margin-bottom: 30px;
}

.notice-card {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 20px;
  border-radius: 10px;
}

.notice-card h3 {
  margin: 0 0 15px 0;
  color: #856404;
}

.notice-card p {
  margin-bottom: 15px;
  color: #856404;
}

.notice-card ol {
  margin: 0;
  padding-left: 20px;
  color: #856404;
}

.notice-card code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.header-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
}

.refresh-btn {
  padding: 8px 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #138496;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.unknown-section {
  margin-bottom: 30px;
}

.empty-message {
  text-align: center;
  color: #666;
  padding: 40px;
  background: white;
  border-radius: 10px;
}

.unknown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
}

.unknown-char-card {
  background: white;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.unknown-char-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.char-display {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.char-status {
  font-size: 0.8rem;
  color: #e74c3c;
  background: #ffeaa7;
  padding: 2px 8px;
  border-radius: 4px;
}

.edit-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.edit-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.edit-form {
  display: grid;
  gap: 15px;
}

.form-group {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 15px;
}

.form-group label {
  font-weight: bold;
  color: #2c3e50;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #45a049;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.actions-section {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.export {
  background: #17a2b8;
  color: white;
}

.action-btn.export:hover:not(:disabled) {
  background: #138496;
}

.action-btn.clear {
  background: #dc3545;
  color: white;
}

.action-btn.clear:hover:not(:disabled) {
  background: #c82333;
}

.action-btn.sync {
  background: #28a745;
  color: white;
}

.action-btn.sync:hover:not(:disabled) {
  background: #218838;
}

.action-btn.cleanup {
  background: #6f42c1;
  color: white;
}

.action-btn.cleanup:hover:not(:disabled) {
  background: #5a32a3;
}

@media (max-width: 768px) {
  .unknown-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .form-group {
    grid-template-columns: 1fr;
  }

  .actions-section {
    flex-direction: column;
  }
}

/* 文章檢查功能樣式 */
.article-check-section {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.article-check-section h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.article-check-section p {
  color: #6c757d;
  margin: 0 0 20px 0;
  font-size: 0.9rem;
}

.article-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.article-textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.article-actions {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.action-btn.check {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.action-btn.check:hover:not(:disabled) {
  transform: translateY(-2px);
}

.action-btn.add-all {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.action-btn.add-all:hover:not(:disabled) {
  transform: translateY(-2px);
}

.check-result {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}

.result-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.stat-item {
  padding: 8px 12px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.missing-chars h4 {
  color: #e74c3c;
  margin: 0 0 10px 0;
  font-size: 1rem;
}

.missing-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.missing-char {
  display: inline-block;
  padding: 6px 10px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #e53e3e;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.missing-char:hover {
  background: #fed7d7;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .article-actions {
    flex-direction: column;
  }

  .result-stats {
    flex-direction: column;
    gap: 10px;
  }

  .missing-list {
    gap: 6px;
  }
}
</style>