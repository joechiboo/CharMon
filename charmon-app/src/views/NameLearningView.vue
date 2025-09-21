<template>
  <div class="name-learning">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>學習我的名字</h1>
      <div class="name-characters">
          <div
            v-for="(char, index) in nameCharacters"
            :key="index"
            class="character-box"
            :class="{ active: selectedCharIndex === index }"
            @click="selectCharacter(index)"
          >
            <div class="character-with-zhuyin">
              <div class="character" :style="{ fontFamily: `'${selectedFont}', 'Microsoft YaHei', '微軟正黑體', sans-serif` }">{{ char }}</div>
              <div class="zhuyin-right">
                <template v-for="(part, partIndex) in getCharZhuyinParts(char)" :key="partIndex">
                  <div
                    v-if="part.type !== 'tone-mark'"
                    class="zhuyin-part"
                    :class="part.type"
                  >
                    {{ part.text }}
                    <!-- 檢查下一個是否為聲調 -->
                    <span
                      v-if="partIndex + 1 < getCharZhuyinParts(char).length && getCharZhuyinParts(char)[partIndex + 1].type === 'tone-mark'"
                      class="tone-mark"
                    >
                      {{ getCharZhuyinParts(char)[partIndex + 1].text }}
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
    </header>

    <div class="learning-content">
      <div v-if="selectedCharIndex !== null" class="character-details">
        <div class="stroke-practice">
          <div class="practice-header">
            <h3>筆劃練習</h3>
            <div class="font-selector">
              <label>字型：</label>
              <select v-model="selectedFont">
                <option value="DFKai-SB">標楷體</option>
                <option value="Microsoft YaHei">微軟正黑體</option>
                <option value="SimSun">宋體</option>
              </select>
            </div>
            <div class="practice-mode-info" v-if="needsWatermarkAssist">
              <span class="mode-text">{{ practiceModeText }}</span>
              <div class="progress-dots">
                <span
                  v-for="n in totalPracticeRounds"
                  :key="n"
                  class="dot"
                  :class="{ active: n <= currentRound }"
                ></span>
              </div>
            </div>
          </div>
          <div class="stroke-canvas-container">
            <div class="watermark-char" :class="{ hidden: !shouldShowWatermark }" :style="{ fontFamily: `'${selectedFont}', 'Microsoft YaHei', '微軟正黑體', sans-serif` }">{{ nameCharacters[selectedCharIndex] }}</div>
            <canvas ref="canvasRef" width="300" height="300"></canvas>
            <!-- <div class="canvas-zhuyin">{{ getZhuyin(nameCharacters[selectedCharIndex]) }}</div> -->
          </div>
          <div class="stroke-controls">
            <button @click="clearCanvas">{{ needsWatermarkAssist ? '下一次' : '清除' }}</button>
            <button @click="showStrokeOrder">查看筆順</button>
            <button @click="toggleWatermark" v-if="!needsWatermarkAssist">{{ showWatermark ? '隱藏' : '顯示' }}浮水印</button>
            <button @click="resetPractice" v-if="needsWatermarkAssist && currentRound > 1">重新開始</button>
          </div>
        </div>

        <div class="info-section">
          <div class="character-info">
            <h3>字的資訊</h3>
            <div class="info-item">
              <span class="label">筆劃：</span>
              <span class="value">{{ currentCharInfo.strokeCount }} 劃</span>
            </div>
            <div class="info-item">
              <span class="label">部首：</span>
              <span class="value">{{ currentCharInfo.radicalWithZhuyin }}</span>
            </div>
            <div class="info-item">
              <span class="label">注音：</span>
              <span class="value">{{ currentCharInfo.zhuyin }}</span>
            </div>
          </div>

          <div class="practice-actions">
            <button class="btn primary" @click="playAudio">
              🔊 聽發音
            </button>
            <button class="btn secondary" @click="generateWorksheet">
              📝 生成練習表
            </button>
            <button class="btn success" @click="completeLesson">
              ✓ 完成學習
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 笔顺查看器 -->
    <StrokeOrderViewer
      v-if="showStrokeViewer"
      :character="currentCharacter"
      :visible="showStrokeViewer"
      @close="closeStrokeViewer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import StrokeOrderViewer from '@/components/StrokeOrderViewer.vue'
import { getStrokeCount, getRadicalWithZhuyin, getZhuyin, getZhuyinParts, type ZhuyinPart } from '@/utils/dictionaryV2'

const router = useRouter()
const userStore = useUserStore()

const selectedCharIndex = ref<number | null>(0)
const canvasRef = ref<HTMLCanvasElement>()
const showWatermark = ref(true)
const currentRound = ref(1)
const totalPracticeRounds = 5 // 2次浮水印 + 3次空白
const selectedFont = ref('DFKai-SB') // 預設標楷體

