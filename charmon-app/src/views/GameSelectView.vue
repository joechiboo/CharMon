<template>
  <div class="game-select-container">
    <div class="content-wrapper">
      <h1 class="main-title">🎮 選擇遊戲模式</h1>
      <p class="subtitle">選擇你想玩的遊戲類型，開始學習冒險吧！</p>

      <div class="game-modes">
        <div class="game-mode-card" @click="selectGameMode('pokemon')">
          <div class="mode-icon">🔥</div>
          <h2 class="mode-title">寶可夢學中文</h2>
          <p class="mode-description">和寶可夢夥伴一起學習中文字</p>
          <div class="mode-features">
            <span class="feature-tag">✨ 收集寶可夢</span>
            <span class="feature-tag">📝 練習寫字</span>
            <span class="feature-tag">🎯 升級進化</span>
          </div>
        </div>

        <div class="game-mode-card matrix-style" @click="selectGameMode('chinese-monster')">
          <div class="matrix-rain-card">
            <span v-for="i in 15" :key="i" class="falling-zhuyin">{{ getRandomZhuyin() }}</span>
          </div>
          <div class="mode-icon">🐉</div>
          <h2 class="mode-title">中文怪物-聲調測驗</h2>
          <p class="mode-description">探索中文字的奇妙世界</p>
          <div class="mode-features">
            <span class="feature-tag matrix-tag">🔥 火熱話題</span>
            <span class="feature-tag matrix-tag">🏃 冒險闖關</span>
            <span class="feature-tag matrix-tag">🎨 創意學習</span>
          </div>
        </div>

        <div class="game-mode-card matrix-style comprehension-style" @click="selectGameMode('chinese-comprehension')">
          <div class="matrix-rain-card">
            <span v-for="i in 15" :key="`comp-${i}`" class="falling-zhuyin">{{ getRandomZhuyin() }}</span>
          </div>
          <div class="mode-icon">📚</div>
          <h2 class="mode-title">中文怪物-中文理解</h2>
          <p class="mode-description">聆聽對話，測試理解能力</p>
          <div class="mode-features">
            <span class="feature-tag matrix-tag comprehension-tag">🎧 語音對話</span>
            <span class="feature-tag matrix-tag comprehension-tag">🧠 邏輯思考</span>
            <span class="feature-tag matrix-tag comprehension-tag">📝 選擇題</span>
          </div>
        </div>
      </div>

      <router-link to="/dashboard" class="back-btn">
        ← 返回主選單
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

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

const selectGameMode = (mode: string) => {
  if (mode === 'pokemon') {
    router.push('/games/pokemon')
  } else if (mode === 'chinese-monster') {
    router.push('/games/chinese-monster')
  } else if (mode === 'chinese-comprehension') {
    router.push('/games/chinese-comprehension')
  }
}
</script>

<style scoped>
.game-select-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
}

.main-title {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 15px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 3px 3px 20px rgba(255, 255, 255, 0.5);
  }
}

.subtitle {
  text-align: center;
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 50px;
}

.game-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  margin-bottom: 50px;
}

.game-mode-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 40px;
  cursor: pointer;
  transition: all 0.4s ease;
  border: 3px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.game-mode-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.game-mode-card:hover::before {
  opacity: 1;
}

.game-mode-card:hover {
  transform: translateY(-10px) scale(1.03);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Matrix style card */
.game-mode-card.matrix-style {
  background: #000;
  border: 3px solid #00ff00;
  position: relative;
  overflow: hidden;
}

.game-mode-card.matrix-style:hover {
  background: rgba(0, 255, 0, 0.05);
  box-shadow: 0 0 50px rgba(0, 255, 0, 0.5), inset 0 0 30px rgba(0, 255, 0, 0.1);
  border-color: #00ff00;
}

.matrix-rain-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0.4;
  pointer-events: none;
}

.falling-zhuyin {
  position: absolute;
  color: #00ff00;
  font-size: 20px;
  text-shadow: 0 0 5px #00ff00;
  animation: matrix-fall-card linear infinite;
  font-family: 'Courier New', monospace;
}

.falling-zhuyin:nth-child(1) { left: 8%; animation-delay: 0.2s; animation-duration: 6s; }
.falling-zhuyin:nth-child(2) { left: 17%; animation-delay: 1.5s; animation-duration: 7s; }
.falling-zhuyin:nth-child(3) { left: 23%; animation-delay: 0.8s; animation-duration: 5.5s; }
.falling-zhuyin:nth-child(4) { left: 31%; animation-delay: 2.1s; animation-duration: 8s; }
.falling-zhuyin:nth-child(5) { left: 42%; animation-delay: 0s; animation-duration: 6.5s; }
.falling-zhuyin:nth-child(6) { left: 58%; animation-delay: 3.2s; animation-duration: 7.5s; }
.falling-zhuyin:nth-child(7) { left: 66%; animation-delay: 1.8s; animation-duration: 5s; }
.falling-zhuyin:nth-child(8) { left: 73%; animation-delay: 2.5s; animation-duration: 9s; }
.falling-zhuyin:nth-child(9) { left: 82%; animation-delay: 0.5s; animation-duration: 6.8s; }
.falling-zhuyin:nth-child(10) { left: 91%; animation-delay: 4s; animation-duration: 7.2s; }
.falling-zhuyin:nth-child(11) { left: 12%; animation-delay: 1.2s; animation-duration: 8.5s; }
.falling-zhuyin:nth-child(12) { left: 36%; animation-delay: 2.8s; animation-duration: 5.8s; }
.falling-zhuyin:nth-child(13) { left: 51%; animation-delay: 0.3s; animation-duration: 7.8s; }
.falling-zhuyin:nth-child(14) { left: 69%; animation-delay: 3.5s; animation-duration: 6.2s; }
.falling-zhuyin:nth-child(15) { left: 87%; animation-delay: 1.7s; animation-duration: 8.2s; }

@keyframes matrix-fall-card {
  from {
    top: -20px;
    opacity: 1;
  }
  to {
    top: 100%;
    opacity: 0;
  }
}

.matrix-style .mode-title,
.matrix-style .mode-description {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
}

.matrix-style .feature-tag.matrix-tag {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
}

.matrix-style:hover .feature-tag.matrix-tag {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

/* Comprehension style - using matrix background */
.game-mode-card.matrix-style.comprehension-style {
  background: #000;
  border: 3px solid #00ff00;
}

.game-mode-card.matrix-style.comprehension-style:hover {
  background: rgba(0, 255, 0, 0.05);
  box-shadow: 0 0 50px rgba(0, 255, 0, 0.5), inset 0 0 30px rgba(0, 255, 0, 0.1);
  border-color: #00ff00;
}

.matrix-style.comprehension-style .mode-title,
.matrix-style.comprehension-style .mode-description {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
}

.matrix-style.comprehension-style .feature-tag.matrix-tag.comprehension-tag {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
}

.matrix-style.comprehension-style:hover .feature-tag.matrix-tag.comprehension-tag {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.mode-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  text-align: center;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.mode-title {
  font-size: 2rem;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
}

.mode-description {
  font-size: 1.2rem;
  text-align: center;
  opacity: 0.9;
  margin-bottom: 25px;
  line-height: 1.5;
}

.mode-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.feature-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.game-mode-card:hover .feature-tag {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.back-btn {
  display: inline-block;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  display: block;
  width: fit-content;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .game-modes {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .mode-title {
    font-size: 1.5rem;
  }

  .mode-description {
    font-size: 1rem;
  }
}
</style>