# 字樂園 CharMon - 兒童中文學習平台 🎓

<div align="center">
  <h3>讓學習中文變成一場快樂的冒險！</h3>
  <p>專為 4-12 歲兒童設計的互動式中文學習應用</p>
</div>

## 📖 專案簡介

字樂園（CharMon）是一個創新的中文學習平台，透過遊戲化學習、互動練習和個性化進度追蹤，幫助兒童在輕鬆愉快的環境中掌握中文讀寫能力。本專案特別針對幼稚園和國小低年級學生的學習需求，提供循序漸進的學習路徑。

### 🎯 核心理念

- **寓教於樂**：將學習融入遊戲，提高學習興趣
- **個性化學習**：根據不同年齡段調整學習內容
- **進度可視化**：清晰的成就系統激勵持續學習
- **親子互動**：家長專區支援家庭共學

## ✨ 主要功能

### 🏠 學習中心
- **姓名學習**：幫助孩子認識和書寫自己的名字
  - 筆順動畫演示（HanziWriter 技術支援）
  - 互動式筆畫練習
  - 注音符號對照
  - 浮水印輔助練習模式

- **注音符號學習**：完整的 ㄅㄆㄇ 學習系統
  - 42個符號分類教學（聲母、韻母、聲調）
  - 發音示範與練習
  - Canvas 描寫練習
  - 互動測驗遊戲

### 🎮 遊戲時間
- **寶可夢主題學習**：選擇學習夥伴，一起冒險
  - 文學修辭進階練習
  - 累積描述建構法
  - 經驗值與等級系統
  - 成就徽章收集

### 📝 練習表格
- **客製化練習紙生成**
  - 田字格、九宮格多種格式
  - 自訂文字內容和重複次數
  - 注音符號顯示切換
  - 高解析度 PNG 下載
  - 遊戲模式特殊版型

### 🏆 成就系統
- 學習進度追蹤
- 積分獎勵機制
- 連續學習天數記錄
- 學習成就展示

## 🛠 技術架構

### 前端技術棧

```
Vue 3.5.18          - 漸進式 JavaScript 框架
TypeScript 5.8      - 類型安全的 JavaScript 超集
Vite 7.0            - 新一代前端構建工具
Vue Router 4.5      - 官方路由管理
Pinia 3.0           - 狀態管理庫
Element Plus 2.11   - UI 組件庫
HanziWriter 3.7     - 漢字筆順動畫庫
```

### 專案結構

```
CharMon/
├── charmon-app/              # Vue 3 應用主目錄
│   ├── src/
│   │   ├── components/       # 可重用組件
│   │   │   ├── AppLayout.vue
│   │   │   └── StrokeOrderViewer.vue
│   │   ├── views/           # 頁面組件
│   │   │   ├── HomeView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── LearnView.vue
│   │   │   ├── NameLearningView.vue
│   │   │   ├── ZhuyinLearningView.vue
│   │   │   ├── GamesView.vue
│   │   │   └── WorksheetsView.vue
│   │   ├── stores/          # Pinia 狀態管理
│   │   │   ├── user.ts
│   │   │   └── learning.ts
│   │   ├── router/          # 路由配置
│   │   └── assets/          # 靜態資源
│   ├── package.json
│   └── vite.config.ts
├── docs/                    # 專案文檔
│   └── night-development-prompt.md
├── demo.jpg                 # UI 設計參考
├── 夜間開發總結.md          # 開發記錄
└── README.md               # 本文件
```

## 🚀 快速開始

### 環境需求

- Node.js 20.19.0+ 或 22.12.0+
- npm 10.x 或更高版本

### 安裝步驟

```bash
# 克隆專案
git clone https://github.com/joechiboo/CharMon.git
cd CharMon

# 進入應用目錄
cd charmon-app

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

### 可用腳本

```bash
npm run dev        # 啟動開發服務器
npm run build      # 構建生產版本
npm run preview    # 預覽構建結果
npm run type-check # TypeScript 類型檢查
npm run lint       # ESLint 代碼檢查
npm run format     # Prettier 格式化
```

## 🎨 設計特色

### UI/UX 設計原則

- **童趣風格**：鮮豔色彩、可愛圖標、流暢動畫
- **直觀操作**：大按鈕、清晰導航、即時反饋
- **響應式設計**：完美適配手機、平板、桌面
- **無障礙設計**：支援鍵盤導航、螢幕閱讀器

### 視覺風格

- **主色調**：綠色系 (#4CAF50) + 藍色系 (#2196F3)
- **漸層背景**：營造活潑學習氛圍
- **玻璃態效果**：現代化半透明設計
- **動畫效果**：平滑過渡、微互動反饋

## 📚 教育理念

### 學習方法論

1. **多感官學習**：結合視覺、聽覺、觸覺
2. **循序漸進**：從基礎到進階的學習路徑
3. **即時反饋**：錯誤糾正和正向鼓勵
4. **重複練習**：通過遊戲化減少枯燥感

### 年齡分層設計

- **幼稚園 (4-6歲)**
  - 重點：姓名認知、基礎筆畫
  - 特色：浮水印輔助、大字體顯示

- **國小低年級 (7-9歲)**
  - 重點：注音符號、常用字學習
  - 特色：遊戲化學習、成就系統

- **國小中高年級 (10-12歲)**
  - 重點：文學修辭、進階書寫
  - 預留：作文輔助、閱讀理解

## 🔮 未來規劃

### 短期目標 (1-3個月)

- [ ] 完善筆畫練習獨立模式
- [ ] 新增更多遊戲類型
- [ ] 優化手機端體驗
- [ ] 增加常用字詞庫

### 中期目標 (3-6個月)

- [ ] AI 輔助學習建議
- [ ] 語音識別評分系統
- [ ] 家長監控儀表板
- [ ] 離線學習支援 (PWA)

### 長期願景 (6-12個月)

- [ ] 多語言版本（簡體中文、英文）
- [ ] 社交學習功能
- [ ] 自適應學習路徑
- [ ] 學校版本整合

## 👥 貢獻指南

歡迎各種形式的貢獻！

### 如何貢獻

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 問題回報

如發現錯誤或有改進建議，請在 [Issues](https://github.com/joechiboo/CharMon/issues) 頁面提出。

## 📄 授權協議

本專案採用 MIT 授權協議

## 🙏 致謝

- [HanziWriter](https://hanziwriter.org/) - 提供優秀的漢字筆順動畫支援
- [Element Plus](https://element-plus.org/) - 美觀的 UI 組件庫
- [Vue.js](https://vuejs.org/) - 強大的前端框架
- 所有貢獻者和使用者的寶貴意見

## 📞 聯絡資訊

- GitHub: [@joechiboo](https://github.com/joechiboo)
- 專案網址: [https://github.com/joechiboo/CharMon](https://github.com/joechiboo/CharMon)

---

<div align="center">
  <p>用 ❤️ 為孩子們打造更好的中文學習體驗</p>
  <p>© 2025 字樂園 CharMon. All rights reserved.</p>
  <p>🤖 Generated with <a href="https://claude.ai/code">Claude Code</a></p>
</div>