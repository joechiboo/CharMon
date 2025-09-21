<template>
  <div class="worksheets-container">
    <header class="worksheets-header">
      <h1 v-if="isGameMode">🎮 {{ pokemonTheme }} 文學練習表</h1>
      <h1 v-else>練習表格生成器</h1>
      <p v-if="isGameMode">跟著 {{ pokemonTheme }} 一起練習文學描述寫作！</p>
      <p v-else>為孩子製作專屬的中文字練習表</p>
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
            <select v-model="gridType">
              <option value="tian">田字格</option>
              <option value="mi">米字格</option>
              <option value="simple">簡單格</option>
            </select>
          </div>

          <div v-if="!isGameMode" class="form-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="showZhuyin" />
              <span>顯示注音</span>
            </label>
          </div>

          <div v-if="!isGameMode" class="form-group">
            <label>字型</label>
            <select v-model="selectedFont">
              <option value="DFKai-SB">標楷體</option>
              <option value="Microsoft YaHei">微軟正黑體</option>
              <option value="SimSun">宋體</option>
            </select>
          </div>
        </div>

      </div>

      <div class="character-info">
        <div v-if="!isGameMode" class="form-group">
          <label>每行字數</label>
          <select v-model="charsPerLine">
            <option value="3">3 字</option>
            <option value="6">6 字</option>
            <option value="12">12 字</option>
          </select>
        </div>

        <div v-if="!isGameMode" class="form-group">
          <label>重複行數</label>
          <select v-model="repeatCount">
            <option value="3">3 行</option>
            <option value="6">6 行</option>
            <option value="9">9 行</option>
            <option value="12">12 行</option>
          </select>
        </div>

        <div class="preview-area">
          <h4>預覽</h4>
          <div class="preview-container" v-if="hasPreview">
            <canvas ref="previewCanvas" class="worksheet-preview"></canvas>
          </div>
          <div v-else class="no-preview">
            點擊「預覽練習表」查看效果
          </div>
        </div>

        <div class="action-buttons">
          <button v-if="!isGameMode" class="preview-btn" @click="generatePreview" :disabled="!inputText.trim()">
            預覽練習表
          </button>
          <button class="download-btn" @click="downloadImage" :disabled="!hasPreview">
            下載圖片
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
import { getCharacterInfo } from '@/utils/dictionaryV2'

// 定義元素行資訊介面
interface ElementRowInfo {
  element: string
  startRow: number
  endRow: number
  middleRow: number
}

const userStore = useUserStore()
const route = useRoute()
const inputText = ref('')
const gridType = ref('tian')
const isGameMode = ref(false)
const pokemonTheme = ref('')
// 根據使用者年級設定預設值
const getDefaultCharsPerLine = () => {
  const user = userStore.currentUser
  if (user?.gradeLevel === 'elementary-low') return 12
  return 6 // 幼稚園預設
}
const getDefaultRepeatCount = () => {
  const user = userStore.currentUser
  if (user?.gradeLevel === 'elementary-low') return 12
  return 6 // 幼稚園預設
}
const charsPerLine = ref(getDefaultCharsPerLine())
const repeatCount = ref(getDefaultRepeatCount())
const showZhuyin = ref(true) // 預設顯示注音
const selectedFont = ref('DFKai-SB') // 預設標楷體
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
  '汁': 'ㄓ',
  '蘋': 'ㄆㄧㄥˊ',
  '橘': 'ㄐㄩˊ',
  '香': 'ㄒㄧㄤ',
  '蕉': 'ㄐㄧㄠ',
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
  '禾': 'ㄏㄜˊ',
  '劉': 'ㄌㄧㄡˊ',
  '楊': 'ㄧㄤˊ',
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
  '閻': 'ㄧㄢˊ',
  '余': 'ㄩˊ',
  '杜': 'ㄉㄨˋ',
  '戴': 'ㄉㄞˋ',
  '夏': 'ㄒㄧㄚˋ',
  '鍾': 'ㄓㄨㄥ',
  '汪': 'ㄨㄤ',
  '任': 'ㄖㄣˋ',
  '姜': 'ㄐㄧㄤ',
  '范': 'ㄈㄢˋ',
  '石': 'ㄕˊ',
  '姚': 'ㄧㄠˊ',
  '譚': 'ㄊㄢˊ',
  '廖': 'ㄌㄧㄠˋ',
  '鄒': 'ㄗㄡ',
  '熊': 'ㄒㄩㄥˊ',
  '陸': 'ㄌㄨˋ',
  '郝': 'ㄏㄠˇ',
  '孔': 'ㄎㄨㄥˇ',
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
  '段': 'ㄉㄨㄢˋ',
  '漕': 'ㄘㄠˊ',
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

