<template>
  <div class="worksheets-container">
    <header class="worksheets-header">
      <h1>練習表格生成器</h1>
      <p>為孩子製作專屬的中文字練習表</p>
    </header>

    <div class="worksheets-content">
      <div class="input-section">
        <div class="form-group">
          <label for="characters">要練習的字</label>
          <textarea
            id="characters"
            v-model="inputText"
            placeholder="請輸入要練習的中文字，例如：我愛爸爸媽媽"
            maxlength="100"
          ></textarea>
          <div class="char-count">{{ inputText.length }}/100 字</div>
        </div>

        <div class="options-grid">
          <div class="form-group">
            <label>格式樣式</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="gridType" value="tian" />
                <span>田字格</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="gridType" value="mi" />
                <span>米字格</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="gridType" value="simple" />
                <span>簡單格</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>每行字數</label>
            <select v-model="charsPerRow">
              <option value="5">5 字</option>
              <option value="6">6 字</option>
              <option value="8">8 字</option>
              <option value="10">10 字</option>
            </select>
          </div>

        </div>

      </div>

      <div class="character-info">
        <div class="form-group">
          <label>重複次數</label>
          <select v-model="repeatCount">
            <option value="3">3 次</option>
            <option value="5">5 次</option>
            <option value="10">10 次</option>
          </select>
        </div>

        <div class="form-group">
          <label class="checkbox-item">
            <input type="checkbox" v-model="showZhuyin" />
            <span>顯示注音</span>
          </label>
        </div>

        <div class="preview-area" v-if="hasPreview">
          <h4>預覽</h4>
          <div class="preview-container">
            <canvas ref="previewCanvas" class="worksheet-preview"></canvas>
          </div>
        </div>

        <div class="action-buttons">
          <button class="preview-btn" @click="generatePreview" :disabled="!inputText.trim()">
            預覽練習表
          </button>
          <button class="download-btn" @click="downloadPDF" :disabled="!hasPreview">
            下載 PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const inputText = ref('')
const gridType = ref('tian')
const charsPerRow = ref(6)
const repeatCount = ref(3)
const showZhuyin = ref(true)
const hasPreview = ref(false)
const previewCanvas = ref<HTMLCanvasElement>()

