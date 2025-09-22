# LINE Pay 贊助組件 Prompt

## 使用說明
這是一個通用的 LINE Pay 贊助組件 prompt，可用於任何 Vue.js 專案中整合贊助功能。

## Prompt 內容

請幫我創建一個 LINE Pay 贊助組件，包含以下功能：

### 基本需求
1. **贊助選項卡片**
   - NT$100 - 一杯咖啡 ☕ (給作者加油打氣)
   - NT$1,000 - 一頓大餐 🍽️ (支持持續開發)
   - NT$3,000 - 實現願望 🌟 (客製化功能開發)

2. **LINE Pay QR Code 區域**
   - QR Code 圖片顯示
   - LINE Pay ID 顯示
   - 贊助說明文字

3. **互動功能**
   - 點擊贊助選項會高亮顯示
   - 顯示選中的建議金額
   - 選擇 NT$3,000 時顯示特別說明

### 技術規格
- **框架**: Vue 3 + TypeScript
- **UI 庫**: Element Plus
- **樣式**: Scoped CSS with 響應式設計
- **圖片**: 使用 Vite import 語法引用

### 組件結構
```vue
<template>
  <div class="line-pay-sponsor">
    <h2>支持作者</h2>

    <!-- 贊助選項 -->
    <div class="donation-options">
      <h3>選擇您的支持方式</h3>
      <el-row :gutter="20" justify="center">
        <el-col v-for="option in donationOptions" :key="option.amount">
          <div class="donation-option" @click="selectAmount(option.amount)">
            <!-- 選項內容 -->
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- LINE Pay QR Code -->
    <el-card class="donation-card">
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <div class="qr-code-container">
            <img :src="linePayImage" alt="LINE Pay QR Code" class="qr-code" />
            <p class="pay-method">LINE Pay</p>
            <p class="pay-id">ID: 2027193013</p>
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="donation-info">
            <!-- 贊助說明 -->
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
```

### 樣式要求
- **主色調**: 漸變背景 (可自訂顏色)
- **卡片設計**: 圓角、陰影效果
- **互動效果**: hover 動畫、點擊反饋
- **響應式**: 適配手機、平板、桌面

### 自訂化參數
請讓組件支援以下 props：
- `linePayId`: LINE Pay ID (預設: "2027193013")
- `qrCodeImage`: QR Code 圖片路徑
- `customAmounts`: 自訂贊助金額選項
- `theme`: 主題色彩 (預設: 紫色漸變)
- `title`: 標題文字 (預設: "支持作者")

### 使用範例
```vue
<LinePaySponsor
  :line-pay-id="2027193013"
  :qr-code-image="linePayQR"
  :custom-amounts="[100, 500, 1000]"
  theme="blue"
  title="贊助開發者"
/>
```

### 檔案結構
請建立以下檔案：
1. `LinePaySponsor.vue` - 主組件
2. `types/sponsor.ts` - TypeScript 型別定義
3. `styles/sponsor.scss` - 樣式檔案 (可選)

### 額外功能
- 點擊選項時的成功提示訊息
- 選擇金額後的動態提示
- 支援暗色模式切換
- 支援國際化 (i18n)

## 注意事項
1. 圖片資源請放在 `public` 目錄
2. 使用 `import imageUrl from '/image.png'` 語法引用圖片
3. 確保 Element Plus 已正確安裝和配置
4. 測試響應式設計在各種螢幕尺寸下的表現

## 完整範例
請基於以上需求創建一個完整的、可重複使用的 LINE Pay 贊助組件。