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
            <div class="zhuyin">{{ getZhuyin(char) }}</div>
          </div>
        </div>
      </div>

      <div v-if="selectedCharIndex !== null" class="character-details">
        <div class="stroke-practice">
          <h3>筆劃練習</h3>
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
          <div class="stroke-canvas-container">
            <div class="watermark-char" :class="{ hidden: !shouldShowWatermark }">{{ nameCharacters[selectedCharIndex] }}</div>
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

        <div class="character-info">
          <h3>字的資訊</h3>
          <div class="info-item">
            <span class="label">筆劃數：</span>
            <span class="value">{{ getStrokeCount(nameCharacters[selectedCharIndex]) }} 劃</span>
          </div>
          <div class="info-item">
            <span class="label">注音：</span>
            <span class="value">{{ getZhuyin(nameCharacters[selectedCharIndex]) }}</span>
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
const showWatermark = ref(true)
const unknownCharacters = ref<string[]>([])
const currentRound = ref(1)
const totalPracticeRounds = 5 // 2次浮水印 + 3次空白

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

const selectCharacter = (index: number) => {
  selectedCharIndex.value = index
  currentRound.value = 1 // 重置練習回合
  clearCanvas()
}

const getZhuyin = (char: string) => {
  // 完整的中文字注音對照表（擴充版）
  const zhuyinMap: { [key: string]: string } = {
    // 常見姓氏
    '王': 'ㄨㄤˊ',
    '李': 'ㄌㄧˇ',
    '張': 'ㄓㄤ',
    '劉': 'ㄌㄧㄡˊ',
    '陳': 'ㄔㄣˊ',
    '楊': 'ㄧㄤˊ',
    '趙': 'ㄓㄠˋ',
    '黃': 'ㄏㄨㄤˊ',
    '周': 'ㄓㄡ',
    '吳': 'ㄨˊ',
    '徐': 'ㄒㄩˊ',
    '孫': 'ㄙㄨㄣ',
    '胡': 'ㄏㄨˊ',
    '朱': 'ㄓㄨ',
    '高': 'ㄍㄠ',
    '林': 'ㄌㄧㄣˊ',
    '何': 'ㄏㄜˊ',
    '郭': 'ㄍㄨㄛ',
    '馬': 'ㄇㄚˇ',
    '羅': 'ㄌㄨㄛˊ',
    '梁': 'ㄌㄧㄤˊ',
    '宋': 'ㄙㄨㄥˋ',
    '鄭': 'ㄓㄥˋ',
    '謝': 'ㄒㄧㄝˋ',
    '韓': 'ㄏㄢˊ',
    '唐': 'ㄊㄤˊ',
    '馮': 'ㄈㄥˊ',
    '于': 'ㄩˊ',
    '董': 'ㄉㄨㄥˇ',
    '蕭': 'ㄒㄧㄠ',
    '程': 'ㄔㄥˊ',
    '曹': 'ㄘㄠˊ',
    '袁': 'ㄩㄢˊ',
    '鄧': 'ㄉㄥˋ',
    '許': 'ㄒㄩˇ',
    '傅': 'ㄈㄨˋ',
    '沈': 'ㄕㄣˇ',
    '曾': 'ㄗㄥ',
    '彭': 'ㄆㄥˊ',
    '呂': 'ㄌㄩˇ',
    '蘇': 'ㄙㄨ',
    '蔡': 'ㄘㄞˋ',
    '賈': 'ㄐㄧㄚˇ',
    '丁': 'ㄉㄧㄥ',
    '魏': 'ㄨㄟˋ',
    '薛': 'ㄒㄩㄝ',
    '葉': 'ㄧㄝˋ',
    '閻': 'ㄧㄢˊ',
    '余': 'ㄩˊ',
    '潘': 'ㄆㄢ',
    '杜': 'ㄉㄨˋ',
    '戴': 'ㄉㄞˋ',
    '夏': 'ㄒㄧㄚˋ',
    '鍾': 'ㄓㄨㄥ',
    '汪': 'ㄨㄤ',
    '田': 'ㄊㄧㄢˊ',
    '任': 'ㄖㄣˋ',
    '姜': 'ㄐㄧㄤ',
    '范': 'ㄈㄢˋ',
    '方': 'ㄈㄤ',
    '石': 'ㄕˊ',
    '姚': 'ㄧㄠˊ',
    '譚': 'ㄊㄢˊ',
    '廖': 'ㄌㄧㄠˋ',
    '鄒': 'ㄗㄡ',
    '熊': 'ㄒㄩㄥˊ',
    '金': 'ㄐㄧㄣ',
    '陸': 'ㄌㄨˋ',
    '郝': 'ㄏㄠˇ',
    '孔': 'ㄎㄨㄥˇ',
    '白': 'ㄅㄞˊ',
    '崔': 'ㄘㄨㄟ',
    '康': 'ㄎㄤ',
    '毛': 'ㄇㄠˊ',
    '邱': 'ㄑㄧㄡ',
    '秦': 'ㄑㄧㄣˊ',
    '江': 'ㄐㄧㄤ',
    '史': 'ㄕˇ',
    '顧': 'ㄍㄨˋ',
    '侯': 'ㄏㄡˊ',
    '邵': 'ㄕㄠˋ',
    '孟': 'ㄇㄥˋ',
    '龍': 'ㄌㄨㄥˊ',
    '萬': 'ㄨㄢˋ',
    '段': 'ㄉㄨㄢˋ',
    '雷': 'ㄌㄟˊ',
    '錢': 'ㄑㄧㄢˊ',
    '湯': 'ㄊㄤ',
    '尹': 'ㄧㄣˇ',
    '黎': 'ㄌㄧˊ',
    '易': 'ㄧˋ',
    '常': 'ㄔㄤˊ',
    '武': 'ㄨˇ',
    '喬': 'ㄑㄧㄠˊ',
    '賴': 'ㄌㄞˋ',
    '龔': 'ㄍㄨㄥ',
    '文': 'ㄨㄣˊ',
    '紀': 'ㄐㄧˋ',
    '關': 'ㄍㄨㄢ',
    '苗': 'ㄇㄧㄠˊ',

    // 常見名字用字
    '明': 'ㄇㄧㄥˊ',
    '華': 'ㄏㄨㄚˊ',
    '小': 'ㄒㄧㄠˇ',
    '大': 'ㄉㄚˋ',
    '中': 'ㄓㄨㄥ',
    '文': 'ㄨㄣˊ',
    '武': 'ㄨˇ',
    '偉': 'ㄨㄟˇ',
    '強': 'ㄑㄧㄤˊ',
    '民': 'ㄇㄧㄣˊ',
    '永': 'ㄩㄥˇ',
    '健': 'ㄐㄧㄢˋ',
    '世': 'ㄕˋ',
    '廣': 'ㄍㄨㄤˇ',
    '志': 'ㄓˋ',
    '義': 'ㄧˋ',
    '禮': 'ㄌㄧˇ',
    '智': 'ㄓˋ',
    '信': 'ㄒㄧㄣˋ',
    '德': 'ㄉㄜˊ',
    '仁': 'ㄖㄣˊ',
    '美': 'ㄇㄟˇ',
    '麗': 'ㄌㄧˋ',
    '玉': 'ㄩˋ',
    '花': 'ㄏㄨㄚ',
    '春': 'ㄔㄨㄣ',
    '秋': 'ㄑㄧㄡ',
    '冬': 'ㄉㄨㄥ',
    '夏': 'ㄒㄧㄚˋ',
    '雨': 'ㄩˇ',
    '雪': 'ㄒㄩㄝˇ',
    '月': 'ㄩㄝˋ',
    '日': 'ㄖˋ',
    '星': 'ㄒㄧㄥ',
    '光': 'ㄍㄨㄤ',
    '亮': 'ㄌㄧㄤˋ',
    '晶': 'ㄐㄧㄥ',
    '珍': 'ㄓㄣ',
    '寶': 'ㄅㄠˇ',
    '貴': 'ㄍㄨㄟˋ',
    '富': 'ㄈㄨˋ',
    '榮': 'ㄖㄨㄥˊ',
    '華': 'ㄏㄨㄚˊ',
    '福': 'ㄈㄨˊ',
    '壽': 'ㄕㄡˋ',
    '康': 'ㄎㄤ',
    '安': 'ㄢ',
    '平': 'ㄆㄧㄥˊ',
    '和': 'ㄏㄜˊ',
    '樂': 'ㄌㄜˋ',
    '喜': 'ㄒㄧˇ',
    '愛': 'ㄞˋ',
    '慈': 'ㄘˊ',
    '孝': 'ㄒㄧㄠˋ',
    '忠': 'ㄓㄨㄥ',
    '良': 'ㄌㄧㄤˊ',
    '善': 'ㄕㄢˋ',
    '真': 'ㄓㄣ',
    '純': 'ㄔㄨㄣˊ',
    '清': 'ㄑㄧㄥ',
    '正': 'ㄓㄥˋ',
    '直': 'ㄓˊ',
    '誠': 'ㄔㄥˊ',
    '實': 'ㄕˊ',
    '謙': 'ㄑㄧㄢ',
    '虛': 'ㄒㄩ',
    '恭': 'ㄍㄨㄥ',
    '敬': 'ㄐㄧㄥˋ',
    '勤': 'ㄑㄧㄣˊ',
    '奮': 'ㄈㄣˋ',
    '進': 'ㄐㄧㄣˋ',
    '學': 'ㄒㄩㄝˊ',
    '問': 'ㄨㄣˋ',
    '思': 'ㄙ',
    '想': 'ㄒㄧㄤˇ',
    '念': 'ㄋㄧㄢˋ',
    '心': 'ㄒㄧㄣ',
    '意': 'ㄧˋ',
    '情': 'ㄑㄧㄥˊ',
    '感': 'ㄍㄢˇ',
    '受': 'ㄕㄡˋ',
    '知': 'ㄓ',
    '識': 'ㄕˋ',
    '理': 'ㄌㄧˇ',
    '解': 'ㄐㄧㄝˇ',
    '懂': 'ㄉㄨㄥˇ',
    '會': 'ㄏㄨㄟˋ',
    '能': 'ㄋㄥˊ',
    '可': 'ㄎㄜˇ',
    '以': 'ㄧˇ',
    '要': 'ㄧㄠˋ',
    '必': 'ㄅㄧˋ',
    '須': 'ㄒㄩ',
    '應': 'ㄧㄥ',
    '該': 'ㄍㄞ',
    '當': 'ㄉㄤ',
    '就': 'ㄐㄧㄡˋ',
    '是': 'ㄕˋ',
    '為': 'ㄨㄟˊ',
    '有': 'ㄧㄡˇ',
    '無': 'ㄨˊ',
    '沒': 'ㄇㄟˊ',
    '不': 'ㄅㄨˋ',
    '非': 'ㄈㄟ',
    '很': 'ㄏㄣˇ',
    '多': 'ㄉㄨㄛ',
    '少': 'ㄕㄠˇ',
    '好': 'ㄏㄠˇ',
    '壞': 'ㄏㄨㄞˋ',
    '對': 'ㄉㄨㄟˋ',
    '錯': 'ㄘㄨㄛˋ',
    '新': 'ㄒㄧㄣ',
    '舊': 'ㄐㄧㄡˋ',
    '高': 'ㄍㄠ',
    '低': 'ㄉㄧ',
    '長': 'ㄔㄤˊ',
    '短': 'ㄉㄨㄢˇ',
    '遠': 'ㄩㄢˇ',
    '近': 'ㄐㄧㄣˋ',
    '快': 'ㄎㄨㄞˋ',
    '慢': 'ㄇㄢˋ',
    '早': 'ㄗㄠˇ',
    '晚': 'ㄨㄢˇ',
    '先': 'ㄒㄧㄢ',
    '後': 'ㄏㄡˋ',
    '前': 'ㄑㄧㄢˊ',
    '次': 'ㄘˋ',
    '第': 'ㄉㄧˋ',
    '一': 'ㄧ',
    '二': 'ㄦˋ',
    '三': 'ㄙㄢ',
    '四': 'ㄙˋ',
    '五': 'ㄨˇ',
    '六': 'ㄌㄧㄡˋ',
    '七': 'ㄑㄧ',
    '八': 'ㄅㄚ',
    '九': 'ㄐㄧㄡˇ',
    '十': 'ㄕˊ',
    '百': 'ㄅㄞˇ',
    '千': 'ㄑㄧㄢ',
    '萬': 'ㄨㄢˋ',
    '億': 'ㄧˋ'
  }

  if (!zhuyinMap[char]) {
    // 記錄未知字符以便後續添加
    if (!unknownCharacters.value.includes(char)) {
      unknownCharacters.value.push(char)
      console.log('未知字符:', char, '需要添加注音')
    }
    return 'ㄓㄨ ㄧㄣ'
  }
  return zhuyinMap[char]
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

  // 如果是輔助模式，進入下一回合
  if (needsWatermarkAssist.value && currentRound.value < totalPracticeRounds) {
    currentRound.value++
  }
}

const resetPractice = () => {
  currentRound.value = 1
  clearCanvas()
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
  margin-bottom: 20px;
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
  width: 100%;
  padding: 0 40px;
}

.name-display {
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.name-display h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 15px;
}

.name-characters {
  display: flex;
  justify-content: center;
  gap: 15px;
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
  margin-bottom: 8px;
}

.character-box .zhuyin {
  font-size: 1rem;
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
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stroke-practice h3,
.character-info h3 {
  color: #333;
  margin-bottom: 20px;
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
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
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

.practice-mode-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f8ff;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #4CAF50;
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
  margin-top: 20px;
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