// 注音對照表 (從 NameLearningView 複製)
const zhuyinMap: Record<string, string> = {
  '我': 'ㄨㄛˇ',
  '愛': 'ㄞˋ',
  '爸': 'ㄅㄚˋ',
  '媽': 'ㄇㄚ',
  '你': 'ㄋㄧˇ',
  '好': 'ㄏㄠˇ',
  '他': 'ㄊㄚ',
  '她': 'ㄊㄚ',
  '們': 'ㄇㄣˊ',
  '的': '˙ㄉㄜ',
  '是': 'ㄕˋ',
  '在': 'ㄗㄞˋ',
  '有': 'ㄧㄡˇ',
  '不': 'ㄅㄨˋ',
  '了': '˙ㄌㄜ',
  '人': 'ㄖㄣˊ',
  '一': 'ㄧ',
  '個': '˙ㄍㄜ',
  '上': 'ㄕㄤˋ',
  '也': 'ㄧㄝˇ',
  '很': 'ㄏㄣˇ',
  '到': 'ㄉㄠˋ',
  '說': 'ㄕㄨㄛ',
  '要': 'ㄧㄠˋ',
  '去': 'ㄑㄩˋ',
  '就': 'ㄐㄧㄡˋ',
  '得': 'ㄉㄜˊ',
  '可': 'ㄎㄜˇ',
  '以': 'ㄧˇ',
  '還': 'ㄏㄞˊ',
  '會': 'ㄏㄨㄟˋ',
  '來': 'ㄌㄞˊ',
  '看': 'ㄎㄢˋ',
  '時': 'ㄕˊ',
  '沒': 'ㄇㄟˊ',
  '什': 'ㄕㄣˊ',
  '麼': '˙ㄇㄜ',
  '只': 'ㄓˇ',
  '小': 'ㄒㄧㄠˇ',
  '水': 'ㄕㄨㄟˇ',
  '方': 'ㄈㄤ',
  '長': 'ㄔㄤˊ',
  '山': 'ㄕㄢ',
  '出': 'ㄔㄨ',
  '三': 'ㄙㄢ',
  '生': 'ㄕㄥ',
  '主': 'ㄓㄨˇ',
  '同': 'ㄊㄨㄥˊ',
  '老': 'ㄌㄠˇ',
  '從': 'ㄘㄨㄥˊ',
  '動': 'ㄉㄨㄥˋ',
  '兩': 'ㄌㄧㄤˇ',
  '長': 'ㄔㄤˊ',
  '把': 'ㄅㄚˇ',
  '被': 'ㄅㄟˋ',
  '給': 'ㄍㄟˇ',
  '讓': 'ㄖㄤˋ',
  '跟': 'ㄍㄣ',
  '和': 'ㄏㄜˊ',
  '與': 'ㄩˇ',
  '及': 'ㄐㄧˊ',
  '或': 'ㄏㄨㄛˋ',
  '但': 'ㄉㄢˋ',
  '卻': 'ㄑㄩㄝˋ',
  '而': 'ㄦˊ',
  '所': 'ㄙㄨㄛˇ',
  '因': 'ㄧㄣ',
  '為': 'ㄨㄟˊ',
  '如': 'ㄖㄨˊ',
  '果': 'ㄍㄨㄛˇ',
  '那': 'ㄋㄚˋ',
  '這': 'ㄓㄜˋ',
  '些': 'ㄒㄧㄝ',
  '每': 'ㄇㄟˇ',
  '都': 'ㄉㄡ',
  '能': 'ㄋㄥˊ',
  '自': 'ㄗˋ',
  '己': 'ㄐㄧˇ',
  '又': 'ㄧㄡˋ',
  '手': 'ㄕㄡˇ',
  '日': 'ㄖˋ',
  '目': 'ㄇㄨˋ',
  '月': 'ㄩㄝˋ',
  '木': 'ㄇㄨˋ',
  '火': 'ㄏㄨㄛˇ',
  '土': 'ㄊㄨˇ',
  '金': 'ㄐㄧㄣ',
  '女': 'ㄋㄩˇ',
  '子': 'ㄗˇ',
  '大': 'ㄉㄚˋ',
  '中': 'ㄓㄨㄥ',
  '下': 'ㄒㄧㄚˋ',
  '左': 'ㄗㄨㄛˇ',
  '右': 'ㄧㄡˋ',
  '東': 'ㄉㄨㄥ',
  '西': 'ㄒㄧ',
  '南': 'ㄋㄢˊ',
  '北': 'ㄅㄟˇ',
  '高': 'ㄍㄠ',
  '低': 'ㄉㄧ',
  '多': 'ㄉㄨㄛ',
  '少': 'ㄕㄠˇ',
  '新': 'ㄒㄧㄣ',
  '舊': 'ㄐㄧㄡˋ',
  '前': 'ㄑㄧㄢˊ',
  '後': 'ㄏㄡˋ',
  '裡': 'ㄌㄧˇ',
  '外': 'ㄨㄞˋ',
  '家': 'ㄐㄧㄚ',
  '學': 'ㄒㄩㄝˊ',
  '校': 'ㄒㄧㄠˋ',
  '年': 'ㄋㄧㄢˊ',
  '今': 'ㄐㄧㄣ',
  '天': 'ㄊㄧㄢ',
  '明': 'ㄇㄧㄥˊ',
  '昨': 'ㄗㄨㄛˊ',
  '早': 'ㄗㄠˇ',
  '晚': 'ㄨㄢˇ',
  '吃': 'ㄔ',
  '喝': 'ㄏㄜ',
  '玩': 'ㄨㄢˊ',
  '睡': 'ㄕㄨㄟˋ',
  '起': 'ㄑㄧˇ',
  '坐': 'ㄗㄨㄛˋ',
  '站': 'ㄓㄢˋ',
  '走': 'ㄗㄡˇ',
  '跑': 'ㄆㄠˇ',
  '跳': 'ㄊㄧㄠˋ',
  '笑': 'ㄒㄧㄠˋ',
  '哭': 'ㄎㄨ',
  '唱': 'ㄔㄤˋ',
  '跳': 'ㄊㄧㄠˋ',
  '畫': 'ㄏㄨㄚˋ',
  '寫': 'ㄒㄧㄝˇ',
  '讀': 'ㄉㄨˊ',
  '聽': 'ㄊㄧㄥ',
  '想': 'ㄒㄧㄤˇ',
  '知': 'ㄓ',
  '道': 'ㄉㄠˋ',
  '問': 'ㄨㄣˋ',
  '答': 'ㄉㄚˊ',
  '買': 'ㄇㄞˇ',
  '賣': 'ㄇㄞˋ',
  '錢': 'ㄑㄧㄢˊ',
  '貴': 'ㄍㄨㄟˋ',
  '便': 'ㄆㄧㄢˊ',
  '宜': 'ㄧˊ',
  '快': 'ㄎㄨㄞˋ',
  '慢': 'ㄇㄢˋ',
  '紅': 'ㄏㄨㄥˊ',
  '藍': 'ㄌㄢˊ',
  '黃': 'ㄏㄨㄤˊ',
  '綠': 'ㄌㄩˋ',
  '白': 'ㄅㄞˊ',
  '黑': 'ㄏㄟ',
  '花': 'ㄏㄨㄚ',
  '草': 'ㄘㄠˇ',
  '樹': 'ㄕㄨˋ',
  '葉': 'ㄧㄝˋ',
  '鳥': 'ㄋㄧㄠˇ',
  '魚': 'ㄩˊ',
  '狗': 'ㄍㄡˇ',
  '貓': 'ㄇㄠ',
  '車': 'ㄔㄜ',
  '船': 'ㄔㄨㄢˊ',
  '飛': 'ㄈㄟ',
  '機': 'ㄐㄧ',
  '門': 'ㄇㄣˊ',
  '窗': 'ㄔㄨㄤ',
  '桌': 'ㄓㄨㄛ',
  '椅': 'ㄧˇ',
  '床': 'ㄔㄨㄤˊ',
  '書': 'ㄕㄨ',
  '筆': 'ㄅㄧˇ',
  '紙': 'ㄓˇ',
  '包': 'ㄅㄠ',
  '衣': 'ㄧ',
  '服': 'ㄈㄨˊ',
  '鞋': 'ㄒㄧㄝˊ',
  '帽': 'ㄇㄠˋ',
  '飯': 'ㄈㄢˋ',
  '菜': 'ㄘㄞˋ',
  '肉': 'ㄖㄡˋ',
  '蛋': 'ㄉㄢˋ',
  '奶': 'ㄋㄞˇ',
  '糖': 'ㄊㄤˊ',
  '鹽': 'ㄧㄢˊ',
  '油': 'ㄧㄡˊ',
  '醋': 'ㄘㄨˋ',
  '茶': 'ㄔㄚˊ',
  '咖': 'ㄎㄚ',
  '啡': 'ㄈㄟ',
  '果': 'ㄍㄨㄛˇ',
  '汁': 'ㄓ',
  '蘋': 'ㄆㄧㄥˊ',
  '橘': 'ㄐㄩˊ',
  '香': 'ㄒㄧㄤ',
  '蕉': 'ㄐㄧㄠ',
  '西': 'ㄒㄧ',
  '瓜': 'ㄍㄨㄚ',
  '零': 'ㄌㄧㄥˊ',
  '二': 'ㄦˋ',
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
  '紀': 'ㄐㄧˋ',
  '陳': 'ㄔㄣˊ',
  '林': 'ㄌㄧㄣˊ',
  '王': 'ㄨㄤˊ',
  '李': 'ㄌㄧˇ',
  '張': 'ㄓㄤ',
  '劉': 'ㄌㄧㄡˊ',
  '楊': 'ㄧㄤˊ',
  '黃': 'ㄏㄨㄤˊ',
  '趙': 'ㄓㄠˋ',
  '吳': 'ㄨˊ',
  '周': 'ㄓㄡ',
  '徐': 'ㄒㄩˊ',
  '孫': 'ㄙㄨㄣ',
  '馬': 'ㄇㄚˇ',
  '朱': 'ㄓㄨ',
  '胡': 'ㄏㄨˊ',
  '郭': 'ㄍㄨㄛ',
  '何': 'ㄏㄜˊ',
  '高': 'ㄍㄠ',
  '羅': 'ㄌㄨㄛˊ',
  '鄭': 'ㄓㄥˋ',
  '梁': 'ㄌㄧㄤˊ',
  '謝': 'ㄒㄧㄝˋ',
  '宋': 'ㄙㄨㄥˋ',
  '唐': 'ㄊㄤˊ',
  '許': 'ㄒㄩˇ',
  '韓': 'ㄏㄢˊ',
  '馮': 'ㄈㄥˊ',
  '鄧': 'ㄉㄥˋ',
  '曹': 'ㄘㄠˊ',
  '彭': 'ㄆㄥˊ',
  '曾': 'ㄗㄥ',
  '蕭': 'ㄒㄧㄠ',
  '田': 'ㄊㄧㄢˊ',
  '董': 'ㄉㄨㄥˇ',
  '潘': 'ㄆㄢ',
  '袁': 'ㄩㄢˊ',
  '蔡': 'ㄘㄞˋ',
  '蔣': 'ㄐㄧㄤˇ',
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
  '漕': 'ㄘㄠˊ',
  '錢': 'ㄑㄧㄢˊ',
  '湯': 'ㄊㄤ',
  '尹': 'ㄧㄣˇ',
  '黎': 'ㄌㄧˊ',
  '易': 'ㄧˋ',
  '常': 'ㄔㄤˊ',
  '武': 'ㄨˇ',
  '喬': 'ㄑㄧㄠˊ',
  '賀': 'ㄏㄜˋ',
  '賴': 'ㄌㄞˋ',
  '龔': 'ㄍㄨㄥ',
  '文': 'ㄨㄣˊ'
}

