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
            <span class="value">本地字典 {{ isSupabaseEnabled ? '+ Supabase 未知字符追蹤' : '(純本地模式)' }}</span>
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

      <!-- 操作按鈕 -->
      <div class="actions-section">
        <button @click="exportDictionary" class="action-btn export">
          📤 匯出字典
        </button>
        <button @click="clearUnknown" class="action-btn clear">
          🗑️ 清空未知列表
        </button>
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
  isSupabaseEnabled
} from '@/utils/dictionaryV2'

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

const saveCharacter = () => {
  // 這裡只是演示，實際應該要有 API 來保存到後端
  alert(`保存字符：${editForm.value.character}\n筆劃：${editForm.value.strokeCount}\n部首：${editForm.value.radical}\n注音：${editForm.value.zhuyin}`)

  // 從未知列表中移除
  unknownCharacters.value = unknownCharacters.value.filter(char => char !== editingChar.value)
  cancelEdit()
}

const exportDictionary = () => {
  // 這裡暫時只是演示，實際應該從後端 API 獲取完整字典數據
  alert('字典匯出功能將在後端 API 完成後實現')
}

const clearUnknown = () => {
  if (confirm('確定要清空未知字符列表嗎？')) {
    clearUnknownCharacters()
    unknownCharacters.value = []
  }
}

onMounted(async () => {
  await Promise.all([
    loadDictionaryStats(),
    loadUnknownCharacters()
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