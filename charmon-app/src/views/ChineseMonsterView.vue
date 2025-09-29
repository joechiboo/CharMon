<template>
  <div class="matrix-container">
    <!-- Matrix Rain Background -->
    <div class="matrix-rain">
      <div
        v-for="i in 15"
        :key="i"
        class="falling-zhuyin"
        :style="{
          left: randomPositions[i] + '%',
          animationDelay: randomDelays[i] + 's',
          animationDuration: randomDurations[i] + 's'
        }"
      >
        {{ getRandomZhuyin() }}
      </div>
    </div>

    <div class="content-wrapper">
      <div class="game-header">
        <h1 class="matrix-title">中文怪物 - 聲調測驗</h1>
        <p class="matrix-subtitle">進入注音符號的數位世界</p>
      </div>

      <div class="game-content">
        <div class="game-description" v-if="!gameStarted">
          <div class="description-box">
            <p>🎯 挑戰目標：判斷句子中指定字的正確聲調</p>
            <p>📝 遊戲方式：系統會顯示一個句子，全部的字都需要標註聲調</p>
            <p>🎮 選擇正確聲調（一聲、二聲、三聲、四聲或輕聲）</p>
            <p>✅ 答對顯示綠色提示，答錯顯示紅色提示</p>
            <p>🏆 完成5題挑戰，看看你能得幾分！</p>
          </div>
          <button @click="startQuiz" class="start-game-btn">
            開始遊戲
          </button>
        </div>

        <div v-if="gameStarted" class="tone-quiz">
          <div class="quiz-header">
            <div class="game-title-info">
              <span class="game-icon">🐉</span>
              <span class="game-name">中文怪物聲調測驗</span>
            </div>
            <div class="progress-info">
              題目 {{ currentQuestionIndex + 1 }} / 5
            </div>
          </div>

          <div class="quiz-area">
            <div class="sentence-container">
              <p class="sentence-text">
                <span v-for="(charState, idx) in characterStates" :key="idx"
                      :class="{
                        'current-char': idx === currentCharIndex && !sentenceCompleted && charState.correctTone !== 0,
                        'completed-char': charState.isCorrect === true,
                        'incorrect-char': charState.isCorrect === false,
                        'punctuation-char': charState.correctTone === 0
                      }">
                  {{ charState.char }}
                </span>
              </p>
            </div>

            <div class="question-prompt" v-if="!sentenceCompleted">
              請選擇「{{ characterStates[currentCharIndex]?.char }}」的正確聲調
              ({{ characterStates.filter((char, idx) => idx <= currentCharIndex && char.correctTone !== 0).length }}/{{ characterStates.filter(char => char.correctTone !== 0).length }})
            </div>

            <div class="completion-prompt" v-else>
              句子完成！點擊下一題繼續
            </div>

            <div class="tone-options" v-if="!sentenceCompleted">
              <button
                v-for="tone in tones"
                :key="tone.value"
                class="tone-btn"
                @click="selectTone(tone.value)"
              >
                {{ tone.label }}
              </button>
            </div>

            <div v-if="answered && !gameEnded" class="answer-feedback" :class="feedbackClass">
              <div class="feedback-message">{{ feedbackMessage }}</div>
              <button @click="nextQuestion" class="next-btn">
                {{ currentQuestionIndex < 4 ? '下一題' : '查看結果' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="gameEnded" class="game-result-overlay">
          <div class="game-result">
            <h2>🎉 測驗完成！</h2>
            <p class="final-score">最終得分：{{ score }} / 5</p>
            <div class="score-rating">
              <span v-if="score === 5">🏆 完美！</span>
              <span v-else-if="score >= 4">🌟 優秀！</span>
              <span v-else-if="score >= 3">👍 不錯！</span>
              <span v-else-if="score >= 2">💪 繼續努力！</span>
              <span v-else>📚 多多練習！</span>
            </div>
            <div class="result-buttons">
              <button @click="restartGame" class="restart-btn">再玩一次</button>
              <router-link to="/games" class="home-btn">回到首頁</router-link>
            </div>
          </div>
        </div>
      </div>

      <router-link to="/games" class="back-btn" v-if="!gameEnded">
        ← 返回遊戲選擇
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'


interface Sentence {
  text: string
  characters: Array<{
    char: string
    tone: number
  }>
}

interface CharacterState {
  char: string
  selectedTone: number | null
  correctTone: number
  isCorrect: boolean | null
}

// 注音符號列表
const zhuyinSymbols = [
  'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ',
  'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ',
  'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄧ', 'ㄨ', 'ㄩ',
  'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ',
  'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ'
]

// 隨機位置、延遲和持續時間
const randomPositions = ref<number[]>([])
const randomDelays = ref<number[]>([])
const randomDurations = ref<number[]>([])

// 初始化隨機值
for (let i = 0; i < 15; i++) {
  randomPositions.value.push(Math.random() * 95)
  randomDelays.value.push(Math.random() * 4)
  randomDurations.value.push(5 + Math.random() * 4)
}


const tones = [
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '輕' }
]

// 題庫 - 原本完整的句子
const sentenceBank = [
  { text: '飛機即將降落至桃園國際機場', characters: [
    { char: '飛', tone: 1 }, { char: '機', tone: 1 }, { char: '即', tone: 2 }, { char: '將', tone: 1 },
    { char: '降', tone: 4 }, { char: '落', tone: 4 }, { char: '至', tone: 4 }, { char: '桃', tone: 2 },
    { char: '園', tone: 2 }, { char: '國', tone: 2 }, { char: '際', tone: 4 }, { char: '機', tone: 1 },
    { char: '場', tone: 3 }
  ]},
  { text: '歡迎光臨，會員卡累積滿五十點送馬卡龍', characters: [
    { char: '歡', tone: 1 }, { char: '迎', tone: 2 }, { char: '光', tone: 1 }, { char: '臨', tone: 2 },
    { char: '，', tone: 0 }, { char: '會', tone: 4 }, { char: '員', tone: 2 }, { char: '卡', tone: 3 },
    { char: '累', tone: 3 }, { char: '積', tone: 1 }, { char: '滿', tone: 3 }, { char: '五', tone: 3 },
    { char: '十', tone: 2 }, { char: '點', tone: 3 }, { char: '送', tone: 4 }, { char: '馬', tone: 3 },
    { char: '卡', tone: 3 }, { char: '龍', tone: 2 }
  ]},
  { text: '我的統一編號是95341627', characters: [
    { char: '我', tone: 3 }, { char: '的', tone: 5 }, { char: '統', tone: 3 }, { char: '一', tone: 1 },
    { char: '編', tone: 1 }, { char: '號', tone: 4 }, { char: '是', tone: 4 }, { char: '9', tone: 3 },
    { char: '5', tone: 3 }, { char: '3', tone: 1 }, { char: '4', tone: 4 }, { char: '1', tone: 1 },
    { char: '6', tone: 4 }, { char: '2', tone: 4 }, { char: '7', tone: 1 }
  ]},
  { text: '後方商品需要加購嗎？比較划算', characters: [
    { char: '後', tone: 4 }, { char: '方', tone: 1 }, { char: '商', tone: 1 }, { char: '品', tone: 3 },
    { char: '需', tone: 1 }, { char: '要', tone: 4 }, { char: '加', tone: 1 }, { char: '購', tone: 4 },
    { char: '嗎', tone: 5 }, { char: '？', tone: 0 }, { char: '比', tone: 3 }, { char: '較', tone: 4 },
    { char: '划', tone: 2 }, { char: '算', tone: 4 }
  ]},
  { text: '卡比寶寶吃水餃', characters: [
    { char: '卡', tone: 3 }, { char: '比', tone: 3 }, { char: '寶', tone: 3 }, { char: '寶', tone: 5 },
    { char: '吃', tone: 1 }, { char: '水', tone: 3 }, { char: '餃', tone: 3 }
  ]},
  { text: '你算老幾？你們年輕人真的不懂事', characters: [
    { char: '你', tone: 3 }, { char: '算', tone: 4 }, { char: '老', tone: 3 }, { char: '幾', tone: 3 },
    { char: '？', tone: 0 }, { char: '你', tone: 3 }, { char: '們', tone: 5 }, { char: '年', tone: 2 },
    { char: '輕', tone: 1 }, { char: '人', tone: 2 }, { char: '真', tone: 1 }, { char: '的', tone: 5 },
    { char: '不', tone: 4 }, { char: '懂', tone: 3 }, { char: '事', tone: 4 }
  ]},
  { text: '等你當爸媽你就會懂了', characters: [
    { char: '等', tone: 3 }, { char: '你', tone: 3 }, { char: '當', tone: 1 }, { char: '爸', tone: 4 },
    { char: '媽', tone: 1 }, { char: '你', tone: 3 }, { char: '就', tone: 4 }, { char: '會', tone: 4 },
    { char: '懂', tone: 3 }, { char: '了', tone: 5 }
  ]},
  { text: '我喜歡吃臭豆腐', characters: [
    { char: '我', tone: 3 }, { char: '喜', tone: 3 }, { char: '歡', tone: 1 }, { char: '吃', tone: 1 },
    { char: '臭', tone: 4 }, { char: '豆', tone: 4 }, { char: '腐', tone: 3 }
  ]},
  { text: '你為什麼會來台灣？', characters: [
    { char: '你', tone: 3 }, { char: '為', tone: 4 }, { char: '什', tone: 2 }, { char: '麼', tone: 5 },
    { char: '會', tone: 4 }, { char: '來', tone: 2 }, { char: '台', tone: 2 }, { char: '灣', tone: 1 },
    { char: '？', tone: 0 }
  ]}
]

const gameStarted = ref(false)
const currentQuestionIndex = ref(0)
const currentSentence = ref<Sentence>(sentenceBank[0])
const characterStates = ref<CharacterState[]>([])
const currentCharIndex = ref(0)
const score = ref(0)
const answered = ref(false)
const feedbackMessage = ref('')
const feedbackClass = ref('')
const gameEnded = ref(false)
const selectedQuestions = ref<Sentence[]>([])
const sentenceCompleted = ref(false)

const getRandomZhuyin = () => {
  return zhuyinSymbols[Math.floor(Math.random() * zhuyinSymbols.length)]
}


const initializeCharacterStates = (sentence: Sentence) => {
  characterStates.value = sentence.characters.map(char => ({
    char: char.char,
    selectedTone: char.tone === 0 ? 0 : null, // 標點符號自動設為0（跳過）
    correctTone: char.tone,
    isCorrect: char.tone === 0 ? true : null // 標點符號自動算對
  }))

  // 找到第一個需要填寫的字
  currentCharIndex.value = characterStates.value.findIndex(char => char.correctTone !== 0)
  if (currentCharIndex.value === -1) {
    currentCharIndex.value = 0
  }

  sentenceCompleted.value = false
}

const startQuiz = () => {
  gameStarted.value = true
  score.value = 0
  currentQuestionIndex.value = 0
  gameEnded.value = false

  // 從題庫中隨機選5題
  const shuffled = [...sentenceBank].sort(() => Math.random() - 0.5)
  selectedQuestions.value = shuffled.slice(0, 5)
  currentSentence.value = selectedQuestions.value[0]
  initializeCharacterStates(currentSentence.value)
}

const selectTone = (tone: number) => {
  if (answered.value || sentenceCompleted.value) return

  const currentChar = characterStates.value[currentCharIndex.value]
  currentChar.selectedTone = tone
  currentChar.isCorrect = tone === currentChar.correctTone

  if (currentChar.isCorrect) {
    score.value++
  }

  // 找到下一個需要填寫的字（跳過標點符號）
  let nextIndex = currentCharIndex.value + 1
  while (nextIndex < characterStates.value.length && characterStates.value[nextIndex].correctTone === 0) {
    nextIndex++
  }

  if (nextIndex < characterStates.value.length) {
    currentCharIndex.value = nextIndex
  } else {
    // 句子完成
    sentenceCompleted.value = true
    answered.value = true

    // 計算句子完成度（不包含標點符號）
    const validChars = characterStates.value.filter(char => char.correctTone !== 0)
    const correctCount = validChars.filter(char => char.isCorrect).length
    const totalCount = validChars.length

    if (correctCount === totalCount) {
      feedbackMessage.value = '完美'
      feedbackClass.value = 'correct'
    } else {
      feedbackMessage.value = `${correctCount}/${totalCount}`
      feedbackClass.value = 'incorrect'
    }
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < 4) {
    currentQuestionIndex.value++
    currentSentence.value = selectedQuestions.value[currentQuestionIndex.value]
    initializeCharacterStates(currentSentence.value)
    answered.value = false
    feedbackMessage.value = ''
    feedbackClass.value = ''
  } else {
    // 第五題結束，直接顯示結果
    answered.value = false
    feedbackMessage.value = ''
    feedbackClass.value = ''
    gameEnded.value = true
  }
}

const restartGame = () => {
  gameStarted.value = false
  currentQuestionIndex.value = 0
  currentCharIndex.value = 0
  score.value = 0
  answered.value = false
  feedbackMessage.value = ''
  feedbackClass.value = ''
  gameEnded.value = false
  sentenceCompleted.value = false
  characterStates.value = []
}
</script>

<style scoped>
.matrix-container {
  min-height: 100vh;
  background: #000;
  color: #00ff00;
  position: relative;
  overflow: hidden;
  font-family: 'Courier New', monospace;
}

/* Matrix Rain Effect */
.matrix-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.15;
}