const getZhuyin = (char: string): string => {
  return zhuyinMap[char] || '?'
}


onMounted(() => {
  // 檢查 URL 參數，如果有 name 參數就自動填入
  const route = useRoute()
  if (route.query.name && typeof route.query.name === 'string') {
    inputText.value = route.query.name
  }
})

const generatePreview = async () => {
  if (!inputText.value.trim() || !previewCanvas.value) return

  hasPreview.value = true
  await nextTick()

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 設定畫布尺寸 (適合預覽區域)
  const width = 300
  const height = 400
  canvas.width = width
  canvas.height = height

  // 清空畫布
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // 設定基本參數
  const cellSize = 40
  const margin = 20
  const lineWidth = 1

  // 準備要練習的字符
  const chars = inputText.value.trim().split('')
  let allChars: string[] = []

  // 根據重複次數生成字符列表
  for (let i = 0; i < repeatCount.value; i++) {
    allChars = allChars.concat(chars)
  }

  // 計算佈局
  const cols = charsPerRow.value
  const startX = margin
  const startY = margin + (showZhuyin.value ? 30 : 0)

  let row = 0
  let col = 0

  // 繪製每個字符
  allChars.forEach((char, index) => {
    const x = startX + col * cellSize
    const y = startY + row * cellSize

    // 繪製格子
    drawGrid(ctx, x, y, cellSize, gridType.value)

    // 繪製注音 (如果啟用)
    if (showZhuyin.value) {
      ctx.fillStyle = '#27ae60'
      ctx.font = '8px Arial'
      ctx.textAlign = 'center'
      const zhuyin = getZhuyin(char)
      ctx.fillText(zhuyin, x + cellSize/2, y - 5)
    }

    // 移到下一個位置
    col++
    if (col >= cols) {
      col = 0
      row++
    }
  })
}

