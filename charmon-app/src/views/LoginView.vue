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
const gradeLevel = ref<'kindergarten'>('kindergarten') // 固定為幼稚園
const showParentLogin = ref(false)

const canLogin = computed(() => {
  return userName.value.trim() !== ''
})

const handleLogin = () => {
  if (!canLogin.value) return

  const user: User = {
    id: Date.now().toString(),
    name: userName.value,
    age: 5, // 固定為幼稚園年齡
    gradeLevel: 'kindergarten', // 固定為幼稚園
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
</style>