// 拆分注音符號為垂直顯示（根據正確的注音排列規則）
const getZhuyinParts = (char: string): string[] => {
  const zhuyin = getZhuyin(char)
  if (zhuyin === '?') {
    return ['?']
  }

  const consonants = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ']
  const medials = ['ㄧ', 'ㄨ', 'ㄩ'] // 介音
  const vowels = ['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ']
  const tones = ['ˊ', 'ˇ', 'ˋ']
  const lightTone = '˙'

  let consonant = ''
  let medial = ''
  let vowel = ''
  let tone = ''
  let hasLightTone = false

  // 解析注音字串
  let remaining = zhuyin

  // 1. 檢查輕聲（在開頭）
  if (remaining.includes(lightTone)) {
    hasLightTone = true
    remaining = remaining.replace(lightTone, '')
  }

  // 2. 檢查聲調（在結尾）
  for (const t of tones) {
    if (remaining.includes(t)) {
      tone = t
      remaining = remaining.replace(t, '')
      break
    }
  }

  // 3. 檢查聲母（第一個字符）
  if (remaining.length > 0 && consonants.includes(remaining[0])) {
    consonant = remaining[0]
    remaining = remaining.slice(1)
  }

  // 4. 檢查介音
  if (remaining.length > 0 && medials.includes(remaining[0])) {
    medial = remaining[0]
    remaining = remaining.slice(1)
  }

  // 5. 剩餘的是韻母
  vowel = remaining

  // 組合結果
  let result = []

  // 輕聲在最上面
  if (hasLightTone) {
    result.push(lightTone)
  }

  // 聲母
  if (consonant) {
    result.push(consonant)
  }

  // 介音和韻母的組合處理
  if (medial && vowel) {
    // 如果有介音和韻母，分開顯示
    result.push(medial)
    // 韻母和聲調結合
    result.push(vowel + tone)
  } else if (medial) {
    // 只有介音，介音和聲調結合
    result.push(medial + tone)
  } else if (vowel) {
    // 只有韻母，韻母和聲調結合
    result.push(vowel + tone)
  } else if (tone) {
    // 只有聲調（特殊情況）
    result.push(tone)
  }

  return result
}


onMounted(() => {
  // 檢查 URL 參數，如果有 name 參數就自動填入
  const route = useRoute()
  if (route.query.name && typeof route.query.name === 'string') {
    inputText.value = route.query.name
  }

  // 檢查寶可夢主題參數 - 遊戲模式
  if (route.query.pokemonTheme && route.query.variations) {
    try {
      const pokemonName = route.query.pokemonTheme as string
      const variations = JSON.parse(route.query.variations as string)

      // 設定遊戲模式
      isGameMode.value = true
      pokemonTheme.value = pokemonName

      // 遊戲模式：每個文學變化換一行
      const practiceLines = variations.map((v: any) => v.description)
      inputText.value = practiceLines.join('\n')

      // 設定遊戲模式專用設定 - 仿照demo.jpg
      charsPerLine.value = 10  // 適中的字數
      repeatCount.value = 6    // 多行練習
      gridType.value = 'tian'  // 使用田字格
      showZhuyin.value = false // 不顯示注音，專注寫字

      // 自動生成預覽
      nextTick(() => {
        generateGameModePreview()
      })
    } catch (e) {
      console.warn('解析寶可夢主題參數失敗:', e)
    }
  }
})

// 檢查並記錄未知字符的函數
const checkAndRecordUnknownCharacters = async (characters: string[]) => {
  console.log('開始檢查字符:', characters)
  const chineseChars = characters.filter(char => /[\u4e00-\u9fff]/.test(char))
  console.log('過濾出的中文字符:', chineseChars)

  for (const char of chineseChars) {
    try {
      console.log(`正在檢查字符: "${char}"`)
      // 嘗試獲取字符信息，如果不存在會自動記錄到 Supabase
      const result = await getCharacterInfo(char)
      console.log(`字符 "${char}" 檢查結果:`, result)
    } catch (error) {
      console.error(`檢查字符 "${char}" 時發生錯誤:`, error)
    }
  }
  console.log('字符檢查完成')
}