.matrix-column {
  position: absolute;
  top: -100%;
  font-size: 20px;
  line-height: 1;
  animation: matrix-fall linear infinite;
}

@keyframes matrix-fall {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(100vh);
  }
}

.zhuyin-char {
  display: block;
  color: #00ff00;
  text-shadow: 0 0 8px #00ff00;
  margin: 4px 0;
  opacity: 0.8;
}

/* Content */
.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-header {
  text-align: center;
  margin-bottom: 40px;
}

.matrix-title {
  font-size: 3rem;
  color: #00ff00;
  text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;
  margin-bottom: 10px;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;
  }
  50% {
    text-shadow: 0 0 30px #00ff00, 0 0 60px #00ff00, 0 0 80px #00ff00;
  }
}

.matrix-subtitle {
  font-size: 1.2rem;
  color: #00ff00;
  opacity: 0.8;
}

.game-content {
  width: 100%;
  max-width: 1200px;
}

/* Monster Selection */
.monster-selection {
  text-align: center;
}

.section-title {
  font-size: 2rem;
  color: #00ff00;
  margin-bottom: 30px;
  text-shadow: 0 0 10px #00ff00;
}

.monster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.monster-card {
  background: rgba(0, 255, 0, 0.05);
  border: 2px solid #00ff00;
  border-radius: 10px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
}

