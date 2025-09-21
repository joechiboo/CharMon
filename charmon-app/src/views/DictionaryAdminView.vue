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
            <span class="value">{{ dictionaryStats.totalCharacters }} 個</span>
          </div>
          <div class="stat-item">
            <span class="label">含部首注音：</span>
            <span class="value">{{ dictionaryStats.charactersWithRadicalZhuyin }} 個</span>
          </div>
          <div class="stat-item">
            <span class="label">未知字符：</span>
            <span class="value">{{ dictionaryStats.unknownCount }} 個</span>
          </div>
          <div class="stat-item">
            <span class="label">數據源：</span>
            <span class="value">本地字典 {{ isSupabaseEnabled() ? '+ Supabase 未知字符追蹤' : '(純本地模式)' }}</span>
          </div>
          <div class="stat-item" v-if="isSupabaseEnabled()">
            <span class="label">會話記錄狀態：</span>
            <span class="value">{{ sessionStatus.recorded }}/{{ sessionStatus.max }} (剩餘 {{ sessionStatus.remaining }})</span>
          </div>
        </div>
      </div>

      <!-- 未知字符列表 -->
      <div class="unknown-section">
        <h2>待新增字符</h2>
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
            <button type="submit" class="save-btn">保存</button>
            <button type="button" @click="cancelEdit" class="cancel-btn">取消</button>
          </div>
        </form>
      </div>

      <!-- 同步操作區 -->
      <div class="sync-section">
        <h2>數據同步工具</h2>
        <div class="sync-actions">
          <button @click="exportLocalDictionary" class="action-btn export">
            📤 匯出本地字典
          </button>
          <button @click="generateDictionaryJson" class="action-btn generate" :disabled="isGenerating">
            {{ isGenerating ? '⏳ 查詢中...' : '🔧 生成字典 JSON' }}
          </button>
          <button @click="clearUnknown" class="action-btn clear">
            🗑️ 清空未知列表
          </button>
        </div>
      </div>

      <!-- 查詢進度顯示 -->
      <div v-if="isGenerating" class="progress-section">
        <h2>🔍 查詢進度</h2>
        <div class="progress-info">
          <div class="progress-text">
            正在查詢萌典 API... {{ queryProgress.current }}/{{ queryProgress.total }}
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div v-if="queryProgress.currentChar" class="current-char">
            當前查詢: <strong>{{ queryProgress.currentChar }}</strong>
          </div>
        </div>
        <div class="query-log">
          <textarea
            v-model="queryLog"
            readonly
            placeholder="查詢日誌將顯示在這裡..."
            rows="8"
          ></textarea>
        </div>
      </div>

      <!-- 字典 JSON 生成結果 -->
      <div v-if="generatedJson && !isGenerating" class="result-section">
        <h2>📄 生成的字典 JSON</h2>
        <div class="result-info">
          <p>從萌典 API 查詢完成！請複製以下 JSON 並更新到 <code>dictionaryV2.ts</code> 的 <code>fallbackDictionary</code> 物件中：</p>
          <div v-if="generationStats" class="generation-stats">
            <span class="stat-item success">✅ 成功: {{ generationStats.success }}</span>
            <span class="stat-item failed">❌ 失敗: {{ generationStats.failed }}</span>
            <span class="stat-item total">📊 總計: {{ generationStats.total }}</span>
          </div>
        </div>
        <div class="json-container">
          <textarea
            v-model="generatedJson"
            readonly
            placeholder="生成的 JSON 將顯示在這裡..."
            rows="20"
            class="json-textarea"
          ></textarea>
          <div class="action-buttons">
            <button @click="copyToClipboard" class="copy-btn">📋 複製 JSON</button>
            <button @click="selectAllText" class="select-btn">🎯 全選</button>
            <button @click="clearResults" class="clear-btn">🗑️ 清除結果</button>
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
  clearUnknownCharacters,
  getDictionaryStats,
  isSupabaseEnabled,
  getSessionStatus,
  exportDictionary
} from '@/utils/dictionaryV2'
import { DictionaryService } from '@/services/dictionaryService'
import { MoedictService } from '@/services/moedictService'

const router = useRouter()

// 數據
const unknownCharacters = ref<string[]>([])
const editingChar = ref<string | null>(null)
const editForm = ref({
  character: '',
  strokeCount: 1,
  radical: '',
  radicalZhuyin: '',
  zhuyin: ''
})

// 響應式數據
const dictionaryStats = ref({ totalCharacters: 0, charactersWithRadicalZhuyin: 0, unknownCount: 0 })
const sessionStatus = ref({ recorded: 0, max: 3, remaining: 3 })
const generatedJson = ref<string>('')
const isGenerating = ref(false)
const generationStats = ref<{ success: number; failed: number; total: number } | null>(null)
const queryProgress = ref({ current: 0, total: 0, currentChar: '' })
const queryLog = ref<string>('')
const statusMessage = ref<string>('')
const showStatusMessage = ref(false)