const generatePreview = async () => {
  if (!inputText.value.trim()) return

  // 先設置 hasPreview 為 true 讓 canvas 渲染
  hasPreview.value = true
  await nextTick()

  if (!previewCanvas.value) return

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 準備要練習的字符，限制最大 108 個字符以配合格子數
  const allChars = inputText.value.trim().split('').slice(0, 108)

  // 檢查字典並記錄未知字符
  await checkAndRecordUnknownCharacters(allChars)

  // 將字符分割成每行指定數量的格子（每個字符佔1格）
  const charLines: string[][] = []
  for (let i = 0; i < allChars.length; i += charsPerLine.value) {
    charLines.push(allChars.slice(i, i + charsPerLine.value))
  }

  // 計算所需畫布尺寸
  const cellSize = 68  // 增加70% (40 * 1.7 = 68)
  const zhuyinCellWidth = cellSize * 0.5  // 注音格寬度為字符格的一半
  const margin = 34    // 相應增加邊距
  const totalColsPerRow = charsPerLine.value * 2  // 每個字符需要2個格子（字符格+注音格）
  const totalRows = charLines.length * repeatCount.value

  // 計算總寬度：每個字符佔用(字符格+注音格)的寬度
  const width = margin * 2 + charsPerLine.value * (cellSize + zhuyinCellWidth)
  const height = margin * 2 + totalRows * cellSize

  canvas.width = width
  canvas.height = height

  // 清空畫布
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // 設定基本參數
  const startX = margin
  const startY = margin

  let currentRow = 0

  // 對每個字符行進行處理
  charLines.forEach((lineChars, lineIndex) => {
    // 每個字符行重複指定次數
    for (let repeatIndex = 0; repeatIndex < repeatCount.value; repeatIndex++) {
      const rowY = startY + currentRow * cellSize

      // 在當前行中，為每個字符繪製字符格和注音格
      for (let col = 0; col < charsPerLine.value; col++) {
        if (col < lineChars.length) {
          const char = lineChars[col]
          const charX = startX + col * (cellSize + zhuyinCellWidth)

          // 繪製字符格（左邊）
          drawGrid(ctx, charX, rowY, cellSize, gridType.value)

          // 在字符格中繪製浮水印
          ctx.fillStyle = 'rgba(150, 150, 150, 0.6)'
          ctx.font = `${cellSize * 0.6}px '${selectedFont.value}', 'Microsoft YaHei', Arial, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(char, charX + cellSize/2, rowY + cellSize/2)

          // 繪製注音格（右邊）
          const zhuyinX = charX + cellSize
          drawZhuyinGrid(ctx, zhuyinX, rowY, zhuyinCellWidth, cellSize)

          // 如果啟用注音，在注音格中垂直繪製注音
          if (showZhuyin.value) {
            const zhuyinParts = getZhuyinParts(char)
            const partHeight = cellSize / (zhuyinParts.length + 1)

            // 如果只有兩個部分，往下偏移
            const verticalOffset = zhuyinParts.length === 2 ? partHeight * 0.3 : 0

            zhuyinParts.forEach((part, index) => {
              ctx.fillStyle = '#000'
              ctx.font = `${Math.min(zhuyinCellWidth * 0.6, partHeight * 0.8)}px Arial`
              ctx.textBaseline = 'middle'
              const y = rowY + partHeight * (index + 1) + verticalOffset

              // 判斷是否包含聲調符號
              const hasTone = part.includes('ˊ') || part.includes('ˇ') || part.includes('ˋ')

              if (hasTone) {
                // 有聲調的情況，分開繪製主符號和聲調
                const mainChar = part.slice(0, -1)  // 主符號
                const toneChar = part.slice(-1)     // 聲調符號

                // 主符號置中
                ctx.textAlign = 'center'
                ctx.fillText(mainChar, zhuyinX + zhuyinCellWidth/2, y)

                // 聲調在右邊
                ctx.textAlign = 'left'
                ctx.fillText(toneChar, zhuyinX + zhuyinCellWidth * 0.7, y)
              } else {
                // 無聲調的情況，正常置中
                ctx.textAlign = 'center'
                ctx.fillText(part, zhuyinX + zhuyinCellWidth/2, y)
              }
            })
          }
        } else {
          // 空白格子
          const charX = startX + col * (cellSize + zhuyinCellWidth)
          drawGrid(ctx, charX, rowY, cellSize, gridType.value)
          drawZhuyinGrid(ctx, charX + cellSize, rowY, zhuyinCellWidth, cellSize)
        }
      }

      currentRow++
    }
  })
}

// 繪製注音格（只有簡單的外框）
const drawZhuyinGrid = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
  const user = userStore.currentUser
  const isKindergartenOrElementary = user?.gradeLevel === 'kindergarten' || user?.gradeLevel === 'elementary-low'

  // 如果是幼稚園或低年級，使用宣紙紅色，否則使用黑色
  ctx.strokeStyle = isKindergartenOrElementary ? '#d4794a' : '#000'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, width, height)
}

const drawGrid = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: string) => {
  const user = userStore.currentUser
  const isKindergartenOrElementary = user?.gradeLevel === 'kindergarten' || user?.gradeLevel === 'elementary-low'

  // 如果是幼稚園或低年級，添加淡色背景
  if (isKindergartenOrElementary) {
    ctx.fillStyle = 'rgba(212, 121, 74, 0.1)'  // 宣紙紅色背景
    ctx.fillRect(x, y, size, size)
  }

  // 如果是幼稚園或低年級，使用宣紙紅色，否則使用黑色
  ctx.strokeStyle = isKindergartenOrElementary ? '#d4794a' : '#000'
  ctx.lineWidth = 2         // 增加線條粗細

  // 繪製外框
  ctx.strokeRect(x, y, size, size)

  if (type === 'tian') {
    // 田字格中間十字線使用虛線
    ctx.save()

    // 如果是幼稚園或低年級，使用宣紙紅色虛線，否則使用黑色虛線
    ctx.strokeStyle = isKindergartenOrElementary ? '#d4794a' : '#000'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])  // 虛線樣式

    ctx.beginPath()
    // 水平線
    ctx.moveTo(x, y + size/2)
    ctx.lineTo(x + size, y + size/2)
    // 垂直線
    ctx.moveTo(x + size/2, y)
    ctx.lineTo(x + size/2, y + size)
    ctx.stroke()

    ctx.restore()
  } else if (type === 'mi') {
    // 米字格內部線條使用虛線
    ctx.save()

    // 如果是幼稚園或低年級，使用宣紙紅色虛線，否則使用黑色虛線
    ctx.strokeStyle = isKindergartenOrElementary ? '#d4794a' : '#000'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])  // 虛線樣式

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

    ctx.restore()
  }
  // simple 格式只有外框，不需要額外線條
}

// 遊戲模式專用預覽生成 - 仿照demo.jpg
const generateGameModePreview = async () => {
  if (!inputText.value.trim()) return

  // 檢查遊戲模式字符並記錄未知字符
  const allChars = inputText.value.trim().split('').slice(0, 108)
  await checkAndRecordUnknownCharacters(allChars)

  hasPreview.value = true
  await nextTick()

  if (!previewCanvas.value) return

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 計算畫布尺寸 - 仿照練習簿比例，增加高度以容納簽名處
  const width = 525
  const height = 650
  canvas.width = width
  canvas.height = height

  // 設定白色背景
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // 左側寶可夢主題區域
  const leftPanelWidth = 50
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, leftPanelWidth, height)

  // 移除寶可夢主題標題

  // 移除寶可夢emoji

  // 先模擬右側文字分行，計算每個文學元素的起始行
  const textLines = inputText.value.trim().split('\n')
  const literaryElements = ['顏色', '形容', '地點', '動態', '修辭']
  let elementStartRows: ElementRowInfo[] = []
  let simulatedRow = 0
  const maxRows = 13 // 預定義最大行數

  // 模擬右側分行邏輯
  textLines.forEach((line, lineIndex) => {
    if (simulatedRow >= maxRows || lineIndex >= literaryElements.length) return

    const lineChars = line.split('')
    const startRow = simulatedRow

    // 計算這一行文字需要多少行來顯示
    for (let charIndex = 0; charIndex < lineChars.length; ) {
      if (simulatedRow >= maxRows) break

      const availableCols = simulatedRow < 6 ? 7 : 11
      charIndex += availableCols
      simulatedRow++
    }

    const endRow = simulatedRow - 1
    const middleRow = Math.floor((startRow + endRow) / 2)

    elementStartRows.push({
      element: literaryElements[lineIndex],
      startRow: startRow,
      endRow: endRow,
      middleRow: middleRow
    })
  })

  // 繪製文學元素說明，對應實際的起始行
  ctx.fillStyle = '#666'
  ctx.font = '16px Arial'
  ctx.textAlign = 'left'
  const rightGridStartY = 65
  const cellSize = 40

  elementStartRows.forEach(item => {
    const correspondingRowY = rightGridStartY + item.startRow * cellSize + cellSize/2
    ctx.fillText(item.element, 20, correspondingRowY + 5)
  })

  // 右側田字格練習區域
  const rightStartX = leftPanelWidth + 20
  const cols = 11
  const rows = 13

  // 按行處理文字（使用已定義的 textLines）
  let currentRow = 0

  textLines.forEach((line, lineIndex) => {
    if (currentRow >= rows) return // 超出範圍就停止

    const lineChars = line.split('')

    // 每行最多7或10個字，超過的字換到下一行
    for (let charIndex = 0; charIndex < lineChars.length; ) {
      if (currentRow >= rows) break

      // 前6行預留最後4格給貼卡片，每行最多7個字；第7行開始可以用完整11格
      const availableCols = currentRow < 6 ? 7 : 11
      const rowChars = lineChars.slice(charIndex, charIndex + availableCols)
      charIndex += availableCols

      for (let col = 0; col < cols; col++) {
        const x = rightStartX + col * cellSize
        const y = 65 + currentRow * cellSize

        // 繪製田字格（貼卡片區域只繪製外框）
        const isCardArea = currentRow < 6 && col >= 7
        drawGameModeGrid(ctx, x, y, cellSize, isCardArea, currentRow, col)

        // 前6行的最後4格繪製卡片預留區域
        if (currentRow < 6 && col >= 7) {
          // 合併區域的背景在drawGameModeGrid中處理
        } else if (col < rowChars.length) {
          // 繪製範例字（淡色）
          ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'
          ctx.font = `${cellSize * 0.6}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(rowChars[col], x + cellSize/2, y + cellSize/2)
        }
      }
      currentRow++
    }

  })

  // 填充剩餘的空白格子
  for (let row = currentRow; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = rightStartX + col * cellSize
      const y = 65 + row * cellSize
      const isCardArea = row < 4 && col >= 7
      drawGameModeGrid(ctx, x, y, cellSize, isCardArea, row, col)

      // 如果是前4行的貼卡片區域，繪製背景（除了合併區域的起始格）
      if (row < 4 && col >= 7 && !(row === 0 && col === 7)) {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)'
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
      }
    }
  }

  // 繪製標題（置左）
  ctx.fillStyle = '#333'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('字樂園', 10, 30)

  // 繪製寶可夢主題標題（右側區域對齊）
  const pokemonEmojis: { [key: string]: string } = {
    '皮卡丘': '⚡',
    '小火龍': '🔥',
    '傑尼龜': '💧',
    '妙蛙種子': '🌱'
  }
  const pokemonEmoji = pokemonEmojis[pokemonTheme.value] || '⚡'
  ctx.fillStyle = '#666'
  ctx.font = 'bold 18px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`${pokemonTheme.value}主題 ${pokemonEmoji}`, rightStartX, 30)

  // 繪製姓名和日期填寫處（與皮卡丘主題同一行）
  ctx.fillStyle = '#666'
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'

  // 計算表格右上角位置
  const tableRightX = rightStartX + cols * cellSize
  const tableTopY = 65

  // 姓名和日期與皮卡丘主題同一行（y=30）
  const sameRowY = 30

  // 姓名填寫處
  ctx.fillText('姓名：', tableRightX - 220, sameRowY)
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(tableRightX - 180, sameRowY + 2)
  ctx.lineTo(tableRightX - 130, sameRowY + 2)
  ctx.stroke()

  // 日期填寫處（同一行，右邊一點）
  ctx.fillText('日期：', tableRightX - 110, sameRowY)
  ctx.beginPath()
  ctx.moveTo(tableRightX - 70, sameRowY + 2)
  ctx.lineTo(tableRightX - 20, sameRowY + 2)
  ctx.stroke()

  // 繪製表格右下角家長簽名處
  const tableBottomY = tableTopY + rows * cellSize
  ctx.fillStyle = '#666'
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('家長簽名：', tableRightX - 200, tableBottomY + 30)
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(tableRightX - 130, tableBottomY + 32)
  ctx.lineTo(tableRightX - 20, tableBottomY + 32)
  ctx.stroke()
}