// 笔顺查看器相关状态
const showStrokeViewer = ref(false)
const currentCharacter = computed(() => {
  if (selectedCharIndex.value !== null && nameCharacters.value[selectedCharIndex.value]) {
    return nameCharacters.value[selectedCharIndex.value]
  }
  return ''
})

// 當前字符的詳細資訊
const currentCharInfo = ref({
  strokeCount: 10,
  radicalWithZhuyin: '？',
  zhuyin: 'ㄅㄆㄇ'
})

// 所有字符的注音部件緩存
const zhuyinPartsCache = ref<Map<string, ZhuyinPart[]>>(new Map())

// 取得字符的注音部件（有緩存）
const getCharZhuyinParts = (char: string) => {
  if (zhuyinPartsCache.value.has(char)) {
    return zhuyinPartsCache.value.get(char) || []
  }
  return [] // 返回空陣列，避免模板錯誤
}

// 載入所有名字字符的注音部件
const loadAllZhuyinParts = async () => {
  for (const char of nameCharacters.value) {
    try {
      const parts = await getZhuyinParts(char)
      zhuyinPartsCache.value.set(char, parts)
    } catch (error) {
      console.error(`載入字符 ${char} 的注音部件失敗:`, error)
      zhuyinPartsCache.value.set(char, [])
    }
  }
}

// 更新當前字符資訊
const updateCurrentCharInfo = async () => {
  if (selectedCharIndex.value !== null && nameCharacters.value[selectedCharIndex.value]) {
    const char = nameCharacters.value[selectedCharIndex.value]
    try {
      console.log('🔍 NameLearning 更新字符資訊:', char)

      const [strokeCount, radicalWithZhuyin, zhuyin] = await Promise.all([
        getStrokeCount(char),
        getRadicalWithZhuyin(char),
        getZhuyin(char)
      ])

      console.log('📊 NameLearning 字符資訊結果:', { char, strokeCount, radicalWithZhuyin, zhuyin })

      currentCharInfo.value = {
        strokeCount,
        radicalWithZhuyin,
        zhuyin
      }
    } catch (error) {
      console.error('更新字符資訊失敗:', error)
      currentCharInfo.value = {
        strokeCount: 10,
        radicalWithZhuyin: '？',
        zhuyin: 'ㄅㄆㄇ'
      }
    }
  }
}

const nameCharacters = computed(() => {
  return userStore.currentUser?.name.split('') || []
})

// 根據學習階段判斷是否需要浮水印輔助
const needsWatermarkAssist = computed(() => {
  const gradeLevel = userStore.currentUser?.gradeLevel
  return gradeLevel === 'kindergarten' || gradeLevel === 'elementary-low'
})

// 當前是否應該顯示浮水印
const shouldShowWatermark = computed(() => {
  if (needsWatermarkAssist.value) {
    return currentRound.value <= 2 // 前2次顯示浮水印
  }
  return showWatermark.value
})

// 練習模式文字
const practiceModeText = computed(() => {
  if (currentRound.value <= 2) {
    return `描字練習 ${currentRound.value}/2`
  } else {
    return `獨立書寫 ${currentRound.value - 2}/3`
  }
})

const selectCharacter = async (index: number) => {
  selectedCharIndex.value = index
  currentRound.value = 1 // 重置練習回合

  // 更新字符資訊
  await updateCurrentCharInfo()

  // 直接清空並重繪，不調用 clearCanvas 避免增加回合數
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 300, 300)
      drawGrid()
    }
  }
}





const clearCanvas = () => {
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 300, 300)
      drawGrid()
    }
  }

  // 如果是輔助模式，進入下一回合
  if (needsWatermarkAssist.value && currentRound.value < totalPracticeRounds) {
    currentRound.value++
  }
}

const resetPractice = () => {
  currentRound.value = 1
  // 只清除畫布，不增加回合數
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 300, 300)
      drawGrid()
    }
  }
}

const drawGrid = () => {
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1

      ctx.beginPath()
      ctx.moveTo(150, 0)
      ctx.lineTo(150, 300)
      ctx.moveTo(0, 150)
      ctx.lineTo(300, 150)
      ctx.stroke()

      ctx.strokeStyle = '#f0f0f0'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(75, 0)
      ctx.lineTo(75, 300)
      ctx.moveTo(225, 0)
      ctx.lineTo(225, 300)
      ctx.moveTo(0, 75)
      ctx.lineTo(300, 75)
      ctx.moveTo(0, 225)
      ctx.lineTo(300, 225)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }
}

const toggleWatermark = () => {
  showWatermark.value = !showWatermark.value
}