// 計算進度百分比
const progressPercentage = computed(() => {
  if (queryProgress.value.total === 0) return 0
  return Math.round((queryProgress.value.current / queryProgress.value.total) * 100)
})

// 計算屬性 - 已移除，直接使用 dictionaryStats

// 方法
const goBack = () => {
  router.push('/dashboard')
}

const loadDictionaryStats = async () => {
  try {
    const stats = await getDictionaryStats()
    dictionaryStats.value = {
      totalCharacters: stats.totalCharacters,
      charactersWithRadicalZhuyin: stats.charactersWithRadicalZhuyin,
      unknownCount: stats.unknownCount || 0
    }
  } catch (error) {
    console.error('載入字典統計失敗:', error)
  }
}

const loadUnknownCharacters = async () => {
  try {
    unknownCharacters.value = await getUnknownCharacters()
  } catch (error) {
    console.error('載入未知字符失敗:', error)
  }
}

const selectCharForEdit = (char: string) => {
  editingChar.value = char
  editForm.value = {
    character: char,
    strokeCount: 1,
    radical: '',
    radicalZhuyin: '',
    zhuyin: ''
  }
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
  try {
    const characterInfo = {
      character: editForm.value.character,
      strokeCount: editForm.value.strokeCount,
      radical: editForm.value.radical,
      radicalZhuyin: editForm.value.radicalZhuyin || undefined,
      zhuyin: editForm.value.zhuyin
    }

    // 顯示字符信息供手動添加到本地字典
    const characterData = `${characterInfo.character},${characterInfo.strokeCount},${characterInfo.radical},${characterInfo.radicalZhuyin || ''},${characterInfo.zhuyin}`

    showStatus(`✅ 字符信息已準備完成！\n請將此行添加到本地字典 CSV 文件中：\n${characterData}`)

    // 標記未知字符為已解決
    await DictionaryService.addCharacter(characterInfo)

    // 從未知列表中移除
    unknownCharacters.value = unknownCharacters.value.filter(char => char !== editingChar.value)
    // 重新載入統計數據
    await loadDictionaryStats()
    cancelEdit()
  } catch (error) {
    console.error('處理字符時發生錯誤:', error)
    showStatus('❌ 處理字符時發生錯誤，請稍後重試')
  }
}

