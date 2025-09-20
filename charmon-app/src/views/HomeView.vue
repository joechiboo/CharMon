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
  background: linear-gradient(135deg, #f5f2e8 0%, #ede5d3 100%);
  color: #2c3e50;
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
  margin-bottom: 50px;
  flex-shrink: 0;
}

.hero h1 {
  font-size: 4.2rem;
  margin-bottom: 12px;
}

.hero h2 {
  font-size: 2.4rem;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.4rem;
  margin-bottom: 35px;
  opacity: 0.9;
}

.start-btn {
  display: inline-block;
  padding: 18px 45px;
  background: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: bold;
  transition: transform 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.start-btn:hover {
  transform: translateY(-3px);
}

.features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  flex-shrink: 0;
  padding: 0 60px;
}

.feature {
  background: white;
  padding: 30px 20px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.feature:hover {
  background: #fefcf7;
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.feature h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.feature p {
  opacity: 0.9;
  font-size: 1.1rem;
  line-height: 1.3;
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 40px;
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
    padding: 0 20px;
  }

  .feature {
    padding: 20px;
  }
}
</style>
