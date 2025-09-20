import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, RewardPoint } from '@/types'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const rewardPoints = ref<RewardPoint | null>(null)
  const isAuthenticated = ref(false)

  const userGradeLevel = computed(() => {
    if (!currentUser.value) return null
    return currentUser.value.gradeLevel
  })

  const userAge = computed(() => {
    if (!currentUser.value) return 0
    return currentUser.value.age
  })

  const totalPoints = computed(() => {
    if (!rewardPoints.value) return 0
    return rewardPoints.value.points
  })

  function login(user: User) {
    currentUser.value = user
    isAuthenticated.value = true
  }

  function logout() {
    currentUser.value = null
    rewardPoints.value = null
    isAuthenticated.value = false
  }

  function addPoints(points: number, reason: string) {
    if (!rewardPoints.value) {
      rewardPoints.value = {
        userId: currentUser.value!.id,
        points: 0,
        history: []
      }
    }

    rewardPoints.value.points += points
    rewardPoints.value.history.push({
      id: Date.now().toString(),
      points,
      reason,
      timestamp: new Date(),
      type: 'earned'
    })
  }

  function spendPoints(points: number, reason: string): boolean {
    if (!rewardPoints.value || rewardPoints.value.points < points) {
      return false
    }

    rewardPoints.value.points -= points
    rewardPoints.value.history.push({
      id: Date.now().toString(),
      points,
      reason,
      timestamp: new Date(),
      type: 'spent'
    })
    return true
  }

  return {
    currentUser,
    rewardPoints,
    isAuthenticated,
    userGradeLevel,
    userAge,
    totalPoints,
    login,
    logout,
    addPoints,
    spendPoints
  }
})