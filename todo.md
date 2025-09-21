# 0. bug

# 1. 商業模式

建立後台 ?
  選項 1: 保持 GitHub Pages + 無伺服器函數
  - Vercel Functions / Netlify Functions
    - ✅ 免費額度充足
    - ✅ 與靜態站點整合好
    - ✅ 可環境變數隱藏 API key
    - ❌ 冷啟動延遲

  選項 2: 輕量雲端服務
  - Railway / Render
    - ✅ 簡單部署
    - ✅ 免費額度
    - ✅ 持續運行
    - ❌ 需要額外維護

  選項 3: GitHub Pages + Cloudflare Workers
  - ✅ 高效能
  - ✅ 全球 CDN
  - ✅ 免費額度
  - ❌ 學習曲線

  建議方案

  混合架構：GitHub Pages + Vercel Functions

  1. 前端：繼續用 GitHub Pages 部署 Vue 應用
  2. API：Vercel Functions 處理敏感操作
  3. 漸進式遷移：
    - 先移轉會員系統 API
    - 保留字典功能的直接 Supabase 連接（這部分較不敏感）

會員系統

付費獲得更多內容

# 2. AI 寶可夢

線上生成 寫入主題檔

# 4. 測試 playwright ?

確保更改時不要失誤

# 5. 首頁重新設計

目前有點太素了

# 6. 更多 feature

學習名字應該也不用限於名字，應該各種字都可以

手機版面 RWD

學習注音符號 ㄅㄆㄇ的區塊

檢查文章