const showStrokeOrder = () => {
  if (currentCharacter.value) {
    showStrokeViewer.value = true
  }
}

const closeStrokeViewer = () => {
  showStrokeViewer.value = false
}

const playAudio = () => {
  const utterance = new SpeechSynthesisUtterance(userStore.currentUser?.name || '')
  utterance.lang = 'zh-TW'
  utterance.rate = 0.8
  speechSynthesis.speak(utterance)
}


const generateWorksheet = () => {
  const userName = userStore.currentUser?.name
  if (userName) {
    router.push({
      path: '/worksheets',
      query: { name: userName }
    })
  } else {
    router.push('/worksheets')
  }
}

const completeLesson = () => {
  userStore.addPoints(10, '完成姓名學習')
  router.push('/dashboard')
}

onMounted(async () => {
  // 初始化所有字符的注音部件
  await loadAllZhuyinParts()

  // 初始化字符資訊
  await updateCurrentCharInfo()

  if (canvasRef.value) {
    drawGrid()

    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      let isDrawing = false

      canvasRef.value.addEventListener('mousedown', (e) => {
        isDrawing = true
        ctx.beginPath()
        ctx.moveTo(e.offsetX, e.offsetY)
      })

      canvasRef.value.addEventListener('mousemove', (e) => {
        if (isDrawing) {
          ctx.lineTo(e.offsetX, e.offsetY)
          ctx.strokeStyle = '#333'
          ctx.lineWidth = 3
          ctx.stroke()
        }
      })

      canvasRef.value.addEventListener('mouseup', () => {
        isDrawing = false
      })

      canvasRef.value.addEventListener('mouseleave', () => {
        isDrawing = false
      })
    }
  }
})
</script>

<style scoped>
.name-learning {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.back-btn {
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  color: #333;
  font-size: 2rem;
  margin: 0;
}

.learning-content {
  width: 100%;
  padding: 0 40px;
}


.name-characters {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.character-box {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid #e0e6ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.character-box:hover {
  background: #f8fafb;
  border-color: #c0c9d1;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.character-box.active {
  background: #f0f8f4;
  color: #333;
  border: 2px solid #27ae60;
}

.character-with-zhuyin {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.character-box .character {
  font-size: 3rem;
  margin: 0;
}

.zhuyin-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* 只有兩個注音部分時，往下偏移 */
.zhuyin-right:has(.zhuyin-part:nth-child(2):last-child) {
  padding-top: 8px;
}

.zhuyin-part {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.2;
  min-height: 1.2em;
  font-weight: bold;
  text-align: center;
}

.zhuyin-part.light-tone {
  font-size: 0.7rem;
  order: -1;
}

.zhuyin-part .tone-mark {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
}

.zhuyin-part {
  position: relative;
}

.character-box.active .zhuyin-part {
  opacity: 0.8;
}

.character-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.stroke-practice,
.character-info {
  background: white;
  padding: 15px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stroke-practice {
  height: 70vh;
}

.character-info {
  height: 60vh;
}

.stroke-practice h3,
.character-info h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.3rem;
}


.stroke-canvas-container {
  position: relative;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.watermark-char {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 200px;
  color: rgba(0, 0, 0, 0.05);
  font-weight: normal;
  pointer-events: none;
  z-index: 3;
  user-select: none;
  transition: opacity 0.3s ease;
}

.watermark-char.hidden {
  opacity: 0;
}

canvas {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  position: relative;
  z-index: 1;
  display: block;
}

.canvas-zhuyin {
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 16px;
  color: #27ae60;
  font-weight: bold;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #27ae60;
  z-index: 10;
  pointer-events: none;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.practice-header h3 {
  margin: 0;
}

.font-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-selector label {
  font-size: 0.9rem;
  color: #666;
}

.font-selector select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.practice-mode-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f8ff;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #4CAF50;
  min-width: 200px;
  gap: 15px;
}

.mode-text {
  font-weight: bold;
  color: #2c5282;
}

.progress-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: background 0.3s ease;
}

.dot.active {
  background: #4CAF50;
}

.stroke-controls {
  display: flex;
  gap: 10px;
}

.stroke-controls button {
  flex: 1;
  padding: 10px;
  background: #f5f7fa;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.stroke-controls button:hover {
  background: #e8ebef;
}

.info-item {
  margin-bottom: 8px;
}

.info-item .label {
  font-weight: bold;
  color: #666;
}

.info-item .value {
  color: #333;
  margin-left: 10px;
}

.practice-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 8px;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn.primary {
  background: #4fc3f7;
  color: white;
}

.btn.secondary {
  background: #ff9800;
  color: white;
}

.btn.success {
  background: #66bb6a;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
</style>