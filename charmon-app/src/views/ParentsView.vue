<template>
  <div class="parents-container">
    <h1>家長專區</h1>
    <p>管理孩子的學習進度和設定</p>

    <div class="admin-tools">
      <div class="tool-card" @click="gotoDictionaryAdmin">
        <div class="tool-icon">📚</div>
        <h3>字典管理</h3>
        <p>管理字典內容，新增未知字符的注音</p>
      </div>

      <div class="tool-card coming-soon">
        <div class="tool-icon">📊</div>
        <h3>學習報告</h3>
        <p>查看孩子的學習進度和統計</p>
        <span class="badge">即將推出</span>
      </div>

      <div class="tool-card coming-soon">
        <div class="tool-icon">⚙️</div>
        <h3>系統設定</h3>
        <p>調整應用程式的各項設定</p>
        <span class="badge">即將推出</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const gotoDictionaryAdmin = () => {
  router.push('/admin/dictionary')
}
</script>

<style scoped>
.parents-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.parents-container h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 10px;
}

.parents-container > p {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.admin-tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.tool-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.tool-card:not(.coming-soon):hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tool-card.coming-soon {
  cursor: not-allowed;
  opacity: 0.6;
}

.tool-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.tool-card h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.tool-card p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ffc107;
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .admin-tools {
    grid-template-columns: 1fr;
  }

  .parents-container {
    padding: 20px;
  }
}
</style>