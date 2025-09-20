import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character, LearningProgress, LearningSession } from '@/types'

export const useLearningStore = defineStore('learning', () => {
  const characters = ref<Character[]>([])
  const userProgress = ref<LearningProgress[]>([])
  const currentSession = ref<LearningSession | null>(null)
  const selectedCharacter = ref<Character | null>(null)

  const masteredCharacters = computed(() => {
    return userProgress.value.filter(p => p.recognitionLevel >= 80 && p.writingLevel >= 80)
  })

  const charactersInProgress = computed(() => {
    return userProgress.value.filter(p =>
      (p.recognitionLevel > 0 || p.writingLevel > 0) &&
      (p.recognitionLevel < 80 || p.writingLevel < 80)
    )
  })

  const recommendedCharacters = computed(() => {
    const learned = new Set(userProgress.value.map(p => p.characterId))
    return characters.value.filter(c => !learned.has(c.id)).slice(0, 5)
  })

  function startSession(userId: string) {
    currentSession.value = {
      id: Date.now().toString(),
      userId,
      startTime: new Date(),
      charactersStudied: [],
      accuracy: 0,
      pointsEarned: 0
    }
  }

  function endSession() {
    if (currentSession.value && !currentSession.value.endTime) {
      currentSession.value.endTime = new Date()
    }
    currentSession.value = null
  }

  function updateProgress(characterId: string, recognitionDelta: number, writingDelta: number) {
    const progress = userProgress.value.find(p => p.characterId === characterId)
    if (progress) {
      progress.recognitionLevel = Math.min(100, progress.recognitionLevel + recognitionDelta)
      progress.writingLevel = Math.min(100, progress.writingLevel + writingDelta)
      progress.lastPracticed = new Date()
      progress.practiceCount++
    }
  }

  function selectCharacter(character: Character) {
    selectedCharacter.value = character
  }

  function getCharacterProgress(characterId: string): LearningProgress | undefined {
    return userProgress.value.find(p => p.characterId === characterId)
  }

  return {
    characters,
    userProgress,
    currentSession,
    selectedCharacter,
    masteredCharacters,
    charactersInProgress,
    recommendedCharacters,
    startSession,
    endSession,
    updateProgress,
    selectCharacter,
    getCharacterProgress
  }
})