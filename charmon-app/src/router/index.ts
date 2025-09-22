import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/learn',
      name: 'learn',
      component: () => import('@/views/LearnView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'name',
          name: 'name-learning',
          component: () => import('@/views/NameLearningView.vue')
        },
        {
          path: 'zhuyin',
          name: 'zhuyin-learning',
          component: () => import('@/views/ZhuyinLearningView.vue')
        }
      ]
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/views/GamesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/rewards',
      name: 'rewards',
      component: () => import('@/views/RewardsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parents',
      name: 'parents',
      component: () => import('@/views/ParentsView.vue'),
      meta: { requiresAuth: true, requiresParent: true }
    },
    {
      path: '/worksheets',
      name: 'worksheets',
      component: () => import('@/views/WorksheetsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/dictionary',
      name: 'dictionary-admin',
      component: () => import('@/views/DictionaryAdminV2View.vue'),
      meta: { requiresAuth: true, requiresParent: true }
    },
    {
      path: '/about-author',
      name: 'about-author',
      component: () => import('@/views/AboutAuthorView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresParent && !userStore.currentUser?.isParent) {
    // If user is not marked as parent, redirect to dashboard
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
