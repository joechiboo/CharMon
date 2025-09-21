<template>
  <div class="dictionary-admin">
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        ← 返回
      </button>
      <h1>字典管理後台</h1>
    </div>

    <div class="admin-content">
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
  type CharacterInfo
} from '@/utils/dictionaryV2'
import { MoedictService } from '@/services/moedictService'

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

// 計算屬性
const supabaseEnabled = computed(() => isSupabaseEnabled())
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
    alert('字典管理功能需要 Supabase 配置')
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
      alert(`成功保存字符：${editForm.value.character}`)

      // 從未知列表中移除
      unknownCharacters.value = unknownCharacters.value.filter(char => char !== editingChar.value)

      // 重新載入統計
      await loadStats()

      cancelEdit()
    } else {
      alert('保存失敗，請檢查網絡連接或數據庫配置')
    }
  } catch (error) {
    console.error('保存字符失敗:', error)
    alert('保存失敗：' + (error as Error).message)
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
    alert('檢查失敗：' + (error as Error).message)
  } finally {
    checking.value = false
  }
}

const addMissingChars = async () => {
  if (!isSupabaseEnabled()) {
    alert('批量新增功能需要 Supabase 配置')
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
      alert(`成功新增 ${successCount} 個字符到字典！\n這些字符使用預設值，請後續手動修改正確的筆劃、部首和注音。`)

      // 清空檢查結果
      checkResult.value = null
      missingChars.value = []
      articleText.value = ''
    } else {
      alert('沒有字符被新增，請檢查字符是否已存在')
    }
  } catch (error) {
    console.error('批量新增失敗:', error)
    alert('批量新增失敗：' + (error as Error).message)
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
      alert('沒有需要同步的字符')
      return
    }

    let successCount = 0
    let failCount = 0
    const newCharacters: { [key: string]: CharacterInfo } = {}

    // 使用萌典 API 批量取得字符資料
    for (const char of charactersToSync) {
      try {
        console.log(`🔍 同步字符: ${char}`)

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
              '糸': 'ㄇㄧˋ', '禾': 'ㄏㄜˊ', '王': 'ㄨㄤˊ'
            }
            if (radicalZhuyinMap[radical]) {
              radicalZhuyin = radicalZhuyinMap[radical]
            }
          }

          const characterInfo: CharacterInfo = {
            character: char,
            strokeCount: moedictResult.stroke_count || 10,
            radical: moedictResult.radical || '？',
            radicalZhuyin: radicalZhuyin,
            zhuyin: moedictResult.heteronyms?.[0]?.b || moedictResult.heteronyms?.[0]?.bopomofo || 'ㄅㄆㄇ'
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

      alert(`同步成功取得 ${successCount} 個字符資料！\n\n請將以下程式碼添加到 fallbackDictionary 物件中：\n\n${codeToAdd}\n\n詳細程式碼已輸出到開發者工具控制台。`)
    }

    // 重新載入數據
    await loadStats()
    await loadUnknownCharacters()

    if (Object.keys(newCharacters).length > 0) {
      alert(`數據同步完成\n成功: ${successCount} 個字符\n失敗: ${failCount} 個字符\n\n字符資料已準備好寫入源碼檔案`)
    } else {
      alert(`數據同步完成\n成功: ${successCount} 個字符\n失敗: ${failCount} 個字符`)
    }
  } catch (error) {
    console.error('同步失敗:', error)
    alert('同步失敗：' + (error as Error).message)
  } finally {
    loading.value = false
  }
}


onMounted(async () => {
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