🎯 核心目標
在現有的 CharMon 中文學習應用中，新增多人聲調測驗競賽模式
🎮 遊戲機制設計
多人淘汰賽規則

參與限制：遊戲開始後加入的人只能觀戰
晉級條件：答對人數 ≥ 總人數的一半才能進入下一關
特殊情況處理：

無人答對 → 所有人繼續下一題
答對人數不足 → 繼續遊戲但提高難度
防卡死機制：單輪最多5題，超過則強制晉級



遊戲流程

等待大廳 (4-16人)
競賽階段 (淘汰制)
決賽階段 (快速搶答)
結果統計 (排名獎勵)

🛠️ 技術實現方案
前端架構 (Vue 3)
新增組件：
├── GameModeSelector.vue (遊戲模式選擇)
├── ToneChallengeView.vue (單人聲調測驗)
└── MultiplayerLobby.vue (多人大廳) - 需新建
└── MultiplayerGame.vue (多人競賽) - 需新建

新增 Store：
├── game.ts (遊戲狀態管理)
└── multiplayer.ts (多人遊戲狀態) - 需新建

路由更新：
├── /game-modes (模式選擇)
├── /tone-challenge (單人模式)
├── /multiplayer-lobby (多人大廳) - 需新建
└── /multiplayer-game (多人競賽) - 需新建
後端架構選擇
推薦：Supabase Realtime

成本：分離計費，可控
免費額度：2M messages + 200 connections (Free Plan)
整合：與現有 Vue 專案整合簡單

📝 具體開發任務
階段一：基礎架構 (1-2週)

✅ 已完成：單人遊戲模式

GameModeSelector.vue
ToneChallengeView.vue
game.ts store


待完成：多人基礎設施

 設定 Supabase 專案
 建立 Realtime 連接
 創建房間管理系統
 多人遊戲 Store



階段二：多人核心功能 (2-3週)

多人大廳系統

 MultiplayerLobby.vue
 房間創建/加入邏輯
 玩家列表同步
 準備狀態管理


競賽遊戲邏輯

 MultiplayerGame.vue
 題目同步發送
 答案收集與判定
 淘汰邏輯實現
 實時排行榜



階段三：進階功能 (1-2週)

觀眾系統

 觀戰模式介面
 預測投票功能
 加油鼓勵系統


遊戲體驗優化

 動態難度調整
 特殊回合機制
 音效與動畫



階段四：部署與測試 (1週)

部署準備

 Supabase 生產環境設定
 前端部署 (Vercel/Netlify)
 效能測試與優化



💰 成本預估 (Supabase)
假設每日活躍：
- 50場遊戲/天 × 30天 = 1,500場/月
- 每場約161條消息 = 241,500消息/月
- 平均4人同時在線 = 峰值連接數 < 200

結論：Free Plan 完全夠用！
🎨 UI/UX 設計要點

維持現有 CharMon 設計風格
響應式設計 (手機/平板/桌面)
即時反饋與動畫效果
清晰的遊戲狀態提示

🔍 測試計劃

 單人模式回歸測試
 多人連接穩定性測試
 網路斷線重連測試
 不同裝置相容性測試

🚀 發布策略

Beta 測試：小範圍用戶測試
漸進發布：先發布單人模式
正式發布：多人模式上線

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

# 2. 更多 feature

學習名字應該也不用限於名字，應該各種字都可以

手機版面 RWD

AI 寶可夢 線上生成 寫入主題檔

學習注音符號 ㄅㄆㄇ的區塊

檢查文章
