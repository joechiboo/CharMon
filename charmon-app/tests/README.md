# 🧪 CharMon 測試文檔

## 概述

這個專案使用 **Playwright** 進行端到端測試，確保所有功能在真實瀏覽器環境中正常運作。

## 測試結構

```
tests/
├── e2e/
│   ├── 01-navigation.spec.ts     # 導航和基本功能測試
│   ├── 02-worksheets.spec.ts     # 練習表生成器測試
│   ├── 03-dictionary.spec.ts     # 字典系統測試
│   ├── 04-pokemon-api.spec.ts    # 寶可夢 API 後端測試
│   └── 05-performance.spec.ts    # 性能和穩定性測試
└── README.md                     # 本文檔
```

## 測試涵蓋範圍

### 🧭 導航測試 (01-navigation.spec.ts) ✅ 狀態良好
- ✅ 首頁載入和基本元素檢查
- ✅ 主選單導航功能
- ✅ 響應式設計 (桌面/平板/手機)
- ✅ 跨瀏覽器兼容性

### 📝 練習表測試 (02-worksheets.spec.ts) ⚠️ 需要修正
- ⚠️ 基本練習表生成功能 (認證問題)
- 🔧 不同格式選項 (田字格/米字格/簡單格)
- 🔧 字數限制驗證 (最大 100 字)
- 🔧 寶可夢主題模式
- 🔧 下載功能測試

**已知問題**: 需要登入認證，目前登入流程未完全正確工作

### 📚 字典系統測試 (03-dictionary.spec.ts) ⚠️ 需要修正
- ⚠️ 字典查詢功能 (認證問題)
- 🔧 筆順動畫播放
- 🔧 字典管理後台
- 🔧 數據同步功能
- 🔧 Supabase 連接測試

**已知問題**: 需要登入認證和 Supabase 配置

### 🎮 寶可夢 API 測試 (04-pokemon-api.spec.ts) 🔧 部分可用
- 🔧 API 健康檢查和狀態監控
- 🔧 主題生成 (模板模式/混合模式)
- 🔧 年齡適宜性控制
- 🔧 名稱驗證和錯誤處理
- 🔧 主題管理 (列表/搜索/統計)
- 🔧 並發請求處理

**注意事項**: 需要後端服務器運行，部分測試可能因為 API 限制而失敗

### ⚡ 性能測試 (05-performance.spec.ts) 🔧 部分可用
- 🔧 頁面載入時間 (< 5 秒)
- ⚠️ 練習表生成時間 (需要登入)
- 🔧 API 響應時間 (< 3 秒)
- 🔧 記憶體洩漏檢測
- ⚠️ 大量文字處理 (需要登入)
- 🔧 網路異常處理
- 🔧 瀏覽器兼容性

## 🚀 如何執行測試

### 前置要求
```bash
# 確保前端服務運行（必須）
cd charmon-app && npm run dev     # 會在 http://localhost:5174/CharMon/

# 確保後端服務運行（API 測試需要）
cd charmon-backend && npm run dev # 會在 http://localhost:3001
```

### 執行所有測試
```bash
cd charmon-app
npm run test:e2e
```

### 互動式測試 (推薦)
```bash
npm run test:e2e:ui
```

### 偵錯模式
```bash
npm run test:e2e:debug
```

### 查看測試報告
```bash
npm run test:e2e:report
```

### 執行特定測試
```bash
# 只測試導航功能
npx playwright test 01-navigation

# 只測試 API 功能
npx playwright test 04-pokemon-api

# 只在 Chrome 上測試
npx playwright test --project=chromium
```

## 🎯 測試策略

### 多瀏覽器測試
- ✅ **Chromium** (Chrome/Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)
- ✅ **Mobile Chrome** (Pixel 5)
- ✅ **Mobile Safari** (iPhone 12)

### 測試環境
- 🖥️ **本地開發**: localhost:5173 (前端) + localhost:3001 (後端)
- 🤖 **CI/CD**: GitHub Actions 自動測試
- 📱 **移動裝置**: 模擬真實移動設備

