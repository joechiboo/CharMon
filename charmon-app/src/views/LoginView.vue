<template>
  <div class="login-container">
    <div class="login-card">
      <router-link to="/" class="title-link">
        <h1 class="title">字樂園</h1>
      </router-link>
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
              :class="['grade-btn', {
                active: gradeLevel === grade.value,
                disabled: grade.disabled
              }]"
              :disabled="grade.disabled"
              @click="!grade.disabled && (gradeLevel = grade.value as typeof gradeLevel)"
            >
              {{ grade.label }}
              <span v-if="grade.disabled" class="coming-soon-badge">即將推出</span>
            </button>
          </div>
        </div>

        <button class="login-btn" :disabled="!canLogin" @click="handleLogin">
          開始學習！
        </button>
      </div>

      <div class="parent-link">
        <a href="#" @click.prevent="handleParentLogin">家長登入</a>
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
const grades = [
  { value: 'kindergarten', label: '幼稚園', disabled: false },
  { value: 'elementary-low', label: '小學\n低年級', disabled: false },
  { value: 'elementary-high', label: '小學\n高年級', disabled: true }
]

const canLogin = computed(() => {
  return userName.value.trim() !== '' && gradeLevel.value
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

  // 根據年級決定登入後的導向
  if (user.gradeLevel === 'elementary-low') {
    // 低年級：直接進入遊戲時間
    router.push('/games')
  } else {
    // 幼稚園：進入儀表板
    router.push('/dashboard')
  }
}

const handleParentLogin = () => {
  const parentUser: User = {
    id: `parent-${Date.now()}`,
    name: '家長',
    age: 35, // Default parent age
    gradeLevel: 'kindergarten', // Default grade, not used for parents
    isParent: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  userStore.login(parentUser)

  // Redirect to parent area
  router.push('/parents')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f2e8 0%, #ede5d3 100%);
  padding: 20px;
  width: 100vw;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 800px;
}

.title-link {
  text-decoration: none;
  display: block;
  transition: transform 0.3s ease;
}

.title-link:hover {
  transform: scale(1.05);
}

.title {
  text-align: center;
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
  transition: color 0.3s ease;
}

.title-link:hover .title {
  color: #27ae60;
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
  border-color: #27ae60;
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
  white-space: pre-line;
  line-height: 1.3;
}

.grade-btn:hover {
  background: #f5f5f5;
}

.grade-btn.active {
  background: #27ae60;
  color: white;
  border-color: #27ae60;
}

.grade-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  position: relative;
}

.grade-btn.disabled:hover {
  background: white;
}

.coming-soon-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  color: white;
  padding: 3px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: #27ae60;
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
  color: #27ae60;
  text-decoration: none;
  font-size: 0.9rem;
}

.parent-link a:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.cancel-btn:hover {
  background: #d0d0d0;
}

.modal-buttons .login-btn {
  flex: 1;
  margin: 0;
}
</style>