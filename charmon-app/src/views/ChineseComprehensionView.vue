<template>
  <div class="comprehension-container">
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
        <h1 class="main-title">🐉 中文怪物 - 中文理解</h1>
        <p class="subtitle">聆聽對話，選擇正確答案</p>
      </div>

      <div class="game-content">
        <!-- 遊戲說明 -->
        <div class="game-description" v-if="!gameStarted">
          <div class="description-box">
            <p>🎧 請仔細聆聽語音對話</p>
            <p>🤔 理解對話內容和含義</p>
            <p>✅ 從四個選項中選擇正確答案</p>
            <p>🏆 挑戰 5 題，測試你的中文理解能力！</p>
          </div>
          <button @click="startGame" class="start-game-btn">
            開始測驗
          </button>
        </div>

        <!-- 遊戲進行中 -->
        <div v-else-if="!gameEnded" class="comprehension-quiz">
          <div class="quiz-header">
            <div class="progress-info">
              題目 {{ currentQuestionIndex + 1 }} / 5
            </div>
          </div>

          <div class="dialogue-section">
            <h3 class="dialogue-title">對話內容</h3>
            <div class="dialogue-box">
              <div v-for="(line, index) in currentQuestion.dialogue" :key="index" class="dialogue-line">
                <span class="speaker" :class="line.speaker">{{ line.speaker === 'male' ? '男' : '女' }}：</span>
                <span class="text">{{ line.text }}</span>
              </div>
            </div>

            <div class="audio-controls">
              <button @click="playDialogue" class="play-btn" :disabled="isPlaying">
                {{ isPlaying ? '🔊 播放中...' : '🔊 播放對話' }}
              </button>
              <button @click="stopDialogue" class="stop-btn" v-if="isPlaying">
                ⏹️ 停止播放
              </button>
            </div>
          </div>

          <div class="question-section" v-if="dialogueCompleted">
            <h3 class="question-title">請選擇正確答案：</h3>
            <div class="options-grid">
              <button
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                class="option-btn"
                :class="{
                  'selected': selectedAnswer === index,
                  'correct': answered && index === currentQuestion.correctAnswer,
                  'incorrect': answered && selectedAnswer === index && index !== currentQuestion.correctAnswer
                }"
                @click="selectAnswer(index)"
                :disabled="answered"
              >
                <span class="option-label">{{ ['A', 'B', 'C', 'D'][index] }}.</span>
                <span class="option-text">{{ option }}</span>
              </button>
            </div>

            <div v-if="answered" class="answer-feedback">
              <div class="feedback-message" :class="{ correct: isCorrect, incorrect: !isCorrect }">
                {{ isCorrect ? '✅ 答對了！' : '❌ 答錯了！' }}
              </div>
              <div class="explanation" v-if="currentQuestion.explanation">
                <strong>解析：</strong>{{ currentQuestion.explanation }}
              </div>
              <button @click="nextQuestion" class="next-btn">
                {{ currentQuestionIndex < 4 ? '下一題' : '查看結果' }}
              </button>
            </div>
          </div>

          <div v-else class="listening-prompt">
            <div class="listening-icon">👂</div>
            <p>請先點擊播放按鈕聆聽對話</p>
          </div>
        </div>

        <!-- 遊戲結束 -->
        <div v-else class="game-result">
          <h2>🎉 測驗完成！</h2>
          <div class="final-score">
            <div class="score-display">得分：{{ score }} / 5</div>
            <div class="score-rating">
              <span v-if="score === 5">🏆 完美理解！</span>
              <span v-else-if="score >= 4">🌟 理解力優秀！</span>
              <span v-else-if="score >= 3">👍 理解力不錯！</span>
              <span v-else-if="score >= 2">💪 需要多練習！</span>
              <span v-else>📚 加油練習！</span>
            </div>
          </div>
          <div class="result-buttons">
            <button @click="restartGame" class="restart-btn">再玩一次</button>
            <router-link to="/games" class="home-btn">回到遊戲選擇</router-link>
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
import { ref, computed } from 'vue'

// 注音符號列表
const zhuyinSymbols = [
  'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ',
  'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ',
  'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄧ', 'ㄨ', 'ㄩ',
  'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ',
  'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ'
]

