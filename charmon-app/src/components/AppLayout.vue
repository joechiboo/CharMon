<template>
  <div class="app-layout">
    <nav class="sidebar">
      <div class="logo">
        <h2>字樂園</h2>
      </div>

      <div class="user-info">
        <div class="avatar">{{ userStore.currentUser?.name[0] }}</div>
        <div class="user-details">
          <div class="user-name">{{ userStore.currentUser?.name }}<span v-if="userStore.currentUser?.isParent">，歡迎！</span></div>
          <div class="user-points">⭐ {{ userStore.totalPoints }} 點</div>
        </div>
      </div>

      <ul class="nav-menu">
        <li>
          <router-link to="/dashboard" :class="{ active: $route.path === '/dashboard' }">
            <el-icon><House /></el-icon>
            <span>首頁</span>
          </router-link>
        </li>
        <li>
          <router-link to="/learn" :class="{ active: $route.path.startsWith('/learn') }">
            <el-icon><Reading /></el-icon>
            <span>學習中心</span>
          </router-link>
        </li>
        <li>
          <div class="nav-item disabled">
            <el-icon><Medal /></el-icon>
            <span>成就</span>
            <span class="coming-soon-badge">即將推出</span>
          </div>
        </li>
        <li>
          <div class="nav-item disabled">
            <el-icon><Present /></el-icon>
            <span>獎勵</span>
            <span class="coming-soon-badge">即將推出</span>
          </div>
        </li>
        <li>
          <router-link to="/worksheets" :class="{ active: $route.path === '/worksheets' }">
            <el-icon><Document /></el-icon>
            <span>練習表格</span>
          </router-link>
        </li>
        <li v-if="userStore.currentUser?.isParent">
          <router-link to="/parents" class="nav-item">
            <el-icon><User /></el-icon>
            <span>家長專區</span>
          </router-link>
        </li>
      </ul>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>登出</span>
        </button>
      </div>
    </nav>

    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  House,
  Reading,
  Medal,
  Present,
  Document,
  User,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
}

.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #4CAF50 0%, #2196F3 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0;
  font-size: 1.8rem;
}

.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 15px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-points {
  font-size: 0.9rem;
  opacity: 0.9;
}

.nav-menu {
  flex: 1;
  list-style: none;
  padding: 20px 0;
}

.nav-menu li {
  margin-bottom: 5px;
}

.nav-menu a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: background 0.3s;
}

.nav-menu a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-menu a.active {
  background: rgba(255, 255, 255, 0.2);
  border-left: 3px solid white;
}

.nav-menu .el-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.nav-item.disabled {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  position: relative;
}

.coming-soon-badge {
  position: absolute;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.logout-btn .el-icon {
  margin-right: 10px;
}

.main-content {
  flex: 1;
  background: #f5f7fa;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .logo h2,
  .user-details,
  .nav-menu span,
  .logout-btn span {
    display: none;
  }

  .user-info {
    justify-content: center;
  }

  .avatar {
    margin-right: 0;
  }

  .nav-menu a {
    justify-content: center;
  }

  .nav-menu .el-icon {
    margin-right: 0;
  }
}
</style>