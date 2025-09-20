<template>
  <div class="not-found">
    <div class="content">
      <div class="icon">🔍</div>
      <h1>找不到頁面</h1>
      <p>你要找的頁面不存在喔！</p>
      <router-link to="/" class="home-btn">回首頁</router-link>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: white;
}

.icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.content h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.home-btn {
  display: inline-block;
  padding: 15px 30px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: transform 0.3s;
}

.home-btn:hover {
  transform: translateY(-2px);
}
</style>