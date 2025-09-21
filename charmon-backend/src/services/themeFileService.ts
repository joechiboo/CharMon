import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PokemonThemeGeneration, PokemonThemeFile } from '../types/pokemon'

export class ThemeFileService {
  private themesDir: string
  private indexFile: string

  constructor() {
    this.themesDir = path.join(process.cwd(), 'src', 'data', 'pokemon-themes')
    this.indexFile = path.join(this.themesDir, 'index.json')
  }

  // 初始化目錄
  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.themesDir)
    } catch {
      await fs.mkdir(this.themesDir, { recursive: true })
    }
  }

  // 讀取索引文件
  private async readIndex(): Promise<PokemonThemeFile[]> {
    try {
      const data = await fs.readFile(this.indexFile, 'utf-8')
      const themes = JSON.parse(data)

      // 轉換日期字符串為 Date 對象
      return themes.map((theme: any) => ({
        ...theme,
        createdAt: new Date(theme.createdAt),
        updatedAt: new Date(theme.updatedAt),
        theme: {
          ...theme.theme,
          generatedAt: new Date(theme.theme.generatedAt)
        }
      }))
    } catch (error) {
      console.log('索引文件不存在或無效，創建新的索引')
      return []
    }
  }

  // 寫入索引文件
  private async writeIndex(themes: PokemonThemeFile[]): Promise<void> {
    await this.ensureDirectoryExists()
    const data = JSON.stringify(themes, null, 2)
    await fs.writeFile(this.indexFile, data, 'utf-8')
  }

  // 生成文件名
  private generateFileName(pokemonName: string): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const randomSuffix = Math.random().toString(36).substring(2, 5)
    const safeName = pokemonName.replace(/[^\w\u4e00-\u9fff]/g, '')
    return `${safeName}-${date}-${randomSuffix}.json`
  }

  // 保存主題
  async saveTheme(theme: PokemonThemeGeneration): Promise<string> {
    await this.ensureDirectoryExists()

    const id = uuidv4()
    const fileName = this.generateFileName(theme.pokemonName)
    const filePath = path.join(this.themesDir, fileName)

    const themeFile: PokemonThemeFile = {
      id,
      pokemonName: theme.pokemonName,
      theme,
      filePath: fileName,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 寫入主題文件
    await fs.writeFile(filePath, JSON.stringify(theme, null, 2), 'utf-8')

    // 更新索引
    const index = await this.readIndex()
    index.push(themeFile)
    await this.writeIndex(index)

    console.log(`✅ 主題已保存: ${fileName}`)
    return id
  }

  // 獲取所有主題
  async getAllThemes(): Promise<PokemonThemeGeneration[]> {
    const index = await this.readIndex()
    return index.map(themeFile => themeFile.theme)
  }

  // 根據ID獲取主題
  async getThemeById(id: string): Promise<PokemonThemeGeneration | null> {
    const index = await this.readIndex()
    const themeFile = index.find(tf => tf.id === id)

    if (!themeFile) {
      return null
    }

    try {
      const filePath = path.join(this.themesDir, themeFile.filePath)
      const data = await fs.readFile(filePath, 'utf-8')
      const theme = JSON.parse(data)

      // 轉換日期字符串為 Date 對象
      return {
        ...theme,
        generatedAt: new Date(theme.generatedAt)
      }
    } catch (error) {
      console.error(`讀取主題文件失敗: ${themeFile.filePath}`, error)
      return null
    }
  }

  // 根據寶可夢名稱搜索主題
  async getThemesByPokemonName(pokemonName: string): Promise<PokemonThemeGeneration[]> {
    const index = await this.readIndex()
    const matchingFiles = index.filter(tf =>
      tf.pokemonName.toLowerCase().includes(pokemonName.toLowerCase())
    )

    const themes: PokemonThemeGeneration[] = []
    for (const themeFile of matchingFiles) {
      const theme = await this.getThemeById(themeFile.id)
      if (theme) {
        themes.push(theme)
      }
    }

    return themes
  }

  // 刪除主題
  async deleteTheme(id: string): Promise<boolean> {
    const index = await this.readIndex()
    const themeIndex = index.findIndex(tf => tf.id === id)

    if (themeIndex === -1) {
      return false
    }

    const themeFile = index[themeIndex]

    try {
      // 刪除主題文件
      const filePath = path.join(this.themesDir, themeFile.filePath)
      await fs.unlink(filePath)

      // 從索引中移除
      index.splice(themeIndex, 1)
      await this.writeIndex(index)

      console.log(`🗑️ 主題已刪除: ${themeFile.filePath}`)
      return true
    } catch (error) {
      console.error(`刪除主題失敗: ${themeFile.filePath}`, error)
      return false
    }
  }

  // 清理無效的索引項目
  async cleanupIndex(): Promise<number> {
    const index = await this.readIndex()
    const validThemes: PokemonThemeFile[] = []
    let removedCount = 0

    for (const themeFile of index) {
      try {
        const filePath = path.join(this.themesDir, themeFile.filePath)
        await fs.access(filePath)
        validThemes.push(themeFile)
      } catch {
        console.log(`清理無效索引項目: ${themeFile.filePath}`)
        removedCount++
      }
    }

    if (removedCount > 0) {
      await this.writeIndex(validThemes)
      console.log(`🧹 清理完成，移除了 ${removedCount} 個無效項目`)
    }

    return removedCount
  }

  // 獲取存儲統計
  async getStorageStats() {
    const index = await this.readIndex()
    let totalSize = 0

    for (const themeFile of index) {
      try {
        const filePath = path.join(this.themesDir, themeFile.filePath)
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      } catch {
        // 文件不存在，忽略
      }
    }

    return {
      totalThemes: index.length,
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
      directory: this.themesDir
    }
  }

  // 匯出所有主題
  async exportAllThemes(): Promise<PokemonThemeGeneration[]> {
    return await this.getAllThemes()
  }

  // 批量導入主題
  async importThemes(themes: PokemonThemeGeneration[]): Promise<string[]> {
    const importedIds: string[] = []

    for (const theme of themes) {
      try {
        const id = await this.saveTheme(theme)
        importedIds.push(id)
      } catch (error) {
        console.error(`導入主題失敗: ${theme.pokemonName}`, error)
      }
    }

    console.log(`📥 批量導入完成，成功導入 ${importedIds.length}/${themes.length} 個主題`)
    return importedIds
  }
}