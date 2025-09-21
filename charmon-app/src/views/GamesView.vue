<template>
  <div class="games-container">
    <div class="content-wrapper">
      <div v-if="!selectedPokemon" class="pokemon-selection">
      <h2>🌟 選擇你的學習夥伴</h2>
      <p>選擇一隻寶可夢作為你的學習夥伴，一起在字樂園冒險吧！</p>

      <div class="pokemon-grid">
        <div
          v-for="pokemon in availablePokemon"
          :key="pokemon.id"
          class="pokemon-card"
          @click="selectPokemon(pokemon)"
        >
          <div class="pokemon-image">{{ pokemon.emoji }}</div>
          <div class="pokemon-name">{{ pokemon.name }}</div>
          <div class="pokemon-type">{{ getDisplayType(pokemon.theme) }}</div>
          <div class="pokemon-description">{{ getDisplayDescription(pokemon.name) }}</div>
        </div>
      </div>
    </div>

      <div v-else>
        <!-- 已選擇寶可夢後的內容 -->
        <div class="my-pokemon">
          <h3>🎯 你的學習夥伴</h3>
          <div class="current-pokemon">
            <span class="pokemon-emoji">{{ selectedPokemon.emoji }}</span>
            <div class="pokemon-info">
              <div class="pokemon-name">{{ selectedPokemon.name }}</div>
              <div class="pokemon-level">等級 {{ pokemonLevel }}</div>
              <div class="pokemon-exp">經驗值 {{ pokemonExp }}/100</div>
              <div class="exp-bar">
                <div class="exp-fill" :style="{ width: pokemonExp + '%' }"></div>
              </div>
            </div>
            <button @click="changePokemon" class="change-pokemon-btn">更換夥伴</button>
          </div>
        </div>

        <div class="adventure-section">
          <button @click="startAdventure" class="adventure-btn">
            開始冒險
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import pokemonThemesData from '@/data/pokemon-themes.json'

// 定義 Pokemon 類型
interface PokemonVariation {
  type: string
  description: string
}

interface Pokemon {
  id: number
  name: string
  emoji: string
  theme: string
  variations: PokemonVariation[]
}

const router = useRouter()
const userStore = useUserStore()

// 寶可夢相關
const selectedPokemon = ref<Pokemon | null>(null)
const pokemonLevel = ref(1)
const pokemonExp = ref(0)

// 從外部JSON文件載入寶可夢主題
const availablePokemon: Pokemon[] = pokemonThemesData

// 從 localStorage 載入寶可夢資料
onMounted(() => {
  const savedPokemon = localStorage.getItem('selectedPokemon')
  const savedLevel = localStorage.getItem('pokemonLevel')
  const savedExp = localStorage.getItem('pokemonExp')

  if (savedPokemon) {
    selectedPokemon.value = JSON.parse(savedPokemon)
    pokemonLevel.value = parseInt(savedLevel || '1')
    pokemonExp.value = parseInt(savedExp || '0')
  }
})

// 選擇寶可夢
const selectPokemon = (pokemon: Pokemon) => {
  selectedPokemon.value = pokemon
  pokemonLevel.value = 1
  pokemonExp.value = 0

  // 儲存到 localStorage
  localStorage.setItem('selectedPokemon', JSON.stringify(pokemon))
  localStorage.setItem('pokemonLevel', '1')
  localStorage.setItem('pokemonExp', '0')

  // 顯示選擇成功訊息
  console.log(`🎉 你選擇了 ${pokemon.name} 作為學習夥伴！`)
}

// 更換寶可夢
const changePokemon = () => {
  selectedPokemon.value = null
  localStorage.removeItem('selectedPokemon')
  localStorage.removeItem('pokemonLevel')
  localStorage.removeItem('pokemonExp')
}

// 增加經驗值（在完成練習時呼叫）
const gainExp = (amount = 10) => {
  pokemonExp.value += amount

  // 升級檢查
  if (pokemonExp.value >= 100) {
    pokemonLevel.value++
    pokemonExp.value = pokemonExp.value - 100
    if (selectedPokemon.value) {
      console.log(`🎉 ${selectedPokemon.value.name} 升級了！現在是 ${pokemonLevel.value} 級！`)
    }
  }

  // 儲存資料
  localStorage.setItem('pokemonLevel', pokemonLevel.value.toString())
  localStorage.setItem('pokemonExp', pokemonExp.value.toString())
}

const goToWorksheets = () => {
  router.push('/worksheets')
  // 增加經驗值
  if (selectedPokemon.value) {
    gainExp(5)
  }
}

const goToNameLearning = () => {
  router.push('/learn/name')
  // 增加經驗值
  if (selectedPokemon.value) {
    gainExp(5)
  }
}

const startAdventure = () => {
  if (selectedPokemon.value) {
    // 第一關：選擇的主題，然後生成寫作表格
    const pokemonName = selectedPokemon.value.name
    const variations = selectedPokemon.value.variations

    // 導向練習表格，帶入寶可夢主題的文學變化
    router.push({
      path: '/worksheets',
      query: {
        pokemonTheme: pokemonName,
        variations: JSON.stringify(variations)
      }
    })

    // 增加經驗值
    gainExp(10)
  }
}

// 顯示原本的屬性和描述
const getDisplayType = (theme: string) => {
  const typeMap: { [key: string]: string } = {
    'electric': '電系',
    'fire': '火焰系',
    'water': '水流系',
    'grass': '森林系'
  }
  return typeMap[theme] || theme
}

const getDisplayDescription = (name: string) => {
  const descriptionMap: { [key: string]: string } = {
    '皮卡丘': '帶著溫暖的笑容',
    '小火龍': '尾巴燃燒著永不熄滅的火焰',
    '傑尼龜': '殼上閃爍著水波般的光澤',
    '妙蛙種子': '背上長著美麗的花苞'
  }
  return descriptionMap[name] || '可愛的寶可夢'
}
</script>

<style scoped>
.games-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
}



.adventure-section {
  text-align: center;
  margin-top: 30px;
}

.adventure-btn {
  background: #4CAF50;
  border: none;
  color: white;
  padding: 20px 40px;
  border-radius: 50px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.adventure-btn:hover {
  background: #45a049;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

/* 寶可夢選擇相關樣式 */
.pokemon-selection {
  text-align: center;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.pokemon-selection h2 {
  font-size: 2rem;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.pokemon-selection p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

/* 主題區域樣式 */
.theme-section {
  margin-bottom: 40px;
}

.theme-title {
  font-size: 1.3rem;
  color: white;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.pokemon-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.pokemon-card:hover {
  transform: translateY(-10px) scale(1.05);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.pokemon-image {
  font-size: 4rem;
  margin-bottom: 15px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.pokemon-name {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: white;
}

.pokemon-type {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 15px;
  display: inline-block;
}

.pokemon-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

/* 已選擇寶可夢的樣式 */
.my-pokemon {
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.my-pokemon h3 {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.current-pokemon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.pokemon-emoji {
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.pokemon-info {
  flex: 1;
}

.pokemon-info .pokemon-name {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: white;
}

.pokemon-level {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 5px;
}

.pokemon-exp {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.exp-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.change-pokemon-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.change-pokemon-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>