const exportLocalDictionary = async () => {
  try {
    const data = await exportDictionary()

    if (data.length === 0) {
      showStatus('⚠️ 本地字典數據為空，無法匯出')
      return
    }

    // 轉換為 CSV 格式
    const csvHeader = 'character,strokeCount,radical,radicalZhuyin,zhuyin\n'
    const csvContent = data.map(char =>
      `${char.character},${char.strokeCount},${char.radical},${char.radicalZhuyin || ''},${char.zhuyin}`
    ).join('\n')

    const csvData = csvHeader + csvContent

    // 創建下載鏈接
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `local_dictionary_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showStatus(`✅ 成功匯出本地字典 ${data.length} 個字符`)
  } catch (error) {
    console.error('匯出本地字典失敗:', error)
    showStatus('❌ 匯出本地字典失敗，請稍後重試')
  }
}

const clearUnknown = () => {
  if (confirm('確定要清空未知字符列表嗎？')) {
    clearUnknownCharacters()
    unknownCharacters.value = []
    showStatus('✅ 已清空未知字符列表')
  }
}

// 添加日誌到 textarea
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  queryLog.value += `[${timestamp}] ${message}\n`
}

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

// 生成字典 JSON（自動調用萌典 API）
const generateDictionaryJson = async () => {
  try {
    isGenerating.value = true
    generationStats.value = null
    generatedJson.value = ''
    queryLog.value = ''

    // 取得所有未知字符
    const unknowns = await getUnknownCharacters()

    if (unknowns.length === 0) {
      addLog('❌ 沒有未知字符需要處理')
      isGenerating.value = false
      return
    }

    // 初始化進度
    queryProgress.value = {
      current: 0,
      total: unknowns.length,
      currentChar: ''
    }

    addLog(`🎯 開始查詢 ${unknowns.length} 個未知字符...`)
    addLog(`📋 字符列表: ${unknowns.join(', ')}`)

    const results: Record<string, unknown> = {}
    let successCount = 0
    let failedCount = 0

    // 依序查詢每個字符
    for (let i = 0; i < unknowns.length; i++) {
      const char = unknowns[i]
      queryProgress.value.current = i + 1
      queryProgress.value.currentChar = char

      addLog(`🔍 查詢字符 ${i + 1}/${unknowns.length}: ${char}`)

      try {
        const info = await MoedictService.getCharacterInfo(char)

        if (info) {
          results[char] = {
            character: info.title,
            strokeCount: info.stroke_count || 0,
            radical: info.radical || '',
            radicalZhuyin: '',
            zhuyin: info.heteronyms?.[0]?.bopomofo || ''
          }
          successCount++
          addLog(`✅ 成功: ${char} - 筆劃:${info.stroke_count} 部首:${info.radical} 注音:${info.heteronyms?.[0]?.bopomofo}`)
        } else {
          // 萌典查不到，使用預設值
          results[char] = {
            character: char,
            strokeCount: 0,
            radical: '',
            radicalZhuyin: '',
            zhuyin: ''
          }
          failedCount++
          addLog(`❌ 失敗: ${char} - 萌典查無此字`)
        }
      } catch (error) {
        // 查詢失敗，使用預設值
        results[char] = {
          character: char,
          strokeCount: 0,
          radical: '',
          radicalZhuyin: '',
          zhuyin: ''
        }
        failedCount++
        addLog(`❌ 錯誤: ${char} - ${error}`)
      }

      // 每查詢一個字符後短暫延遲，避免 API 過載
      if (i < unknowns.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    // 生成 JSON 格式
    const jsonOutput = JSON.stringify(results, null, 2)
    generatedJson.value = jsonOutput

    // 更新統計
    generationStats.value = {
      success: successCount,
      failed: failedCount,
      total: unknowns.length
    }

    addLog(`🎉 查詢完成！成功: ${successCount} 失敗: ${failedCount} 總計: ${unknowns.length}`)
    addLog(`📄 JSON 已生成，請複製使用`)

  } catch (error) {
    addLog(`💥 系統錯誤: ${error}`)
    console.error('生成字典 JSON 失敗:', error)
  } finally {
    isGenerating.value = false
    queryProgress.value.currentChar = ''
  }
}

// 複製到剪貼板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedJson.value)
    addLog('📋 JSON 已複製到剪貼板')
  } catch (error) {
    console.error('複製失敗:', error)
    addLog('❌ 複製失敗，請手動選擇並複製')
  }
}

// 全選文字
const selectAllText = () => {
  const textarea = document.querySelector('.json-textarea') as HTMLTextAreaElement
  if (textarea) {
    textarea.select()
    textarea.setSelectionRange(0, 99999) // 對手機瀏覽器
    addLog('🎯 已全選 JSON 內容')
  }
}

// 清除結果
const clearResults = () => {
  generatedJson.value = ''
  generationStats.value = null
  queryLog.value = ''
  queryProgress.value = { current: 0, total: 0, currentChar: '' }
  addLog('🗑️ 已清除所有結果')
}

const loadSessionStatus = async () => {
  try {
    const status = await getSessionStatus()
    sessionStatus.value = status
  } catch (error) {
    console.error('載入會話狀態失敗:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    loadDictionaryStats(),
    loadUnknownCharacters(),
    loadSessionStatus()
  ])
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

.unknown-section {
  margin-bottom: 30px;
}

.unknown-section h2 {
  color: #2c3e50;
  margin-bottom: 15px;
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

.save-btn {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover {
  background: #45a049;
}

.cancel-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.cancel-btn:hover {
  background: #5a6268;
}

.sync-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.sync-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.sync-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.code-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.code-section h2 {
  margin: 0 0 15px 0;
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

/* 進度區域 */
.progress-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.progress-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.progress-info {
  margin-bottom: 20px;
}

.progress-text {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.current-char {
  font-size: 1rem;
  color: #666;
}

.query-log {
  margin-top: 15px;
}

.query-log textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  background: #f8f9fa;
  color: #2c3e50;
  resize: vertical;
}

/* 結果區域 */
.result-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.result-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.result-info {
  margin-bottom: 20px;
}

.result-info p {
  margin: 0 0 15px 0;
  color: #666;
}

.generation-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.stat-item {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  border: 1px solid #e9ecef;
}

.stat-item.success {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.stat-item.failed {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.stat-item.total {
  background: #d1ecf1;
  color: #0c5460;
  border-color: #bee5eb;
}

.json-container {
  position: relative;
}

.json-textarea {
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

.select-btn {
  padding: 8px 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.select-btn:hover {
  background: #138496;
}

.clear-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.clear-btn:hover {
  background: #5a6268;
}

.code-container {
  position: relative;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.generated-code {
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.3s;
}

.copy-btn:hover {
  background: #45a049;
}

.actions-section {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.action-btn.export {
  background: #17a2b8;
  color: white;
}

.action-btn.export:hover {
  background: #138496;
}

.action-btn.clear {
  background: #dc3545;
  color: white;
}

.action-btn.clear:hover {
  background: #c82333;
}

.action-btn.generate {
  background: #6f42c1;
  color: white;
}

.action-btn.generate:hover {
  background: #5a32a3;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn:disabled:hover {
  transform: none;
  background: inherit;
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
</style>