// 遊戲模式田字格繪製
const drawGameModeGrid = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isCardArea: boolean = false, row: number = 0, col: number = 0) => {

  if (isCardArea) {
    // 貼卡片區域：繪製合併儲存格效果
    if (row === 0 && col === 7) {
      // 繪製合併區域的大外框（4x6的區域）
      const mergedWidth = size * 4  // 4列
      const mergedHeight = size * 6 // 6行

      // 繪製背景
      ctx.fillStyle = 'rgba(200, 200, 200, 0.2)'
      ctx.fillRect(x, y, mergedWidth, mergedHeight)

      // 繪製外框
      ctx.strokeStyle = '#d4794a'
      ctx.lineWidth = 1.5
      ctx.setLineDash([]) // 實線
      ctx.strokeRect(x, y, mergedWidth, mergedHeight)

      // 繪製「黏貼卡片處」文字（置中）
      ctx.fillStyle = 'rgba(150, 150, 150, 0.7)'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('黏貼卡片處', x + mergedWidth/2, y + mergedHeight/2)
    }
    // 其他貼卡片區域的格子不繪製邊框
  } else {
    // 一般區域：繪製田字格

    // 外框（實線，毛筆宣紙紅色）
    ctx.strokeStyle = '#d4794a'
    ctx.lineWidth = 1.5
    ctx.setLineDash([]) // 實線
    ctx.strokeRect(x, y, size, size)

    // 田字格內部線條（虛線，淺紅色）
    ctx.strokeStyle = '#e6b088'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3]) // 虛線
    ctx.beginPath()
    // 水平線
    ctx.moveTo(x, y + size/2)
    ctx.lineTo(x + size, y + size/2)
    // 垂直線
    ctx.moveTo(x + size/2, y)
    ctx.lineTo(x + size/2, y + size)
    ctx.stroke()

    // 恢復實線設定
    ctx.setLineDash([])
  }
}

