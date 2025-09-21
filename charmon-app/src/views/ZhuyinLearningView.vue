<template>
  <div class="zhuyin-learning">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>注音符號學習</h1>
      <div class="progress-info">
        <span>進度：{{ learnedCount }}/{{ totalZhuyinCount }}</span>
      </div>
    </header>

    <div class="learning-content">
      <!-- 注音符号分类选择 -->
      <div class="zhuyin-categories">
        <div class="category-tabs">
          <button
            v-for="category in zhuyinCategories"
            :key="category.key"
            :class="['category-tab', { active: selectedCategory === category.key }]"
            @click="selectCategory(category.key)"
          >
            {{ category.name }}
            <span class="category-count">({{ category.symbols.length }})</span>
          </button>
        </div>
      </div>

      <!-- 注音符号网格 -->
      <div class="zhuyin-grid">
        <div
          v-for="symbol in currentCategorySymbols"
          :key="symbol.symbol"
          class="zhuyin-card"
          :class="{
            active: selectedSymbol === symbol.symbol,
            learned: learnedSymbols.includes(symbol.symbol)
          }"
          @click="selectSymbol(symbol)"
        >
          <div class="symbol-large">{{ symbol.symbol }}</div>
          <div class="symbol-pinyin">{{ symbol.pinyin }}</div>
          <div class="symbol-example">{{ symbol.example }}</div>
          <div v-if="learnedSymbols.includes(symbol.symbol)" class="learned-badge">✓</div>
        </div>
      </div>

      <!-- 学习面板 -->
      <div v-if="selectedSymbolData" class="learning-panel">
        <div class="symbol-detail">
          <div class="detail-header">
            <h3>{{ selectedSymbolData.symbol }} - {{ selectedSymbolData.name }}</h3>
            <div class="symbol-type">{{ selectedSymbolData.type }}</div>
          </div>

          <div class="detail-content">
            <div class="symbol-display">
              <div class="symbol-huge">{{ selectedSymbolData.symbol }}</div>
              <div class="symbol-info">
                <div class="info-item">
                  <span class="label">發音：</span>
                  <span class="value">{{ selectedSymbolData.pinyin }}</span>
                  <button @click="playSymbolAudio" class="audio-btn">🔊</button>
                </div>
                <div class="info-item">
                  <span class="label">例字：</span>
                  <span class="value">{{ selectedSymbolData.example }}</span>
                </div>
                <div class="info-item">
                  <span class="label">筆畫：</span>
                  <span class="value">{{ selectedSymbolData.strokes }} 畫</span>
                </div>
              </div>
            </div>

            <!-- 练习区域 -->
            <div class="practice-area">
              <div class="practice-header">
                <h4>描寫練習</h4>
                <div class="practice-controls">
                  <button @click="clearPracticeCanvas" class="control-btn">清除</button>
                  <button @click="showGuideLine" class="control-btn">{{ showGuide ? '隱藏' : '顯示' }}輔助線</button>
                </div>
              </div>

              <div class="practice-canvas-container">
                <div v-if="showGuide" class="guide-symbol">{{ selectedSymbolData.symbol }}</div>
                <canvas ref="practiceCanvasRef" width="200" height="200" class="practice-canvas"></canvas>
              </div>
            </div>
          </div>

          <div class="learning-actions">
            <button @click="playSymbolAudio" class="action-btn primary">
              🔊 聽發音
            </button>
            <button @click="practiceWriting" class="action-btn secondary">
              ✍️ 練習書寫
            </button>
            <button @click="markAsLearned" class="action-btn success" :disabled="learnedSymbols.includes(selectedSymbolData.symbol)">
              {{ learnedSymbols.includes(selectedSymbolData.symbol) ? '✓ 已學會' : '✓ 學會了' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 游戏模式 -->
      <div v-if="showGameMode" class="game-mode">
        <div class="game-header">
          <h3>🎮 注音符號小遊戲</h3>
          <button @click="closeGameMode" class="close-btn">✕</button>
        </div>

        <div v-if="currentGame === 'recognition'" class="recognition-game">
          <div class="game-question">
            <h4>這個注音符號怎麼唸？</h4>
            <div class="question-symbol">{{ gameSymbol }}</div>
          </div>

          <div class="game-options">
            <button
              v-for="option in gameOptions"
              :key="option"
              @click="checkAnswer(option)"
              class="option-btn"
              :class="{
                correct: gameAnswered && option === correctAnswer,
                wrong: gameAnswered && option === selectedAnswer && option !== correctAnswer
              }"
            >
              {{ option }}
            </button>
          </div>

          <div v-if="gameAnswered" class="game-result">
            <div v-if="isCorrect" class="correct-message">✓ 答對了！</div>
            <div v-else class="wrong-message">✗ 答錯了，正確答案是：{{ correctAnswer }}</div>
            <button @click="nextQuestion" class="next-btn">下一題</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动操作按钮 -->
    <div class="floating-actions">
      <button @click="startGame" class="fab game-fab" title="開始遊戲">
        🎮
      </button>
      <button @click="reviewAll" class="fab review-fab" title="複習全部">
        📚
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 注音符号数据
interface ZhuyinSymbol {
  symbol: string
  pinyin: string
  name: string
  type: string
  example: string
  strokes: number
}

// 注音符号分类数据
const zhuyinCategories = [
  {
    key: 'consonants',
    name: '聲母',
    symbols: [
      { symbol: 'ㄅ', pinyin: 'b', name: '玻', type: '雙唇塞音', example: '爸爸', strokes: 2 },
      { symbol: 'ㄆ', pinyin: 'p', name: '坡', type: '雙唇塞音', example: '婆婆', strokes: 2 },
      { symbol: 'ㄇ', pinyin: 'm', name: '摸', type: '雙唇鼻音', example: '媽媽', strokes: 2 },
      { symbol: 'ㄈ', pinyin: 'f', name: '佛', type: '唇齒擦音', example: '飛飛', strokes: 2 },
      { symbol: 'ㄉ', pinyin: 'd', name: '得', type: '舌尖塞音', example: '弟弟', strokes: 2 },
      { symbol: 'ㄊ', pinyin: 't', name: '特', type: '舌尖塞音', example: '太太', strokes: 2 },
      { symbol: 'ㄋ', pinyin: 'n', name: '訥', type: '舌尖鼻音', example: '你你', strokes: 2 },
      { symbol: 'ㄌ', pinyin: 'l', name: '勒', type: '舌尖邊音', example: '拉拉', strokes: 2 },
      { symbol: 'ㄍ', pinyin: 'g', name: '哥', type: '舌根塞音', example: '哥哥', strokes: 2 },
      { symbol: 'ㄎ', pinyin: 'k', name: '科', type: '舌根塞音', example: '可可', strokes: 3 },
      { symbol: 'ㄏ', pinyin: 'h', name: '喝', type: '舌根擦音', example: '好好', strokes: 2 },
      { symbol: 'ㄐ', pinyin: 'j', name: '基', type: '舌面塞擦音', example: '雞雞', strokes: 3 },
      { symbol: 'ㄑ', pinyin: 'q', name: '欺', type: '舌面塞擦音', example: '七七', strokes: 3 },
      { symbol: 'ㄒ', pinyin: 'x', name: '希', type: '舌面擦音', example: '西西', strokes: 3 },
      { symbol: 'ㄓ', pinyin: 'zh', name: '知', type: '舌尖後塞擦音', example: '豬豬', strokes: 2 },
      { symbol: 'ㄔ', pinyin: 'ch', name: '蚩', type: '舌尖後塞擦音', example: '吃吃', strokes: 2 },
      { symbol: 'ㄕ', pinyin: 'sh', name: '詩', type: '舌尖後擦音', example: '十十', strokes: 2 },
      { symbol: 'ㄖ', pinyin: 'r', name: '日', type: '舌尖後擦音', example: '人人', strokes: 2 },
      { symbol: 'ㄗ', pinyin: 'z', name: '資', type: '舌尖前塞擦音', example: '字字', strokes: 2 },
      { symbol: 'ㄘ', pinyin: 'c', name: '雌', type: '舌尖前塞擦音', example: '次次', strokes: 2 },
      { symbol: 'ㄙ', pinyin: 's', name: '思', type: '舌尖前擦音', example: '四四', strokes: 2 }
    ]
  },
  {
    key: 'vowels',
    name: '韻母',
    symbols: [
      { symbol: 'ㄧ', pinyin: 'i', name: '衣', type: '高前不圓唇母音', example: '一一', strokes: 1 },
      { symbol: 'ㄨ', pinyin: 'u', name: '烏', type: '高後圓唇母音', example: '五五', strokes: 2 },
      { symbol: 'ㄩ', pinyin: 'ü', name: '迂', type: '高前圓唇母音', example: '魚魚', strokes: 2 },
      { symbol: 'ㄚ', pinyin: 'a', name: '阿', type: '低央母音', example: '啊啊', strokes: 2 },
      { symbol: 'ㄛ', pinyin: 'o', name: '喔', type: '中後圓唇母音', example: '哦哦', strokes: 2 },
      { symbol: 'ㄜ', pinyin: 'e', name: '額', type: '中央母音', example: '餓餓', strokes: 2 },
      { symbol: 'ㄝ', pinyin: 'ê', name: '欸', type: '中前不圓唇母音', example: '欸欸', strokes: 2 },
      { symbol: 'ㄞ', pinyin: 'ai', name: '哀', type: '複合韻母', example: '愛愛', strokes: 3 },
      { symbol: 'ㄟ', pinyin: 'ei', name: '欸', type: '複合韻母', example: '欸欸', strokes: 3 },
      { symbol: 'ㄠ', pinyin: 'ao', name: '熬', type: '複合韻母', example: '熬熬', strokes: 3 },
      { symbol: 'ㄡ', pinyin: 'ou', name: '歐', type: '複合韻母', example: '歐歐', strokes: 3 },
      { symbol: 'ㄢ', pinyin: 'an', name: '安', type: '鼻韻母', example: '安安', strokes: 3 },
      { symbol: 'ㄣ', pinyin: 'en', name: '恩', type: '鼻韻母', example: '恩恩', strokes: 3 },
      { symbol: 'ㄤ', pinyin: 'ang', name: '昂', type: '鼻韻母', example: '昂昂', strokes: 3 },
      { symbol: 'ㄥ', pinyin: 'eng', name: '亨', type: '鼻韻母', example: '蒸蒸', strokes: 3 },
      { symbol: 'ㄦ', pinyin: 'er', name: '兒', type: '卷舌韻母', example: '兒兒', strokes: 2 }
    ]
  },
  {
    key: 'tones',
    name: '聲調',
    symbols: [
      { symbol: 'ˉ', pinyin: '一聲', name: '陰平', type: '高平調', example: '媽媽', strokes: 1 },
      { symbol: 'ˊ', pinyin: '二聲', name: '陽平', type: '高升調', example: '麻麻', strokes: 1 },
      { symbol: 'ˇ', pinyin: '三聲', name: '上聲', type: '降升調', example: '馬馬', strokes: 1 },
      { symbol: 'ˋ', pinyin: '四聲', name: '去聲', type: '高降調', example: '罵罵', strokes: 1 },
      { symbol: '˙', pinyin: '輕聲', name: '輕聲', type: '短輕調', example: '嗎嗎', strokes: 1 }
    ]
  }
]

// 状态管理
const selectedCategory = ref('consonants')
const selectedSymbol = ref('')
const selectedSymbolData = ref<ZhuyinSymbol | null>(null)
const learnedSymbols = ref<string[]>([])
const practiceCanvasRef = ref<HTMLCanvasElement>()
const showGuide = ref(true)

// 游戏相关状态
const showGameMode = ref(false)
const currentGame = ref('recognition')
const gameSymbol = ref('')
const gameOptions = ref<string[]>([])
const correctAnswer = ref('')
const selectedAnswer = ref('')
const gameAnswered = ref(false)
const isCorrect = ref(false)
const gameScore = ref(0)
const gameQuestionCount = ref(0)

// 计算属性
const currentCategorySymbols = computed(() => {
  const category = zhuyinCategories.find(cat => cat.key === selectedCategory.value)
  return category ? category.symbols : []
})

const totalZhuyinCount = computed(() => {
  return zhuyinCategories.reduce((total, category) => total + category.symbols.length, 0)
})

const learnedCount = computed(() => {
  return learnedSymbols.value.length
})

// 方法
const selectCategory = (categoryKey: string) => {
  selectedCategory.value = categoryKey
  selectedSymbol.value = ''
  selectedSymbolData.value = null
}

const selectSymbol = (symbol: ZhuyinSymbol) => {
  selectedSymbol.value = symbol.symbol
  selectedSymbolData.value = symbol

  // 初始化画布
  initPracticeCanvas()
}

const initPracticeCanvas = () => {
  if (practiceCanvasRef.value) {
    const ctx = practiceCanvasRef.value.getContext('2d')
    if (ctx) {
      // 清除画布
      ctx.clearRect(0, 0, 200, 200)

      // 绘制网格线
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(100, 0)
      ctx.lineTo(100, 200)
      ctx.moveTo(0, 100)
      ctx.lineTo(200, 100)
      ctx.stroke()

      // 设置绘图事件
      setupCanvasDrawing()
    }
  }
}

const setupCanvasDrawing = () => {
  if (!practiceCanvasRef.value) return

  const canvas = practiceCanvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let isDrawing = false

  const startDrawing = (e: MouseEvent) => {
    isDrawing = true
    ctx.beginPath()
    const rect = canvas.getBoundingClientRect()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: MouseEvent) => {
    if (!isDrawing) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    isDrawing = false
  }

  canvas.addEventListener('mousedown', startDrawing)
  canvas.addEventListener('mousemove', draw)
  canvas.addEventListener('mouseup', stopDrawing)
  canvas.addEventListener('mouseleave', stopDrawing)
}

const clearPracticeCanvas = () => {
  initPracticeCanvas()
}

const showGuideLine = () => {
  showGuide.value = !showGuide.value
}

const playSymbolAudio = () => {
  if (selectedSymbolData.value) {
    const utterance = new SpeechSynthesisUtterance(selectedSymbolData.value.pinyin)
    utterance.lang = 'zh-TW'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

const practiceWriting = () => {
  // 清除画布并显示引导
  clearPracticeCanvas()
  showGuide.value = true
}

const markAsLearned = () => {
  if (selectedSymbolData.value && !learnedSymbols.value.includes(selectedSymbolData.value.symbol)) {
    learnedSymbols.value.push(selectedSymbolData.value.symbol)
    userStore.addPoints(5, `學會注音符號 ${selectedSymbolData.value.symbol}`)

    // 保存到本地存储
    localStorage.setItem('learnedZhuyinSymbols', JSON.stringify(learnedSymbols.value))
  }
}

// 游戏相关方法
const startGame = () => {
  showGameMode.value = true
  currentGame.value = 'recognition'
  gameScore.value = 0
  gameQuestionCount.value = 0
  generateQuestion()
}

const closeGameMode = () => {
  showGameMode.value = false
}

const generateQuestion = () => {
  // 随机选择一个已学习的符号，如果没有则从所有符号中选择
  const availableSymbols = learnedSymbols.value.length > 0
    ? currentCategorySymbols.value.filter(s => learnedSymbols.value.includes(s.symbol))
    : currentCategorySymbols.value

  if (availableSymbols.length === 0) return

  const randomSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)]
  gameSymbol.value = randomSymbol.symbol
  correctAnswer.value = randomSymbol.pinyin

  // 生成选项（包括正确答案和3个错误答案）
  const wrongOptions = currentCategorySymbols.value
    .filter(s => s.pinyin !== correctAnswer.value)
    .map(s => s.pinyin)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  gameOptions.value = [correctAnswer.value, ...wrongOptions]
    .sort(() => Math.random() - 0.5)

  gameAnswered.value = false
  selectedAnswer.value = ''
  isCorrect.value = false
}

const checkAnswer = (answer: string) => {
  if (gameAnswered.value) return

  selectedAnswer.value = answer
  gameAnswered.value = true
  isCorrect.value = answer === correctAnswer.value

  if (isCorrect.value) {
    gameScore.value++
    userStore.addPoints(2, '注音符號遊戲答對')
  }

  gameQuestionCount.value++
}

const nextQuestion = () => {
  if (gameQuestionCount.value < 10) {
    generateQuestion()
  } else {
    // 游戏结束
    alert(`游戏结束！你答对了 ${gameScore.value}/${gameQuestionCount.value} 题`)
    closeGameMode()
  }
}

const reviewAll = () => {
  // 复习所有已学符号
  if (learnedSymbols.value.length === 0) {
    alert('你还没有学习任何注音符号呢！')
    return
  }

  // 可以打开一个复习模式
  alert(`你已经学会了 ${learnedSymbols.value.length} 个注音符号：${learnedSymbols.value.join('、')}`)
}

// 生命周期
onMounted(() => {
  // 从本地存储加载已学习的符号
  const saved = localStorage.getItem('learnedZhuyinSymbols')
  if (saved) {
    learnedSymbols.value = JSON.parse(saved)
  }

  // 默认选择第一个符号
  if (currentCategorySymbols.value.length > 0) {
    selectSymbol(currentCategorySymbols.value[0])
  }
})
</script>

<style scoped>
.zhuyin-learning {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.back-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
}

.progress-info {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.learning-content {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.zhuyin-categories {
  margin-bottom: 30px;
}

.category-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.category-tab {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.category-tab.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.category-tab:hover:not(.active) {
  background: rgba(255, 255, 255, 0.2);
}

.category-count {
  font-size: 0.8em;
  opacity: 0.8;
}

.zhuyin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.zhuyin-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.zhuyin-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.zhuyin-card.active {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
}

.zhuyin-card.learned {
  border-color: #4CAF50;
}

.symbol-large {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.symbol-pinyin {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.symbol-example {
  font-size: 0.8rem;
  opacity: 0.7;
}

.learned-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.learning-panel {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.symbol-type {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 25px;
}

.symbol-display {
  display: flex;
  align-items: center;
  gap: 20px;
}

.symbol-huge {
  font-size: 4rem;
  font-weight: bold;
}

.symbol-info {
  flex: 1;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  min-width: 60px;
}

.value {
  margin-left: 10px;
  flex: 1;
}

.audio-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 10px;
  transition: transform 0.2s;
}

.audio-btn:hover {
  transform: scale(1.2);
}

.practice-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.practice-header h4 {
  margin: 0;
}

.practice-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.3s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.practice-canvas-container {
  position: relative;
  display: flex;
  justify-content: center;
}

.guide-symbol {
  position: absolute;
  font-size: 150px;
  color: rgba(255, 255, 255, 0.1);
  pointer-events: none;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.practice-canvas {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  position: relative;
  z-index: 2;
}

.learning-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.action-btn.primary {
  background: #2196F3;
  color: white;
}

.action-btn.secondary {
  background: #FF9800;
  color: white;
}

.action-btn.success {
  background: #4CAF50;
  color: white;
}

.action-btn:disabled {
  background: #999;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.floating-actions {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.game-fab {
  background: #E91E63;
  color: white;
}

.review-fab {
  background: #9C27B0;
  color: white;
}

.fab:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* 游戏模式样式 */
.game-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.recognition-game {
  background: white;
  padding: 40px;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  color: #333;
  text-align: center;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  color: #333;
}

.close-btn {
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 16px;
}

.question-symbol {
  font-size: 4rem;
  margin: 20px 0;
  color: #2196F3;
}

.game-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin: 30px 0;
}

.option-btn {
  padding: 15px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.option-btn:hover {
  border-color: #2196F3;
  background: #f5f5f5;
}

.option-btn.correct {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.option-btn.wrong {
  background: #f44336;
  color: white;
  border-color: #f44336;
}

.game-result {
  margin-top: 20px;
}

.correct-message {
  color: #4CAF50;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.wrong-message {
  color: #f44336;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.next-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.next-btn:hover {
  background: #1976D2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .learning-content {
    padding: 20px;
  }

  .detail-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .symbol-display {
    flex-direction: column;
    text-align: center;
  }

  .zhuyin-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .learning-actions {
    flex-direction: column;
  }

  .category-tabs {
    flex-direction: column;
    align-items: center;
  }
}
</style>