### 測試資料管理
- 🔄 **自動清理**: 每次測試後清理測試數據
- 🎲 **隨機數據**: 使用隨機寶可夢名稱避免衝突
- 💾 **快照測試**: 重要 UI 元素的視覺回歸測試

## 📊 測試報告

測試完成後會生成詳細報告：

- **HTML 報告**: `playwright-report/index.html`
- **JSON 結果**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`
- **截圖**: 失敗時自動截圖
- **錄影**: 失敗時自動錄製

## 🔧 測試配置

測試配置位於 `playwright.config.ts`：

- **並行執行**: 提高測試速度
- **重試機制**: CI 環境下失敗自動重試 2 次
- **超時設置**: 避免測試卡住
- **追蹤功能**: 失敗時記錄詳細執行過程

## 🚨 常見問題和解決方案

### ⚡ 快速診斷指令

```bash
# 檢查服務狀態
curl http://localhost:5174/CharMon/     # 前端 (注意正確端口)
curl http://localhost:3001/api/pokemon/health  # 後端

# 運行穩定的測試
npx playwright test tests/e2e/01-navigation.spec.ts --project=chromium

# 查看詳細錯誤
npm run test:e2e:ui  # 互動式調試模式
```

### 🔧 具體問題解決

#### 1. "locator('h1') not found" 錯誤
**症狀**: 找不到頁面標題元素
**原因**: 頁面需要登入認證
**解決方案**:
```bash
# 手動在瀏覽器登入後再運行測試
# 或只運行不需要認證的導航測試
npx playwright test tests/e2e/01-navigation.spec.ts
```

#### 2. "Base URL /CharMon/" 錯誤
**症狀**: 頁面顯示 base URL 錯誤訊息
**原因**: Playwright 配置和 Vite 配置不同步
**解決方案**: 已修正，確保使用正確的 URL

#### 3. "webServer timeout" 錯誤
**症狀**: 測試啟動時 webServer 超時
**原因**: 端口衝突或服務啟動失敗
**解決方案**:
```bash
# 手動啟動開發服務器
cd charmon-app && npm run dev
# 然後運行測試（webServer 配置已停用）
```

#### 4. 測試執行緩慢或超時
**症狀**: 測試執行時間過長
**解決方案**:
```bash
# 單獨運行測試檔案
npx playwright test tests/e2e/01-navigation.spec.ts --project=chromium
# 或增加超時時間
npx playwright test --timeout=60000
```

### 性能測試失敗

- 確保沒有其他應用佔用系統資源
- 檢查網路連接是否穩定
- 調整測試超時設置

### API 測試失敗

- 確認後端服務正常運行
- 檢查 API 端點是否正確
- 驗證測試數據格式

## 🔄 持續改進

### 定期更新測試
- 📅 **每週檢查**: 確保測試覆蓋新功能
- 🔍 **月度審查**: 評估測試效果和性能
- 📈 **季度優化**: 改進測試策略和工具

### 測試覆蓋率目標
- 🎯 **E2E 覆蓋率**: > 80% 核心功能
- 🔧 **API 覆蓋率**: > 95% 端點測試
- 🖥️ **瀏覽器覆蓋率**: 100% 主流瀏覽器

---

## 📝 更新記錄

### 2025-09-21 - 測試修正和文檔更新
- ✅ 修正導航測試的 DOM 選擇器問題
- ✅ 更新 Playwright 配置以支援正確的 base URL (`/CharMon/`)
- ✅ 解決 webServer 配置衝突問題
- ⚠️ 識別認證相關測試問題，需要進一步修正
- 📝 更新測試文檔，反映實際測試狀態

### 建議的下一步
1. **修正認證流程**: 改善登入測試的穩定性
2. **簡化測試設置**: 考慮使用模擬登入狀態
3. **增加測試覆蓋**: 為新功能添加測試案例

---

**建立日期**: 2025-01-21
**最後更新**: 2025-09-21
**維護者**: Claude Code Assistant
**文檔狀態**: 已更新至最新實際狀態