const getRandomZhuyin = () => {
  return zhuyinSymbols[Math.floor(Math.random() * zhuyinSymbols.length)]
}

// Matrix rain 隨機位置
const randomPositions = ref<number[]>([])
const randomDelays = ref<number[]>([])
const randomDurations = ref<number[]>([])

// 初始化隨機值
for (let i = 0; i < 15; i++) {
  randomPositions.value.push(Math.random() * 95)
  randomDelays.value.push(Math.random() * 4)
  randomDurations.value.push(5 + Math.random() * 4)
}

interface DialogueLine {
  speaker: 'male' | 'female'
  text: string
}

interface Question {
  id: number
  dialogue: DialogueLine[]
  options: string[]
  correctAnswer: number
  explanation?: string
}

// 遊戲狀態
const gameStarted = ref(false)
const gameEnded = ref(false)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const answered = ref(false)
const score = ref(0)
const isPlaying = ref(false)
const dialogueCompleted = ref(false)

// 語音合成
let speechSynthesis: SpeechSynthesis | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null

// 題庫
const questions: Question[] = [
  {
    id: 1,
    dialogue: [
      { speaker: 'male', text: '國中會考會考會考會考的東西' },
      { speaker: 'female', text: '那會考有什麼不會考的？' },
      { speaker: 'male', text: '不會考的就不在國中會考會考的範圍裡' },
      { speaker: 'female', text: '那會考如果考出本來說不會考的東西怎麼辦？' },
      { speaker: 'male', text: '不會啦，如果出現就涼拌炒雞蛋' }
    ],
    options: [
      '國中會考什麼都會考',
      '國中會考考出會考說不會考的東西，就說出「涼拌炒雞蛋」',
      '涼拌炒雞蛋是國中會考會考的題目',
      '國中會考會考會考範圍內的東西'
    ],
    correctAnswer: 3,
    explanation: '根據對話，男生說「不會考的就不在國中會考會考的範圍裡」，表示國中會考只會考範圍內的東西。'
  },
  {
    id: 2,
    dialogue: [
      { speaker: 'female', text: '你昨天有看那個新聞嗎？' },
      { speaker: 'male', text: '什麼新聞？' },
      { speaker: 'female', text: '就是那個貓咪救了小女孩的新聞啊' },
      { speaker: 'male', text: '真的假的？貓咪怎麼救人？' },
      { speaker: 'female', text: '牠一直叫，把鄰居吵醒，鄰居才發現小女孩掉到井裡' }
    ],
    options: [
      '貓咪直接跳下井救小女孩',
      '貓咪叫聲吵醒鄰居，間接救了小女孩',
      '小女孩是被鄰居推下井的',
      '這個新聞是假的'
    ],
    correctAnswer: 1,
    explanation: '女生說貓咪「一直叫，把鄰居吵醒」，鄰居才發現小女孩掉井，所以是間接救援。'
  },
  {
    id: 3,
    dialogue: [
      { speaker: 'male', text: '媽，我想買一台新手機' },
      { speaker: 'female', text: '你現在的手機不是還能用嗎？' },
      { speaker: 'male', text: '能用是能用，但是很慢很卡' },
      { speaker: 'female', text: '那你先把成績拿好再說' },
      { speaker: 'male', text: '成績跟手機有什麼關係啊？' },
      { speaker: 'female', text: '沒關係就不用買了' }
    ],
    options: [
      '媽媽同意買新手機給兒子',
      '兒子的手機完全壞掉了',
      '媽媽用成績作為買手機的條件',
      '成績好壞真的跟手機沒關係'
    ],
    correctAnswer: 2,
    explanation: '媽媽說「你先把成績拿好再說」，表示要用成績作為購買手機的條件。'
  },
  {
    id: 4,
    dialogue: [
      { speaker: 'female', text: '老師，為什麼我的作文分數這麼低？' },
      { speaker: 'male', text: '你有按照我說的架構寫嗎？' },
      { speaker: 'female', text: '有啊，起承轉合都有' },
      { speaker: 'male', text: '那內容呢？有沒有舉具體例子？' },
      { speaker: 'female', text: '例子？我以為只要文筆好就夠了' }
    ],
    options: [
      '學生沒有按照老師要求的架構寫作文',
      '學生的文筆不夠好所以分數低',
      '學生有架構但缺乏具體例子',
      '老師的評分標準不公平'
    ],
    correctAnswer: 2,
    explanation: '學生說有起承轉合的架構，但當老師問到具體例子時，學生才意識到自己遺漏了這個重點。'
  },
  {
    id: 5,
    dialogue: [
      { speaker: 'male', text: '這家餐廳的牛肉麵好吃嗎？' },
      { speaker: 'female', text: '還可以啦，就是份量有點少' },
      { speaker: 'male', text: '那價格呢？' },
      { speaker: 'female', text: '一碗要兩百五' },
      { speaker: 'male', text: '什麼？這麼貴？份量又少？' },
      { speaker: 'female', text: '對啊，所以我說還可以啦' }
    ],
    options: [
      '這家餐廳的牛肉麵很好吃',
      '女生認為這家餐廳CP值不高',
      '牛肉麵一碗兩百五很便宜',
      '男生決定要去這家餐廳用餐'
    ],
    correctAnswer: 1,
    explanation: '女生說「還可以啦」是因為雖然味道不錯，但份量少價格貴，整體CP值不高。'
  }
]

