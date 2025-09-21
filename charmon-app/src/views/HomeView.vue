<template>
  <div class="home">
    <!-- 浮動背景裝飾 -->
    <div class="floating-decorations">
      <div class="floating-element" style="--delay: 0s; --duration: 6s;">🌈</div>
      <div class="floating-element" style="--delay: 1s; --duration: 8s;">⭐</div>
      <div class="floating-element" style="--delay: 2s; --duration: 7s;">🎨</div>
      <div class="floating-element" style="--delay: 3s; --duration: 9s;">📚</div>
      <div class="floating-element" style="--delay: 4s; --duration: 6s;">✨</div>
      <div class="floating-element" style="--delay: 5s; --duration: 8s;">🦄</div>
    </div>

    <div class="hero">
      <div class="hero-mascot">🐻</div>
      <h1 class="rainbow-text">字樂園</h1>
      <h2>中文學習好幫手</h2>
      <p>幫助 4-12 歲孩童快樂學習中文</p>
      <div class="friendly-characters">
        <span class="character character-1">🐰</span>
        <span class="character character-2">🐼</span>
        <span class="character character-3">🐸</span>
      </div>
      <router-link to="/login" class="start-btn">
        🚀 開始學習冒險
      </router-link>
    </div>

    <div class="features">
      <div class="feature">
        <div class="feature-icon">
          <div class="icon-background">✍️</div>
        </div>
        <h3>姓名學習</h3>
        <p>認識和書寫自己的名字</p>
        <div class="feature-sparkles">✨</div>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <div class="icon-background">📝</div>
        </div>
        <h3>練習表格</h3>
        <p>自製個人化練習紙</p>
        <div class="feature-sparkles">✨</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ffecd2 100%);
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* 浮動背景裝飾 */
.floating-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-element {
  position: absolute;
  font-size: 2rem;
  animation: float var(--duration) ease-in-out infinite var(--delay);
  opacity: 0.7;
}

.floating-element:nth-child(1) { top: 10%; left: 10%; }
.floating-element:nth-child(2) { top: 20%; right: 15%; }
.floating-element:nth-child(3) { top: 60%; left: 5%; }
.floating-element:nth-child(4) { top: 70%; right: 10%; }
.floating-element:nth-child(5) { top: 40%; left: 80%; }
.floating-element:nth-child(6) { top: 80%; left: 70%; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(5deg); }
  50% { transform: translateY(-40px) rotate(-5deg); }
  75% { transform: translateY(-20px) rotate(3deg); }
}

.hero {
  text-align: center;
  margin-bottom: 50px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.hero-mascot {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-8px); }
}

.rainbow-text {
  font-size: 4.2rem;
  margin-bottom: 12px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1, #96ceb4, #feca57);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow 3s ease-in-out infinite;
  font-weight: bold;
}

@keyframes rainbow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero h2 {
  font-size: 2.4rem;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.4rem;
  margin-bottom: 25px;
  opacity: 0.9;
}

.friendly-characters {
  margin-bottom: 30px;
  position: relative;
  height: 30px;
  width: 100%;
}

.character {
  font-size: 2.5rem;
  animation: wave 2s ease-in-out infinite;
  display: inline-block;
  position: absolute;
}

.character-1 {
  animation-delay: 0s;
  left: 10%;
  top: 0;
}
.character-2 {
  animation-delay: 0.5s;
  left: 35%;
  top: 10px;
}
.character-3 {
  animation-delay: 1s;
  right: 15%;
  top: -5px;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}

.start-btn {
  display: inline-block;
  padding: 18px 45px;
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-size: 1.3rem;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
  border: 3px solid #fff;
  animation: pulse 2s ease-in-out infinite;
}

.start-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
  background: linear-gradient(45deg, #ff8e8e, #ff6b6b);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); }
  50% { box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5); }
}

.features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  width: 100%;
  flex-shrink: 0;
  padding: 0 60px;
  position: relative;
  z-index: 2;
}

.feature {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  padding: 40px 20px;
  border-radius: 25px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
  border: 3px solid transparent;
  position: relative;
  overflow: hidden;
}

.feature::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.feature:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border-color: #ff6b6b;
}

.feature:hover::before {
  opacity: 0.1;
}

.feature-icon {
  margin-bottom: 20px;
  position: relative;
}

.icon-background {
  font-size: 3.5rem;
  display: inline-block;
  padding: 15px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b3 100%);
  border-radius: 50%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.feature:hover .icon-background {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
}

.feature-sparkles {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 1.2rem;
  opacity: 0;
  transition: all 0.3s ease;
  animation: sparkle 2s ease-in-out infinite;
}

.feature:hover .feature-sparkles {
  opacity: 1;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
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
