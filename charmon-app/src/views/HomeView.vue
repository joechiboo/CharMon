<template>
  <div class="home">
    <div class="hero">
      <h1>字樂園</h1>
      <h2>中文學習好幫手</h2>
      <p>幫助 4-12 歲孩童快樂學習中文</p>
      <router-link to="/login" class="start-btn">開始學習</router-link>
    </div>

    <div class="features">
      <div class="feature">
        <div class="feature-icon">✍️</div>
        <h3>姓名學習</h3>
        <p>認識和書寫自己的名字</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📖</div>
        <h3>認字練習</h3>
        <p>學習常用中文字</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🎮</div>
        <h3>遊戲學習</h3>
        <p>在遊戲中快樂學習</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📝</div>
        <h3>練習表格</h3>
        <p>可列印的練習紙</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
}

.hero {
  text-align: center;
  margin-bottom: 30px;
  flex-shrink: 0;
}

.hero h1 {
  font-size: 4rem;
  margin-bottom: 10px;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.start-btn {
  display: inline-block;
  padding: 15px 40px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  transition: transform 0.3s;
}

.start-btn:hover {
  transform: translateY(-3px);
}

.features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1400px;
  width: 100%;
  flex-shrink: 0;
  margin: 0 auto;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  padding: 25px 15px;
  border-radius: 15px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.feature h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.feature p {
  opacity: 0.9;
  font-size: 0.95rem;
}

/* 響應式設計 */
@media (max-width: 1400px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 3rem;
  }

  .hero h2 {
    font-size: 1.5rem;
  }

  .features {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .feature {
    padding: 20px;
  }
}
</style>
