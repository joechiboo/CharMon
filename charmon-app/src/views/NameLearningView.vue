<template>
  <div class="name-learning">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>學習我的名字</h1>
    </header>

    <div class="learning-content">
      <div class="name-display">
        <h2>{{ userStore.currentUser?.name }}</h2>
        <div class="name-characters">
          <div
            v-for="(char, index) in nameCharacters"
            :key="index"
            class="character-box"
            :class="{ active: selectedCharIndex === index }"
            @click="selectCharacter(index)"
          >
            <div class="character">{{ char }}</div>
            <div class="pinyin">{{ getPinyin(char) }}</div>
          </div>
        </div>
      </div>

      <div v-if="selectedCharIndex !== null" class="character-details">
        <div class="stroke-practice">
          <h3>筆劃練習</h3>
          <div class="stroke-canvas">
            <canvas ref="canvasRef" width="300" height="300"></canvas>
          </div>
          <div class="stroke-controls">
            <button @click="clearCanvas">清除</button>
            <button @click="showStrokeOrder">查看筆順</button>
          </div>
        </div>

        <div class="character-info">
          <h3>字的資訊</h3>
          <div class="info-item">
            <span class="label">筆劃數：</span>
            <span class="value">{{ getStrokeCount(nameCharacters[selectedCharIndex]) }} 劃</span>
          </div>
          <div class="info-item">
            <span class="label">拼音：</span>
            <span class="value">{{ getPinyin(nameCharacters[selectedCharIndex]) }}</span>
          </div>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const selectedCharIndex = ref<number | null>(0)
const canvasRef = ref<HTMLCanvasElement>()

const nameCharacters = computed(() => {
  return userStore.currentUser?.name.split('') || []
})

const selectCharacter = (index: number) => {
  selectedCharIndex.value = index
  clearCanvas()
}

const getPinyin = (char: string) => {
  const pinyinMap: { [key: string]: string } = {
    '王': 'wáng',
    '李': 'lǐ',
    '張': 'zhāng',
    '小': 'xiǎo',
    '明': 'míng',
    '華': 'huá'
  }
  return pinyinMap[char] || 'pīn yīn'
}

const getStrokeCount = (char: string) => {
  const strokeMap: { [key: string]: number } = {
    '王': 4,
    '李': 7,
    '張': 11,
    '小': 3,
    '明': 8,
    '華': 12
  }
  return strokeMap[char] || 10
}

const clearCanvas = () => {
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

const showStrokeOrder = () => {
  console.log('顯示筆順動畫')
}

const playAudio = () => {
  const utterance = new SpeechSynthesisUtterance(userStore.currentUser?.name || '')
  utterance.lang = 'zh-TW'
  utterance.rate = 0.8
  speechSynthesis.speak(utterance)
}

const generateWorksheet = () => {
  router.push('/worksheets')
}

const completeLesson = () => {
  userStore.addPoints(10, '完成姓名學習')
  router.push('/dashboard')
}

onMounted(() => {
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
  gap: 20px;
  margin-bottom: 30px;
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
}

.learning-content {
  max-width: 1000px;
  margin: 0 auto;
}

.name-display {
  background: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.name-display h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
}

.name-characters {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.character-box {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.character-box:hover {
  background: #e8ebef;
}

.character-box.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.character-box .character {
  font-size: 3rem;
  margin-bottom: 10px;
}

.character-box .pinyin {
  font-size: 1rem;
  opacity: 0.8;
}

.character-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.stroke-practice,
.character-info {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stroke-practice h3,
.character-info h3 {
  color: #333;
  margin-bottom: 20px;
}

.stroke-canvas {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  margin-bottom: 15px;
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
  margin-bottom: 15px;
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
  gap: 20px;
  margin-top: 30px;
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