// 遊戲模式高解析度下載生成
const generateGameModeDownload = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  // 使用更高解析度 - 2倍大小
  const scaleFactor = 2
  const width = 525 * scaleFactor
  const height = 650 * scaleFactor
  canvas.width = width
  canvas.height = height

  // 縮放context
  ctx.scale(scaleFactor, scaleFactor)

  // 基本上複製generateGameModePreview的邏輯
  // 設定白色背景
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width / scaleFactor, height / scaleFactor)

  // 使用相同邏輯但調整後的尺寸
  const leftPanelWidth = 50
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, leftPanelWidth, height / scaleFactor)

  // 複製所有遊戲模式邏輯...
  const textLines = inputText.value.trim().split('\n')
  const literaryElements = ['顏色', '形容', '地點', '動態', '修辭']
  let elementStartRows: ElementRowInfo[] = []
  let simulatedRow = 0
  const maxRows = 13
  const rightGridStartY = 65
  const cellSize = 40
  const cols = 11
  const rows = 13
  const rightStartX = leftPanelWidth + 20

  // 模擬分行邏輯...
  textLines.forEach((line, lineIndex) => {
    if (simulatedRow >= maxRows || lineIndex >= literaryElements.length) return

    const lineChars = line.split('')
    const startRow = simulatedRow

    for (let charIndex = 0; charIndex < lineChars.length; ) {
      if (simulatedRow >= maxRows) break

      const availableCols = simulatedRow < 6 ? 7 : 11
      charIndex += availableCols
      simulatedRow++
    }

    const endRow = simulatedRow - 1
    const middleRow = Math.floor((startRow + endRow) / 2)

    elementStartRows.push({
      element: literaryElements[lineIndex],
      startRow: startRow,
      endRow: endRow,
      middleRow: middleRow
    })
  })

  // 繪製文學元素
  ctx.fillStyle = '#666'
  ctx.font = '16px Arial'
  ctx.textAlign = 'left'

  elementStartRows.forEach(item => {
    const correspondingRowY = rightGridStartY + item.startRow * cellSize + cellSize/2
    ctx.fillText(item.element, 20, correspondingRowY + 5)
  })

  // 繪製表格和內容...
  let currentRow = 0
  textLines.forEach((line, lineIndex) => {
    if (currentRow >= rows) return

    const lineChars = line.split('')

    for (let charIndex = 0; charIndex < lineChars.length; ) {
      if (currentRow >= rows) break

      const availableCols = currentRow < 4 ? 7 : 11
      const rowChars = lineChars.slice(charIndex, charIndex + availableCols)
      charIndex += availableCols

      for (let col = 0; col < cols; col++) {
        const x = rightStartX + col * cellSize
        const y = 65 + currentRow * cellSize

        const isCardArea = currentRow < 4 && col >= 7
        drawGameModeGrid(ctx, x, y, cellSize, isCardArea, currentRow, col)

        if (currentRow < 4 && col >= 7) {
          // 貼卡片區域
        } else if (col < rowChars.length) {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'
          ctx.font = `${cellSize * 0.6}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(rowChars[col], x + cellSize/2, y + cellSize/2)
        }
      }
      currentRow++
    }

  })

  // 填充空白格子
  for (let row = currentRow; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = rightStartX + col * cellSize
      const y = 65 + row * cellSize
      const isCardArea = row < 4 && col >= 7
      drawGameModeGrid(ctx, x, y, cellSize, isCardArea, row, col)
    }
  }

  // 繪製標題和填寫處
  ctx.fillStyle = '#333'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('字樂園', 10, 30)

  const pokemonEmojis: { [key: string]: string } = {
    '皮卡丘': '⚡',
    '小火龍': '🔥',
    '傑尼龜': '💧',
    '妙蛙種子': '🌱'
  }
  const pokemonEmoji = pokemonEmojis[pokemonTheme.value] || '⚡'
  ctx.fillStyle = '#666'
  ctx.font = 'bold 18px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`${pokemonTheme.value}主題 ${pokemonEmoji}`, rightStartX, 30)

  // 姓名和日期
  const tableRightX = rightStartX + cols * cellSize
  const tableTopY = 65
  const sameRowY = 30

  ctx.fillStyle = '#666'
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'

  ctx.fillText('姓名：', tableRightX - 220, sameRowY)
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(tableRightX - 180, sameRowY + 2)
  ctx.lineTo(tableRightX - 130, sameRowY + 2)
  ctx.stroke()

  ctx.fillText('日期：', tableRightX - 110, sameRowY)
  ctx.beginPath()
  ctx.moveTo(tableRightX - 70, sameRowY + 2)
  ctx.lineTo(tableRightX - 20, sameRowY + 2)
  ctx.stroke()

  // 家長簽名處
  const tableBottomY = tableTopY + rows * cellSize
  ctx.fillText('家長簽名：', tableRightX - 200, tableBottomY + 30)
  ctx.beginPath()
  ctx.moveTo(tableRightX - 130, tableBottomY + 32)
  ctx.lineTo(tableRightX - 20, tableBottomY + 32)
  ctx.stroke()

  // 下載
  const link = document.createElement('a')
  link.download = `字樂園_${pokemonTheme.value}主題_練習表.png`
  link.href = canvas.toDataURL()
  link.click()
}

const downloadImage = async () => {
  if (!hasPreview.value || !inputText.value.trim()) return

  // 創建一個新的高解析度 canvas 用於下載
  const downloadCanvas = document.createElement('canvas')
  const ctx = downloadCanvas.getContext('2d')
  if (!ctx) return

  // 檢查是否為遊戲模式
  if (isGameMode.value) {
    // 檢查遊戲模式字符並記錄未知字符
    const allChars = inputText.value.trim().split('').slice(0, 108)
    await checkAndRecordUnknownCharacters(allChars)

    // 遊戲模式：使用相同的生成邏輯但更高解析度
    generateGameModeDownload(downloadCanvas, ctx)
    return
  }

  // 準備要練習的字符，限制最大 108 個字符以配合格子數
  const allChars = inputText.value.trim().split('').slice(0, 108)

  // 檢查字典並記錄未知字符
  await checkAndRecordUnknownCharacters(allChars)

  // 將字符分割成每行指定數量的格子（每個字符佔1格）
  const charLines: string[][] = []
  for (let i = 0; i < allChars.length; i += charsPerLine.value) {
    charLines.push(allChars.slice(i, i + charsPerLine.value))
  }

  // 計算所需畫布尺寸 - 使用更大的格子用於下載
  const cellSize = 136  // 增加70% (80 * 1.7 = 136)
  const zhuyinCellWidth = cellSize * 0.5  // 注音格寬度為字符格的一半
  const margin = 68     // 相應增加邊距
  const totalRows = charLines.length * repeatCount.value

  // 計算總寬度：每個字符佔用(字符格+注音格)的寬度
  const width = margin * 2 + charsPerLine.value * (cellSize + zhuyinCellWidth)
  const height = margin * 2 + totalRows * cellSize

  downloadCanvas.width = width
  downloadCanvas.height = height

  // 清空畫布
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // 設定基本參數
  const startX = margin
  const startY = margin

  let currentRow = 0

  // 對每個字符行進行處理
  charLines.forEach((lineChars, lineIndex) => {
    // 每個字符行重複指定次數
    for (let repeatIndex = 0; repeatIndex < repeatCount.value; repeatIndex++) {
      const rowY = startY + currentRow * cellSize

      // 在當前行中，為每個字符繪製字符格和注音格
      for (let col = 0; col < charsPerLine.value; col++) {
        if (col < lineChars.length) {
          const char = lineChars[col]
          const charX = startX + col * (cellSize + zhuyinCellWidth)

          // 繪製字符格（左邊）
          drawGridDownload(ctx, charX, rowY, cellSize, gridType.value)

          // 在字符格中繪製浮水印
          ctx.fillStyle = 'rgba(150, 150, 150, 0.6)'
          ctx.font = `${cellSize * 0.6}px '${selectedFont.value}', 'Microsoft YaHei', Arial, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(char, charX + cellSize/2, rowY + cellSize/2)

          // 繪製注音格（右邊）
          const zhuyinX = charX + cellSize
          drawZhuyinGridDownload(ctx, zhuyinX, rowY, zhuyinCellWidth, cellSize)

          // 如果啟用注音，在注音格中垂直繪製注音
          if (showZhuyin.value) {
            const zhuyinParts = getZhuyinParts(char)
            const partHeight = cellSize / (zhuyinParts.length + 1)

            // 如果只有兩個部分，往下偏移
            const verticalOffset = zhuyinParts.length === 2 ? partHeight * 0.3 : 0

            zhuyinParts.forEach((part, index) => {
              ctx.fillStyle = '#000'
              ctx.font = `${Math.min(zhuyinCellWidth * 0.6, partHeight * 0.8)}px Arial`
              ctx.textBaseline = 'middle'
              const y = rowY + partHeight * (index + 1) + verticalOffset

              // 判斷是否包含聲調符號
              const hasTone = part.includes('ˊ') || part.includes('ˇ') || part.includes('ˋ')

              if (hasTone) {
                // 有聲調的情況，分開繪製主符號和聲調
                const mainChar = part.slice(0, -1)  // 主符號
                const toneChar = part.slice(-1)     // 聲調符號

                // 主符號置中
                ctx.textAlign = 'center'
                ctx.fillText(mainChar, zhuyinX + zhuyinCellWidth/2, y)

                // 聲調在右邊
                ctx.textAlign = 'left'
                ctx.fillText(toneChar, zhuyinX + zhuyinCellWidth * 0.7, y)
              } else {
                // 無聲調的情況，正常置中
                ctx.textAlign = 'center'
                ctx.fillText(part, zhuyinX + zhuyinCellWidth/2, y)
              }
            })
          }
        } else {
          // 空白格子
          const charX = startX + col * (cellSize + zhuyinCellWidth)
          drawGridDownload(ctx, charX, rowY, cellSize, gridType.value)
          drawZhuyinGridDownload(ctx, charX + cellSize, rowY, zhuyinCellWidth, cellSize)
        }
      }

      currentRow++
    }
  })

  // 下載圖片
  const link = document.createElement('a')
  link.download = `練習表_${new Date().toLocaleDateString()}.png`
  link.href = downloadCanvas.toDataURL()
  link.click()
}

