# Supabase 整合設定指南

本指南將幫助您設置 Supabase 來實現字典系統的後端數據持久化。

## 🚀 快速開始

### 1. 創建 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 並註冊帳號
2. 點擊 "New Project" 創建新專案
3. 填寫專案名稱、數據庫密碼等信息
4. 等待專案初始化完成（約2-3分鐘）

### 2. 獲取專案配置

在 Supabase 控制台中：

1. 進入 `Settings` > `API`
2. 複製以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJ...` (很長的 JWT token)

### 3. 本地環境配置

1. 複製環境變量範例文件：
   ```bash
   cp .env.example .env
   ```

2. 編輯 `.env` 文件，填入您的 Supabase 配置：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. 設置數據庫

1. 在 Supabase 控制台中，進入 `SQL Editor`
2. 創建新查詢，貼上 `sql/setup.sql` 文件的內容
3. 執行 SQL 腳本來創建表格和初始數據

### 5. 驗證設置

1. 重新啟動開發服務器：
   ```bash
   npm run dev
   ```

2. 進入字典管理後台（需要家長權限）
3. 如果看到 "數據源：Supabase"，表示配置成功！

## 📊 數據庫結構

### 表格說明

#### `dictionary_characters`
存儲字典中的字符信息：
- `character`: 中文字符
- `stroke_count`: 筆劃數
- `radical`: 部首
- `radical_zhuyin`: 部首注音（選填）
- `zhuyin`: 字符注音

#### `unknown_characters`
記錄未知字符的出現情況：
- `character`: 未知字符
- `occurrence_count`: 出現次數
- `resolved`: 是否已解決
- `first_seen`: 首次發現時間

### 權限設置

- 所有已認證用戶可以讀取字典數據
- 所有已認證用戶可以添加/更新字典數據
- Row Level Security (RLS) 已啟用
- 適合多用戶環境

## 🔧 功能特色

### 自動降級機制
- 如果未配置 Supabase，系統自動使用本地字典
- 保證應用在任何環境下都能正常運行
- 提供明確的配置狀態提示

### 本地緩存
- 查詢結果會緩存在瀏覽器中
- 減少不必要的網絡請求
- 提供更好的用戶體驗

### 實時同步
- 支持手動同步數據
- 自動記錄未知字符
- 統計信息實時更新

## 🚨 注意事項

### 安全性
- 確保 `.env` 文件已加入 `.gitignore`
- 不要將 API 密鑰提交到版本控制
- 建議在生產環境使用環境變量

### 性能優化
- 大量數據時考慮分頁查詢
- 定期清理已解決的未知字符
- 監控 Supabase 的用量限制

### 備份策略
- 定期匯出字典數據
- 考慮設置 Supabase 的自動備份
- 保留重要字符的本地副本

## 📈 未來擴展

- 用戶權限管理
- 字符使用統計
- 學習進度追蹤
- 多語言支持
- API 限流和快取

## ❓ 常見問題

### Q: 為什麼顯示"本地字典"？
A: 檢查 `.env` 文件是否正確配置，重新啟動開發服務器。

### Q: 保存字符失敗怎麼辦？
A: 檢查網絡連接和 Supabase 專案狀態，確認 API 密鑰正確。

### Q: 如何重置數據庫？
A: 在 Supabase SQL Editor 中執行 `DROP TABLE` 語句，然後重新運行設置腳本。

### Q: 是否支持離線使用？
A: 是的，系統會自動降級到本地字典，並在恢復網絡後同步數據。