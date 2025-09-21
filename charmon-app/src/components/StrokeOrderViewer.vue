<template>
  <div class="stroke-order-viewer">
    <div class="viewer-header">
      <h3>{{ character }} 的筆順</h3>
      <button @click="closeViewer" class="close-btn">✕</button>
    </div>

    <div class="viewer-content">
      <div ref="hanziTarget" class="hanzi-writer-container"></div>

      <div class="controls">
        <button @click="animateStroke" class="control-btn primary">
          🎬 播放筆順
        </button>
        <button @click="startQuiz" class="control-btn secondary">
          ✍️ 練習模式
        </button>
        <button @click="loopAnimation" class="control-btn secondary">
          🔄 循環播放
        </button>
        <button @click="resetWriter" class="control-btn secondary">
          🔄 重置
        </button>
      </div>

      <div class="character-info">
        <div class="info-item">
          <span class="label">筆劃：</span>
          <span class="value">{{ strokeCount }} 劃</span>
        </div>
        <div class="info-item">
          <span class="label">部首：</span>
          <span class="value">{{ radical || '載入中...' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import HanziWriter from 'hanzi-writer'
import { getRadicalWithZhuyin, getCharacterInfo, clearCache } from '@/utils/dictionaryV2'

interface Props {
  character: string
  visible: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const hanziTarget = ref<HTMLElement | null>(null)
const strokeCount = ref<number>(0)
const radical = ref<string>('')
let writer: HanziWriter | null = null
const isLooping = ref(false)

// 載入字符資訊
const loadCharacterInfo = async () => {
  try {
    console.log('🔍 StrokeOrderViewer 載入字符資訊:', props.character)

    // 如果是「家」字，先清除緩存確保獲取最新資料
    if (props.character === '家') {
      clearCache()
      console.log('🧹 StrokeOrderViewer 清除緩存後重新載入「家」字')
    }

    const [charInfo, radicalWithZhuyin] = await Promise.all([
      getCharacterInfo(props.character),
      getRadicalWithZhuyin(props.character)
    ])

    console.log('📊 StrokeOrderViewer 字符資訊結果:', {
      character: props.character,
      charInfo,
      radicalWithZhuyin
    })

    if (charInfo) {
      strokeCount.value = charInfo.strokeCount
    } else {
      strokeCount.value = 0
    }

    radical.value = radicalWithZhuyin
  } catch (error) {
    console.error('載入字符資訊失敗:', error)
    strokeCount.value = 0
    radical.value = '？'
  }
}

// 建立 HanziWriter 實例
const createWriter = async () => {
  if (!hanziTarget.value || !props.character) return

  try {
    // 清理舊的實例
    if (writer) {
      writer = null
    }

    // 建立新的 HanziWriter 實例
    writer = HanziWriter.create(hanziTarget.value, props.character, {
      width: 300,
      height: 300,
      padding: 10,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 300,
      strokeColor: '#2c3e50',
      radicalColor: '#e74c3c',
      outlineColor: '#bdc3c7',
      charDataLoader: function(char) {
        return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${char}.json`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Character data not found')
            }
            return response.json()
          })
      }
    })

    // 載入字符資訊
    await loadCharacterInfo()

    // 如果字典沒有此字符的筆劃數，嘗試從 HanziWriter API 獲取
    if (strokeCount.value === 0) {
      try {
        const charData = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${props.character}.json`)
          .then(r => r.json())

        strokeCount.value = charData.strokes?.length || 0
      } catch (error) {
        console.warn('無法從 API 獲取字符詳細信息:', error)
        strokeCount.value = 0
      }
    }

  } catch (error) {
    console.error('建立 HanziWriter 失敗:', error)
    // 如果無法載入字符資料，顯示錯誤信息
    if (hanziTarget.value) {
      hanziTarget.value.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #999; flex-direction: column;">
          <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
          <div>暫無 "${props.character}" 的筆順資料</div>
          <div style="font-size: 12px; margin-top: 5px;">此字符可能不在筆順資料庫中</div>
        </div>
      `
    }
  }
}

// 播放筆順動畫
const animateStroke = () => {
  if (!writer) return
  isLooping.value = false
  writer.animateCharacter()
}

// 開始測驗模式
const startQuiz = () => {
  if (!writer) return
  isLooping.value = false
  writer.quiz({
    onMistake: (strokeData: object) => {
      console.log('筆畫錯誤:', strokeData)
    },
    onCorrectStroke: (strokeData: object) => {
      console.log('筆畫正確:', strokeData)
    },
    onComplete: () => {
      console.log('練習完成!')
    }
  })
}

// 循環播放動畫
const loopAnimation = () => {
  if (!writer) return
  isLooping.value = !isLooping.value

  if (isLooping.value) {
    writer.loopCharacterAnimation()
  } else {
    writer.pauseAnimation()
  }
}

// 重置 writer
const resetWriter = () => {
  if (!writer) return
  isLooping.value = false
  writer.cancelQuiz()
  writer.hideCharacter()
  // 短暫延遲後重新顯示字符
  setTimeout(() => {
    if (writer) {
      writer.showCharacter()
    }
  }, 100)
}

// 關閉檢視器
const closeViewer = () => {
  isLooping.value = false
  if (writer) {
    writer.pauseAnimation()
    writer.cancelQuiz()
  }
  emit('close')
}

// 處理 ESC 鍵事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    closeViewer()
  }
}

// 監聽字符變化
watch(() => props.character, () => {
  if (props.visible && props.character) {
    createWriter()
  }
})

// 監聽可見性變化
watch(() => props.visible, (newVisible) => {
  if (newVisible && props.character) {
    createWriter()
  } else if (!newVisible) {
    isLooping.value = false
    if (writer) {
      writer.pauseAnimation()
      writer.cancelQuiz()
      writer = null
    }
  }
})

onMounted(() => {
  if (props.visible && props.character) {
    createWriter()
  }
  // 添加鍵盤事件監聽
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (writer) {
    writer.pauseAnimation()
    writer.cancelQuiz()
    writer = null
  }
  // 移除鍵盤事件監聽
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.stroke-order-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.viewer-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #d32f2f;
}

.viewer-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.hanzi-writer-container {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #fafafa;
}

.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 25px;
}

.control-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.control-btn.primary {
  background: #4CAF50;
  color: white;
}

.control-btn.secondary {
  background: #2196F3;
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn.primary:hover {
  background: #45a049;
}

.control-btn.secondary:hover {
  background: #1976D2;
}

.character-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  color: #666;
  min-width: 80px;
}

.value {
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .viewer-content {
    padding: 20px;
    margin: 10px;
  }

  .controls {
    grid-template-columns: 1fr;
  }

  .hanzi-writer-container {
    transform: scale(0.8);
  }
}
</style>