// 為下載功能創建專用的注音格繪製函數
const drawZhuyinGridDownload = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
  const user = userStore.currentUser
  const isKindergartenOrElementary = user?.gradeLevel === 'kindergarten' || user?.gradeLevel === 'elementary-low'

  // 如果是幼稚園或低年級，使用宣紙紅色，否則使用黑色
  ctx.strokeStyle = isKindergartenOrElementary ? '#d4794a' : '#000'
  ctx.lineWidth = 5
  ctx.strokeRect(x, y, width, height)
}

// 為下載功能創建專用的格子繪製函數
const drawGridDownload = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: string) => {
  const user = userStore.currentUser
  const isKindergartenOrElementary = user?.gradeLevel === 'kindergarten' || user?.gradeLevel === 'elementary-low'

  // 如果是幼稚園或低年級，添加淡色背景
  if (isKindergartenOrElementary) {
    ctx.fillStyle = 'rgba(212, 121, 74, 0.1)'  // 宣紙紅色背景
    ctx.fillRect(x, y, size, size)
  }

  // 如果是幼稚園或低年級，使用宣紙紅色，否則使用黑色
  ctx.strokeStyle = isKindergartenOrElementary ? '#d4794a' : '#000'
  ctx.lineWidth = 5  // 相應增加線條粗細 (3 * 1.7 = 5)

  // 繪製外框
  ctx.strokeRect(x, y, size, size)

  if (type === 'tian') {
    // 田字格中間十字線使用虛線
    ctx.save()

    // 如果是幼稚園或低年級，使用宣紙紅色虛線，否則使用黑色虛線
    ctx.strokeStyle = isKindergartenOrElementary ? '#d4794a' : '#000'
    ctx.lineWidth = 3  // 下載版本稍粗一些
    ctx.setLineDash([8, 8])  // 下載版本虛線稍長

    ctx.beginPath()
    // 水平線
    ctx.moveTo(x, y + size/2)
    ctx.lineTo(x + size, y + size/2)
    // 垂直線
    ctx.moveTo(x + size/2, y)
    ctx.lineTo(x + size/2, y + size)
    ctx.stroke()

    ctx.restore()
  } else if (type === 'mi') {
    // 米字格內部線條使用虛線
    ctx.save()

    // 如果是幼稚園或低年級，使用宣紙紅色虛線，否則使用黑色虛線
    ctx.strokeStyle = isKindergartenOrElementary ? '#d4794a' : '#000'
    ctx.lineWidth = 3  // 下載版本稍粗一些
    ctx.setLineDash([8, 8])  // 下載版本虛線稍長

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

    ctx.restore()
  }
  // simple 格式只有外框，不需要額外線條
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
  margin-bottom: 20px;
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
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 60vh;
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
  margin-top: 15px;
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
  margin-top: 10px;
  margin-bottom: 20px;
  max-height: 425px;
  overflow: hidden;
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
  border: 1px solid #ddd;
  border-radius: 8px;
  transform: scale(0.55);
  transform-origin: center top;
}

.no-preview {
  text-align: center;
  color: #666;
  padding: 40px 20px;
  font-style: italic;
  background: #f8f9fa;
  border: 1px dashed #ddd;
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