.monster-card:hover {
  background: rgba(0, 255, 0, 0.1);
  transform: translateY(-5px);
  box-shadow: 0 0 40px rgba(0, 255, 0, 0.4);
}

.monster-emoji {
  font-size: 4rem;
  margin-bottom: 15px;
}

.monster-name {
  font-size: 1.5rem;
  color: #00ff00;
  margin-bottom: 10px;
  text-shadow: 0 0 5px #00ff00;
}

.monster-ability {
  font-size: 1rem;
  color: #00ff00;
  opacity: 0.7;
}

/* Quiz Area */
.tone-quiz {
  max-width: 800px;
  margin: 0 auto;
}

.game-title-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.game-icon {
  font-size: 2rem;
}

.game-name {
  font-size: 1.2rem;
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

.matrix-btn-small {
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.matrix-btn-small:hover {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

/* Game Description */
.game-description {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.description-box {
  background: rgba(0, 255, 0, 0.05);
  border: 2px solid #00ff00;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: left;
}

.description-box p {
  color: #00ff00;
  font-size: 1.2rem;
  margin-bottom: 15px;
  line-height: 1.6;
}

.start-game-btn {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  text-shadow: 0 0 5px #00ff00;
}

.start-game-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
}

/* Quiz Header */
.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px;
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid #00ff00;
  border-radius: 10px;
}

.progress-info {
  color: #00ff00;
  font-size: 1.2rem;
  text-shadow: 0 0 5px #00ff00;
}

/* Sentence Display */
.sentence-container {
  margin-bottom: 30px;
}

.sentence-text {
  font-size: 2.5rem;
  color: #00ff00;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 20px;
  text-shadow: 0 0 15px #00ff00;
}

.current-char {
  background: rgba(255, 255, 0, 0.4);
  padding: 5px 10px;
  border-radius: 8px;
  border: 2px solid #ffff00;
  animation: current-pulse 2s infinite;
}

.completed-char {
  background: rgba(0, 255, 0, 0.3);
  padding: 5px 10px;
  border-radius: 8px;
  border: 2px solid #00ff00;
  position: relative;
}

.completed-char::after {
  content: '✓';
  position: absolute;
  top: -5px;
  right: -5px;
  background: #00ff00;
  color: #000;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.incorrect-char {
  background: rgba(255, 0, 0, 0.3);
  padding: 5px 10px;
  border-radius: 8px;
  border: 2px solid #ff0000;
  position: relative;
}

.incorrect-char::after {
  content: '✗';
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff0000;
  color: #fff;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.punctuation-char {
  padding: 5px 10px;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes current-pulse {
  0%, 100% {
    background: rgba(255, 255, 0, 0.4);
    box-shadow: 0 0 15px rgba(255, 255, 0, 0.5);
  }
  50% {
    background: rgba(255, 255, 0, 0.6);
    box-shadow: 0 0 25px rgba(255, 255, 0, 0.8);
  }
}

.question-prompt, .completion-prompt {
  color: #00ff00;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 0 0 10px #00ff00;
}

.completion-prompt {
  font-size: 1.8rem;
  animation: completion-glow 2s ease-in-out infinite;
}

@keyframes completion-glow {
  0%, 100% {
    text-shadow: 0 0 10px #00ff00;
  }
  50% {
    text-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00;
  }
}

/* Answer Feedback */
.answer-feedback {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-size: 1.5rem;
  font-weight: bold;
}

.answer-feedback.correct {
  background: rgba(0, 255, 0, 0.95);
  color: #fff;
  text-shadow: 0 0 20px #000;
}

.answer-feedback.incorrect {
  background: rgba(255, 0, 0, 0.95);
  color: #fff;
  text-shadow: 0 0 20px #000;
}

.feedback-message {
  margin-bottom: 30px;
  font-size: 16rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.next-btn, .restart-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #000;
  color: #000;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.next-btn:hover, .restart-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

/* Game Result Overlay */
.game-result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-result {
  text-align: center;
  padding: 60px;
  background: rgba(0, 255, 0, 0.1);
  border: 3px solid #00ff00;
  border-radius: 25px;
  box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
}

.game-result h2 {
  color: #00ff00;
  font-size: 4rem;
  margin-bottom: 30px;
  text-shadow: 0 0 30px #00ff00;
  animation: glow-pulse 2s ease-in-out infinite;
}

.final-score {
  color: #00ff00;
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 0 0 20px #00ff00;
}

.score-rating {
  color: #00ff00;
  font-size: 2rem;
  margin-bottom: 40px;
  text-shadow: 0 0 15px #00ff00;
}

.result-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.home-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #000;
  color: #000;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  font-family: inherit;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: inline-block;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.quiz-area {
  background: rgba(0, 255, 0, 0.03);
  border: 2px solid #00ff00;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
}

.quiz-title {
  font-size: 1.8rem;
  color: #00ff00;
  margin-bottom: 30px;
  text-shadow: 0 0 10px #00ff00;
}

.current-word {
  margin-bottom: 40px;
}

.word-display {
  font-size: 5rem;
  color: #00ff00;
  margin-bottom: 20px;
  text-shadow: 0 0 30px #00ff00;
}

.pinyin-display {
  font-size: 2rem;
  color: #00ff00;
  opacity: 0.8;
}

.tone-options {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 0 auto 30px;
  flex-wrap: wrap;
}

.tone-btn {
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 20px 25px;
  border-radius: 10px;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  min-width: 80px;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.tone-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
}

.score-display {
  display: flex;
  justify-content: center;
  gap: 40px;
  font-size: 1.3rem;
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

/* Back Button */
.back-btn {
  display: inline-block;
  margin-top: 40px;
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 12px 30px;
  border-radius: 25px;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px #00ff00;
}

.back-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.4);
}

@media (max-width: 768px) {
  .matrix-title {
    font-size: 2rem;
  }

  .monster-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .word-display {
    font-size: 3rem;
  }

  .tone-options {
    gap: 8px;
    margin: 0 auto 20px;
    flex-wrap: nowrap;
  }

  .tone-btn {
    font-size: 1.8rem;
    padding: 25px 15px;
    min-width: 60px;
    min-height: 75px;
  }
}
</style>
