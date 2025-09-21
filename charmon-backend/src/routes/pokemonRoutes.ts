import { Router, Request, Response } from 'express'
import { PokemonService } from '../services/pokemonService'
import {
  PokemonGenerationRequest,
  GenerateResponse,
  ThemesResponse,
  ThemeResponse,
  DeleteResponse,
  AgeGroup,
  GenerationType
} from '../types/pokemon'

const router = Router()
const pokemonService = new PokemonService()

// 生成寶可夢主題
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pokemonName, ageGroup, generationType } = req.body as PokemonGenerationRequest

    // 驗證輸入
    if (!pokemonName) {
      res.status(400).json({
        success: false,
        error: '寶可夢名稱不能為空'
      } as GenerateResponse)
      return
    }

    if (!pokemonService.validatePokemonName(pokemonName)) {
      res.status(400).json({
        success: false,
        error: '寶可夢名稱格式無效'
      } as GenerateResponse)
      return
    }

    // 驗證年齡組
    if (ageGroup && !Object.values(AgeGroup).includes(ageGroup)) {
      res.status(400).json({
        success: false,
        error: '無效的年齡組'
      } as GenerateResponse)
      return
    }

    // 驗證生成類型
    if (generationType && !Object.values(GenerationType).includes(generationType)) {
      res.status(400).json({
        success: false,
        error: '無效的生成類型'
      } as GenerateResponse)
      return
    }

    console.log(`🎮 收到生成請求: ${pokemonName}`)

    const result = await pokemonService.generatePokemonTheme({
      pokemonName: pokemonName.trim(),
      ageGroup,
      generationType
    })

    res.json({
      success: true,
      data: result
    } as GenerateResponse)

  } catch (error) {
    console.error('生成寶可夢主題失敗:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '服務器內部錯誤'
    } as GenerateResponse)
  }
})

// 獲取所有主題
router.get('/themes', async (req: Request, res: Response): Promise<void> => {
  try {
    const themes = await pokemonService.getAllThemes()

    // 轉換為 PokemonThemeFile 格式
    const themeFiles = themes.map(theme => ({
      id: theme.pokemonName + '-' + theme.generatedAt.getTime(),
      pokemonName: theme.pokemonName,
      theme,
      filePath: `${theme.pokemonName}.json`,
      createdAt: theme.generatedAt,
      updatedAt: theme.generatedAt
    }))

    res.json({
      themes: themeFiles,
      total: themeFiles.length
    } as ThemesResponse)

  } catch (error) {
    console.error('獲取主題列表失敗:', error)
    res.status(500).json({
      themes: [],
      total: 0,
      error: '服務器內部錯誤'
    })
  }
})

// 根據ID獲取主題
router.get('/themes/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const theme = await pokemonService.getThemeById(id)

    if (!theme) {
      res.status(404).json({
        error: '主題不存在'
      })
      return
    }

    res.json({
      theme: {
        id,
        pokemonName: theme.pokemonName,
        theme,
        filePath: '',
        createdAt: theme.generatedAt,
        updatedAt: theme.generatedAt
      }
    } as ThemeResponse)

  } catch (error) {
    console.error('獲取主題失敗:', error)
    res.status(500).json({
      error: '服務器內部錯誤'
    })
  }
})

// 刪除主題
router.delete('/themes/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const success = await pokemonService.deleteTheme(id)

    if (!success) {
      res.status(404).json({
        success: false,
        error: '主題不存在或刪除失敗'
      } as DeleteResponse)
      return
    }

    res.json({
      success: true
    } as DeleteResponse)

  } catch (error) {
    console.error('刪除主題失敗:', error)
    res.status(500).json({
      success: false,
      error: '服務器內部錯誤'
    } as DeleteResponse)
  }
})

// 獲取服務狀態
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await pokemonService.getServiceStatus()
    res.json(status)
  } catch (error) {
    console.error('獲取服務狀態失敗:', error)
    res.status(500).json({
      error: '服務器內部錯誤'
    })
  }
})

// 獲取統計信息
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await pokemonService.getGenerationStats()
    res.json(stats)
  } catch (error) {
    console.error('獲取統計信息失敗:', error)
    res.status(500).json({
      error: '服務器內部錯誤'
    })
  }
})

// 搜索寶可夢主題
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query } = req.query

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        themes: [],
        total: 0,
        error: '搜索關鍵詞不能為空'
      })
      return
    }

    const allThemes = await pokemonService.getAllThemes()
    const filteredThemes = allThemes.filter(theme =>
      theme.pokemonName.toLowerCase().includes(query.toLowerCase()) ||
      theme.elements.some(element =>
        element.content.toLowerCase().includes(query.toLowerCase())
      )
    )

    res.json({
      themes: filteredThemes,
      total: filteredThemes.length,
      query
    })

  } catch (error) {
    console.error('搜索主題失敗:', error)
    res.status(500).json({
      themes: [],
      total: 0,
      error: '服務器內部錯誤'
    })
  }
})

// 驗證寶可夢名稱
router.post('/validate-name', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pokemonName } = req.body

    if (!pokemonName) {
      res.json({
        valid: false,
        error: '寶可夢名稱不能為空'
      })
      return
    }

    const valid = pokemonService.validatePokemonName(pokemonName)

    res.json({
      valid,
      error: valid ? null : '寶可夢名稱格式無效'
    })

  } catch (error) {
    console.error('驗證寶可夢名稱失敗:', error)
    res.status(500).json({
      valid: false,
      error: '服務器內部錯誤'
    })
  }
})

// 健康檢查
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Pokemon Theme Generator API'
  })
})

export default router