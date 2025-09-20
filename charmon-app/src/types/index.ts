export interface User {
  id: string
  name: string
  age: number
  gradeLevel: 'kindergarten' | 'elementary-low' | 'elementary-high'
  avatar?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Character {
  id: string
  character: string
  pinyin: string
  strokeCount: number
  strokeOrder: string[]
  meaning: string
  examples: string[]
  difficulty: number
}

export interface LearningProgress {
  id: string
  userId: string
  characterId: string
  recognitionLevel: number
  writingLevel: number
  lastPracticed: Date
  practiceCount: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  requirement: string
  points: number
}

export interface UserAchievement {
  userId: string
  achievementId: string
  unlockedAt: Date
}

export interface RewardPoint {
  userId: string
  points: number
  history: RewardHistory[]
}

export interface RewardHistory {
  id: string
  points: number
  reason: string
  timestamp: Date
  type: 'earned' | 'spent'
}

export interface PracticeSheet {
  id: string
  userId: string
  characters: string[]
  type: 'stroke' | 'recognition' | 'mixed'
  createdAt: Date
  downloadUrl?: string
}

export interface LearningSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  charactersStudied: string[]
  accuracy: number
  pointsEarned: number
}