const currentQuestion = computed(() => questions[currentQuestionIndex.value])
const isCorrect = computed(() => selectedAnswer.value === currentQuestion.value.correctAnswer)

// 初始化語音合成
const initSpeechSynthesis = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis
  }
}

// 播放對話
const playDialogue = async () => {
  if (!speechSynthesis) {
    initSpeechSynthesis()
  }

  if (!speechSynthesis) {
    alert('您的瀏覽器不支援語音播放功能')
    dialogueCompleted.value = true
    return
  }

  isPlaying.value = true
  let currentLineIndex = 0

  const playNextLine = () => {
    if (currentLineIndex >= currentQuestion.value.dialogue.length) {
      isPlaying.value = false
      dialogueCompleted.value = true
      return
    }

    const line = currentQuestion.value.dialogue[currentLineIndex]
    currentUtterance = new SpeechSynthesisUtterance(line.text)

    // 設置中文語音
    currentUtterance.lang = 'zh-TW'
    currentUtterance.rate = 0.9

    // 根據說話者設置語音特性
    if (line.speaker === 'male') {
      currentUtterance.pitch = 0.8
    } else {
      currentUtterance.pitch = 1.2
    }

    currentUtterance.onend = () => {
      currentLineIndex++
      setTimeout(playNextLine, 800) // 每句話之間間隔0.8秒
    }

    currentUtterance.onerror = () => {
      isPlaying.value = false
      dialogueCompleted.value = true
    }

    speechSynthesis.speak(currentUtterance)
  }

  playNextLine()
}

// 停止播放
const stopDialogue = () => {
  if (speechSynthesis && currentUtterance) {
    speechSynthesis.cancel()
    isPlaying.value = false
    dialogueCompleted.value = true
  }
}

// 開始遊戲
const startGame = () => {
  gameStarted.value = true
  initSpeechSynthesis()
}

// 選擇答案
const selectAnswer = (index: number) => {
  if (answered.value) return

  selectedAnswer.value = index
  answered.value = true

  if (index === currentQuestion.value.correctAnswer) {
    score.value++
  }
}

// 下一題
const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    answered.value = false
    dialogueCompleted.value = false
    isPlaying.value = false
  } else {
    gameEnded.value = true
  }
}

// 重新開始
const restartGame = () => {
  gameStarted.value = false
  gameEnded.value = false
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  answered.value = false
  score.value = 0
  isPlaying.value = false
  dialogueCompleted.value = false
}
</script>

<style scoped>
.comprehension-container {
  min-height: 100vh;
  background: #000;
  color: #00ff00;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Matrix Rain Background */
.matrix-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}

.falling-zhuyin {
  position: absolute;
  color: #00ff00;
  font-size: 20px;
  text-shadow: 0 0 5px #00ff00;
  animation: matrix-fall linear infinite;
  font-family: 'Courier New', monospace;
}