const drawGrid = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: string) => {
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1

  // 繪製外框
  ctx.strokeRect(x, y, size, size)

  if (type === 'tian') {
    // 田字格
    ctx.beginPath()
    // 水平線
    ctx.moveTo(x, y + size/2)
    ctx.lineTo(x + size, y + size/2)
    // 垂直線
    ctx.moveTo(x + size/2, y)
    ctx.lineTo(x + size/2, y + size)
    ctx.stroke()
  } else if (type === 'mi') {
    // 米字格
    ctx.beginPath()
    // 水平線
    ctx.moveTo(x, y + size/2)
    ctx.lineTo(x + size, y + size/2)
    // 垂直線
    ctx.moveTo(x + size/2, y)
    ctx.lineTo(x + size/2, y + size)
    // 對角線
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y + size)
    ctx.moveTo(x + size, y)
    ctx.lineTo(x, y + size)
    ctx.stroke()
  }
  // simple 格式只有外框，不需要額外線條
}

const downloadPDF = () => {
  if (!hasPreview.value || !previewCanvas.value) return

  // 將 canvas 轉換為圖片並下載
  const link = document.createElement('a')
  link.download = `練習表_${new Date().toLocaleDateString()}.png`
  link.href = previewCanvas.value.toDataURL()
  link.click()
}
</script>

<style scoped>
.worksheets-container {
  padding: 30px 40px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

.worksheets-header {
  text-align: center;
  margin-bottom: 40px;
}

.worksheets-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.worksheets-header p {
  color: #666;
  font-size: 1.1rem;
}

.worksheets-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.input-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 70vh;
}

.character-info {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 70vh;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: bold;
  margin-bottom: 8px;
}

.form-group textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  font-family: inherit;
}

.form-group textarea:focus {
  outline: none;
  border-color: #27ae60;
}

.char-count {
  text-align: right;
  color: #666;
  font-size: 0.9rem;
  margin-top: 5px;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.form-group select:focus {
  outline: none;
  border-color: #27ae60;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-item, .checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-item input, .checkbox-item input {
  margin-right: 8px;
}


.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.preview-btn, .download-btn {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-btn {
  background: #27ae60;
  color: white;
}

.preview-btn:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-2px);
}

.download-btn {
  background: #3498db;
  color: white;
}

.download-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.preview-btn:disabled, .download-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}


.preview-area {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  margin-top: 20px;
  margin-bottom: 20px;
}

.preview-area h4 {
  color: #333;
  margin-bottom: 10px;
  text-align: center;
  font-size: 1rem;
}

.preview-container {
  text-align: center;
}

.worksheet-preview {
  max-width: 100%;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .worksheets-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>