<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>你好，{{ userStore.currentUser?.name }}！</h1>
      <div class="points-display">
        <span class="points-icon">⭐</span>
        <span class="points-value">{{ userStore.totalPoints }} 點</span>
      </div>
    </header>

    <div class="dashboard-content">
      <section class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <div class="stat-value">{{ learningStore.masteredCharacters.length }}</div>
            <div class="stat-label">已掌握的字</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✏️</div>
          <div class="stat-info">
            <div class="stat-value">{{ learningStore.charactersInProgress.length }}</div>
            <div class="stat-label">學習中的字</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <div class="stat-value">5</div>
            <div class="stat-label">獲得成就</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-value">7</div>
            <div class="stat-label">連續學習天數</div>
          </div>
        </div>
      </section>

      <section class="main-actions">
        <h2 v-if="userStore.currentUser?.gradeLevel === 'kindergarten'">今天要學什麼？</h2>
        <h2 v-else-if="userStore.currentUser?.gradeLevel === 'elementary-low'">今天要玩什麼？</h2>
        <h2 v-else>今天要學什麼？</h2>
        <div class="action-grid">
          <!-- 幼稚園：學習名字為主要功能 -->
          <router-link
            v-if="userStore.currentUser?.gradeLevel === 'kindergarten'"
            to="/learn/name"
            class="action-card primary"
          >
            <div class="action-icon">✍️</div>
            <div class="action-title">學習我的名字</div>
            <div class="action-desc">認識和書寫你的名字</div>
          </router-link>

          <!-- 低年級：遊戲時間為主要功能 -->
          <router-link
            v-if="userStore.currentUser?.gradeLevel === 'elementary-low'"
            to="/games"
            class="action-card primary"
          >
            <div class="action-icon">🎮</div>
            <div class="action-title">遊戲時間</div>
            <div class="action-desc">玩遊戲學中文</div>
          </router-link>

          <!-- 幼稚園：遊戲時間為次要功能 -->
          <router-link
            v-if="userStore.currentUser?.gradeLevel === 'kindergarten'"
            to="/games"
            class="action-card"
          >
            <div class="action-icon">🎮</div>
            <div class="action-title">遊戲時間</div>
            <div class="action-desc">玩遊戲學中文</div>
          </router-link>

          <!-- 低年級：學習名字為次要功能 -->
          <router-link
            v-if="userStore.currentUser?.gradeLevel === 'elementary-low'"
            to="/learn/name"
            class="action-card"
          >
            <div class="action-icon">✍️</div>
            <div class="action-title">學習我的名字</div>
            <div class="action-desc">認識和書寫你的名字</div>
          </router-link>

          <!-- 練習表格：所有年級都有 -->
          <router-link to="/worksheets" class="action-card">
            <div class="action-icon">📝</div>
            <div class="action-title">練習表格</div>
            <div class="action-desc">列印練習紙</div>
          </router-link>
        </div>
      </section>

      <section class="recommended-characters">
        <h2 v-if="userStore.currentUser?.gradeLevel === 'kindergarten'">推薦學習</h2>
        <h2 v-else-if="userStore.currentUser?.gradeLevel === 'elementary-low'">常用漢字</h2>
        <h2 v-else>推薦學習</h2>
        <div class="character-list">
          <div
            v-for="char in currentRecommendedChars"
            :key="char"
            class="character-card"
            @click="learnCharacter(char)"
          >
            <div class="character">{{ char }}</div>
          </div>
        </div>
      </section>

      <section class="recent-achievements">
        <h2>最新成就</h2>
        <div class="achievement-list">
          <div class="achievement-item">
            <div class="achievement-icon">🌟</div>
            <div class="achievement-info">
              <div class="achievement-title">初學者</div>
              <div class="achievement-desc">完成第一個字的學習</div>
            </div>
          </div>
          <div class="achievement-item">
            <div class="achievement-icon">🔥</div>
            <div class="achievement-info">
              <div class="achievement-title">連續學習</div>
              <div class="achievement-desc">連續7天學習</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLearningStore } from '@/stores/learning'

const router = useRouter()
const userStore = useUserStore()
const learningStore = useLearningStore()

// 幼稚園推薦字符：簡單基礎字
const kindergartenChars = ['大', '小', '人', '日', '月']
// 低年級推薦字符：更多常用字
const elementaryLowChars = ['山', '水', '火', '土', '木', '天', '地', '風', '雨', '雲']

const currentRecommendedChars = computed(() => {
  const user = userStore.currentUser
  if (user?.gradeLevel === 'elementary-low') {
    return elementaryLowChars
  }
  return kindergartenChars
})

const learnCharacter = (char: string) => {
  // 導向練習表格，並帶入字符參數進行練習
  router.push(`/worksheets?text=${char}`)
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-header {
  background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
  color: white;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  font-size: 2rem;
  margin: 0;
}

.points-display {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 1.2rem;
}

.points-icon {
  font-size: 1.5rem;
  margin-right: 10px;
}

.dashboard-content {
  padding: 30px 40px;
  width: 100%;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.main-actions {
  margin-bottom: 40px;
}

.main-actions h2 {
  color: #333;
  margin-bottom: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  text-decoration: none;
  color: #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.action-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.action-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.action-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

.recommended-characters {
  margin-bottom: 40px;
}

.recommended-characters h2 {
  color: #333;
  margin-bottom: 20px;
}

.character-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.character-card {
  background: white;
  width: 100px;
  height: 100px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.character {
  font-size: 3rem;
  color: #333;
}

.recent-achievements {
  margin-bottom: 40px;
}

.recent-achievements h2 {
  color: #333;
  margin-bottom: 20px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  background: white;
  padding: 20px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.achievement-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.achievement-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.achievement-desc {
  color: #666;
  font-size: 0.9rem;
}
</style>