@keyframes matrix-fall {
  from {
    top: -20px;
    opacity: 1;
  }
  to {
    top: 100vh;
    opacity: 0;
  }
}

.content-wrapper {
  width: 100%;
  max-width: 1000px;
  position: relative;
  z-index: 1;
}

.game-header {
  text-align: center;
  margin-bottom: 40px;
}

.main-title {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #00ff00;
  text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;
  animation: matrix-glow 2s ease-in-out infinite;
}

@keyframes matrix-glow {
  0%, 100% {
    text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;
  }
  50% {
    text-shadow: 0 0 30px #00ff00, 0 0 60px #00ff00, 0 0 80px #00ff00;
  }
}

.subtitle {
  font-size: 1.3rem;
  color: #00ff00;
  opacity: 0.8;
}

.game-content {
  background: rgba(0, 255, 0, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  border: 2px solid #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
}

.description-box {
  background: rgba(0, 255, 0, 0.1);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  line-height: 1.8;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.description-box p {
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.start-game-btn {
  background: #00b894;
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);
}

.start-game-btn:hover {
  background: #00a085;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 184, 148, 0.4);
}

.quiz-header {
  text-align: center;
  margin-bottom: 30px;
}

.progress-info {
  font-size: 1.2rem;
  opacity: 0.9;
}

.dialogue-section {
  margin-bottom: 40px;
}

.dialogue-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.dialogue-box {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.dialogue-line {
  margin-bottom: 15px;
  line-height: 1.6;
}

.speaker {
  font-weight: bold;
  margin-right: 10px;
}

.speaker.male {
  color: #74b9ff;
}

.speaker.female {
  color: #fd79a8;
}

.text {
  font-size: 1.1rem;
}

.audio-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.play-btn, .stop-btn {
  background: #6c5ce7;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover, .stop-btn:hover {
  background: #5f3dc4;
  transform: translateY(-2px);
}

.play-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.listening-prompt {
  text-align: center;
  padding: 40px;
  opacity: 0.7;
}

.listening-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.question-section {
  margin-top: 30px;
}

.question-title {
  font-size: 1.4rem;
  margin-bottom: 25px;
  text-align: center;
}

.options-grid {
  display: grid;
  gap: 15px;
  margin-bottom: 30px;
}

.option-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 20px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.option-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.option-btn.selected {
  border-color: #74b9ff;
  background: rgba(116, 185, 255, 0.2);
}

.option-btn.correct {
  border-color: #00b894;
  background: rgba(0, 184, 148, 0.2);
}

.option-btn.incorrect {
  border-color: #e17055;
  background: rgba(225, 112, 85, 0.2);
}

.option-btn:disabled {
  cursor: not-allowed;
}

.option-label {
  font-weight: bold;
  min-width: 25px;
}

.option-text {
  flex: 1;
  line-height: 1.5;
}

.answer-feedback {
  text-align: center;
  padding: 25px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
}

.feedback-message {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: bold;
}

.feedback-message.correct {
  color: #00b894;
}

.feedback-message.incorrect {
  color: #e17055;
}

.explanation {
  margin-bottom: 20px;
  line-height: 1.6;
  opacity: 0.9;
}

.next-btn {
  background: #74b9ff;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 20px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-btn:hover {
  background: #0984e3;
  transform: translateY(-2px);
}

.game-result {
  text-align: center;
  padding: 40px;
}

.game-result h2 {
  font-size: 2.5rem;
  margin-bottom: 30px;
}

.final-score {
  margin-bottom: 40px;
}

.score-display {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #00b894;
}

.score-rating {
  font-size: 1.3rem;
  opacity: 0.9;
}

.result-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.restart-btn, .home-btn {
  background: #6c5ce7;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.restart-btn:hover, .home-btn:hover {
  background: #5f3dc4;
  transform: translateY(-3px);
}

.back-btn {
  display: block;
  margin: 30px auto 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 25px;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  width: fit-content;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }

  .game-content {
    padding: 20px;
  }

  .dialogue-box {
    padding: 15px;
  }

  .option-btn {
    padding: 15px;
    gap: 10px;
  }

  .result-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>