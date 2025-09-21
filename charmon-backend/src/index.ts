import express from 'express'
import cors from 'cors'
import pokemonRoutes from './routes/pokemonRoutes'

const app = express()
const PORT = process.env.PORT || 3001

// 中間件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 請求日誌中間件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} - ${req.method} ${req.path}`)
  next()
})

// 根路徑
app.get('/', (req, res) => {
  res.json({
    message: '🎮 AI 寶可夢文學練習生成器 API',
    version: '1.0.0',
    endpoints: {
      generate: 'POST /api/pokemon/generate',
      themes: 'GET /api/pokemon/themes',
      status: 'GET /api/pokemon/status',
      stats: 'GET /api/pokemon/stats',
      health: 'GET /api/pokemon/health'
    },
    documentation: 'https://github.com/your-repo/charmon#api-documentation'
  })
})

// API 路由
app.use('/api/pokemon', pokemonRoutes)

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: 'API 端點不存在',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'POST /api/pokemon/generate',
      'GET /api/pokemon/themes',
      'GET /api/pokemon/themes/:id',
      'DELETE /api/pokemon/themes/:id',
      'GET /api/pokemon/status',
      'GET /api/pokemon/stats',
      'GET /api/pokemon/search',
      'POST /api/pokemon/validate-name',
      'GET /api/pokemon/health'
    ]
  })
})

// 錯誤處理中間件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 服務器錯誤:', err)

  res.status(500).json({
    error: '服務器內部錯誤',
    message: process.env.NODE_ENV === 'development' ? err.message : '請聯繫管理員',
    timestamp: new Date().toISOString()
  })
})

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🚀 AI 寶可夢文學練習生成器 API 服務器啟動`)
  console.log(`📍 服務地址: http://localhost:${PORT}`)
  console.log(`🎮 API 端點: http://localhost:${PORT}/api/pokemon`)
  console.log(`💡 健康檢查: http://localhost:${PORT}/api/pokemon/health`)
  console.log(`📊 服務狀態: http://localhost:${PORT}/api/pokemon/status`)

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 開發模式已啟用`)
  }
})

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('📴 收到 SIGTERM 信號，正在關閉服務器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('📴 收到 SIGINT 信號，正在關閉服務器...')
  process.exit(0)
})

export default app