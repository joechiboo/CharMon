<template>
  <div class="learn-container">
    <router-view v-if="$route.name !== 'learn'" />
    <div v-else class="learn-home">
      <header class="learn-header">
        <h1>學習中心</h1>
        <p>選擇你想要學習的內容</p>
      </header>

      <div class="learn-options">
        <router-link to="/learn/name" class="learn-option-card">
          <div class="card-icon">✍️</div>
          <h3>我的名字</h3>
          <p>學習認識和書寫你的名字</p>
        </router-link>

        <router-link to="/games" class="learn-option-card">
          <div class="card-icon">🎮</div>
          <h3>遊戲時間</h3>
          <p>玩遊戲學中文</p>
        </router-link>

        <div class="learn-option-card disabled">
          <div class="card-icon">🎯</div>
          <h3>筆劃練習</h3>
          <p>學習正確的筆劃順序</p>
          <span class="coming-soon">即將推出</span>
        </div>

        <div class="learn-option-card disabled">
          <div class="card-icon">ㄅㄆㄇ</div>
          <h3>注音符號</h3>
          <p>學習注音符號發音</p>
          <span class="coming-soon">即將推出</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.learn-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.learn-home {
  padding: 30px 40px;
  width: 100%;
}

.learn-header {
  text-align: center;
  margin-bottom: 40px;
}

.learn-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.learn-header p {
  color: #666;
  font-size: 1.1rem;
}

.learn-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.learn-option-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-decoration: none;
  color: #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  text-align: center;
}

.learn-option-card:hover:not(.disabled) {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.learn-option-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.learn-option-card h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.learn-option-card p {
  color: #666;
  font-size: 1rem;
}

.coming-soon {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff6b6b;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
}
</style>