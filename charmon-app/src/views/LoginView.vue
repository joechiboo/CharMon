<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">字樂園</h1>
      <div class="welcome-message">歡迎小朋友！</div>

      <div class="login-form">
        <div class="form-group">
          <label for="name">你的名字</label>
          <input
            id="name"
            v-model="userName"
            type="text"
            placeholder="請輸入你的名字"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="form-group">
          <label>你是...</label>
          <div class="grade-buttons">
            <button
              v-for="grade in grades"
              :key="grade.value"
              :class="['grade-btn', { active: gradeLevel === grade.value }]"
              @click="gradeLevel = grade.value as typeof gradeLevel"
            >
              {{ grade.label }}
            </button>
          </div>
        </div>

        <button class="login-btn" :disabled="!canLogin" @click="handleLogin">
          開始學習！
        </button>
      </div>

      <div class="parent-link">
        <a href="#" @click.prevent="showParentLogin = true">家長登入</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const userName = ref('')
const gradeLevel = ref<'kindergarten' | 'elementary-low' | 'elementary-high' | ''>('')
const showParentLogin = ref(false)

const grades = [
  { value: 'kindergarten', label: '幼稚園' },
  { value: 'elementary-low', label: '小學低年級' },
  { value: 'elementary-high', label: '小學高年級' }
]

const canLogin = computed(() => {
  return userName.value && gradeLevel.value
})

const handleLogin = () => {
  if (!canLogin.value) return

  // 根據學習階段設定預設年齡
  const getAgeByGrade = (grade: string) => {
    switch(grade) {
      case 'kindergarten': return 5
      case 'elementary-low': return 8
      case 'elementary-high': return 11
      default: return 6
    }
  }

  const user: User = {
    id: Date.now().toString(),
    name: userName.value,
    age: getAgeByGrade(gradeLevel.value),
    gradeLevel: gradeLevel.value as User['gradeLevel'],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  userStore.login(user)
  router.push('/dashboard')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
}

.title {
  text-align: center;
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.welcome-message {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.grade-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.grade-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.grade-btn:hover {
  background: #f5f5f5;
}

.grade-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.3s, opacity 0.3s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.parent-link {
  text-align: center;
  margin-top: 20px;
}

.parent-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}

.parent-link a:hover {
  text-decoration: underline;
}
</style>