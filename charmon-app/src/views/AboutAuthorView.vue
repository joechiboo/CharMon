<template>
  <div class="about-author-container">
    <el-card class="author-card">
      <h1 class="page-title">關於作者</h1>

      <!-- 作者簡介區塊 -->
      <section class="author-intro">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8" :md="6">
            <div class="author-avatar">
              <el-avatar :size="120">
                <span class="avatar-text">JOE</span>
              </el-avatar>
            </div>
          </el-col>
          <el-col :xs="24" :sm="16" :md="18">
            <h2>Joe Chi-Boo</h2>
            <p class="intro-text">
              熱愛教育科技的軟體工程師，致力於開發有趣且實用的學習工具。<br>
              「字樂園」是我為了幫助孩子們快樂學習中文而打造的平台。
            </p>
            <div class="portfolio-link">
              <el-button type="primary" size="large" @click="openPortfolio">
                <i class="el-icon-user"></i>
                查看完整個人履歷
              </el-button>
            </div>
          </el-col>
        </el-row>
      </section>

      <el-divider></el-divider>

      <!-- 支持作者區塊 -->
      <section class="support-section">
        <h2>支持作者 | 讓教育創新持續前進</h2>
        <p class="support-text">
          您的支持是我持續創新的動力！每一份贊助都將用於：<br>
          🔧 平台維護與伺服器費用 | 🚀 開發新功能 | 📚 創建更多優質內容
        </p>

        <!-- 贊助選項 -->
        <div class="donation-options">
          <h3>選擇您的支持方式</h3>
          <el-row :gutter="20" justify="center">
            <el-col :xs="24" :sm="8" :md="6" v-for="option in donationOptions" :key="option.amount">
              <div class="donation-option" @click="selectAmount(option.amount)">
                <div class="option-icon">{{ option.icon }}</div>
                <div class="option-amount">NT$ {{ option.amount.toLocaleString() }}</div>
                <div class="option-title">{{ option.title }}</div>
                <div class="option-desc">{{ option.description }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- LINE Pay QR Code -->
        <el-row justify="center" class="donation-area">
          <el-col :xs="24" :sm="16" :md="12">
            <el-card shadow="hover" class="donation-card">
              <el-row :gutter="20">
                <el-col :xs="24" :md="12">
                  <div class="qr-code-container">
                    <img
                      src="/CharMon/linePay.png"
                      alt="LINE Pay QR Code"
                      class="qr-code"
                    />
                    <p class="pay-method">LINE Pay</p>
                    <p class="pay-id">ID: 2027193013</p>
                  </div>
                </el-col>
                <el-col :xs="24" :md="12">
                  <div class="donation-info">
                    <h4>贊助說明</h4>
                    <ul class="donation-notes">
                      <li>掃描 QR Code 即可贊助</li>
                      <li>可輸入任意金額</li>
                      <li>支援信用卡與 LINE Pay</li>
                      <li v-if="selectedAmount">
                        建議金額：<strong>NT$ {{ selectedAmount.toLocaleString() }}</strong>
                      </li>
                    </ul>
                    <el-alert
                      v-if="selectedAmount === 3000"
                      type="info"
                      :closable="false"
                      show-icon
                    >
                      選擇此方案，我將花一個晚上為您實現特定功能需求！
                    </el-alert>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>

        <!-- 感謝訊息 -->
        <div class="thank-you-message">
          <el-alert
            title="感謝您的支持！"
            type="success"
            :closable="false"
            show-icon
            center
          >
            <p>每一份支持都讓「字樂園」變得更好，讓更多孩子享受學習的樂趣！</p>
          </el-alert>
        </div>
      </section>

      <el-divider></el-divider>

      <!-- 版權聲明 -->
      <section class="copyright-section">
        <p class="copyright-text">
          © 2025 字樂園 CharMon. All rights reserved.<br>
          Made with ❤️ by Joe Chi-Boo<br>
          <small>一個相信科技能改變教育的工程師</small>
        </p>
      </section>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElCard, ElRow, ElCol, ElAvatar, ElDivider, ElAlert, ElTag, ElMessage, ElButton } from 'element-plus'

interface DonationOption {
  amount: number
  icon: string
  title: string
  description: string
}

const donationOptions: DonationOption[] = [
  {
    amount: 100,
    icon: '☕',
    title: '一杯咖啡',
    description: '給作者加油打氣'
  },
  {
    amount: 1000,
    icon: '🍽️',
    title: '一頓大餐',
    description: '支持持續開發'
  },
  {
    amount: 3000,
    icon: '🌟',
    title: '實現願望',
    description: '客製化功能開發'
  }
]

const selectedAmount = ref<number | null>(null)

const selectAmount = (amount: number) => {
  selectedAmount.value = amount
  ElMessage.success(`已選擇 NT$ ${amount.toLocaleString()} 方案`)
}

const openPortfolio = () => {
  window.open('https://joechiboo.github.io/', '_blank')
}
</script>

<style scoped>
.about-author-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.author-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 40px;
}

.page-title {
  text-align: center;
  font-size: 2.5em;
  margin-bottom: 30px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.author-intro {
  margin-bottom: 30px;
}

.author-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-text {
  font-size: 2em;
  font-weight: bold;
}

.author-avatar :deep(.el-avatar) {
  background: white;
  color: #764ba2;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.intro-text {
  font-size: 1.1em;
  line-height: 1.8;
  margin: 20px 0;
  color: rgba(255, 255, 255, 0.95);
}

.contact-info p {
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.05em;
}

.contact-info a {
  color: white;
  text-decoration: none;
  border-bottom: 1px solid white;
  transition: all 0.3s;
}

.contact-info a:hover {
  border-bottom: 2px solid white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* 個人履歷連結 */
.portfolio-link {
  margin-top: 20px;
  text-align: center;
}

.portfolio-link :deep(.el-button) {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  color: white;
  font-size: 1.1em;
  padding: 12px 30px;
  border-radius: 25px;
  transition: all 0.3s;
}

.portfolio-link :deep(.el-button:hover) {
  background: white;
  color: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 專案介紹 */
.project-intro h2,
.support-section h2 {
  color: white;
  font-size: 1.8em;
  margin-bottom: 20px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.feature-list li {
  padding: 12px 0;
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list strong {
  color: white;
}

/* 贊助選項 */
.donation-options {
  margin: 30px 0;
  text-align: center;
}

.donation-options h3 {
  color: white;
  font-size: 1.4em;
  margin-bottom: 20px;
}

.donation-option {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  margin: 10px 0;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.donation-option:hover {
  background: white;
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.option-icon {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.option-amount {
  font-size: 1.5em;
  font-weight: bold;
  color: #764ba2;
  margin: 10px 0;
}

.option-title {
  font-size: 1.2em;
  color: #333;
  font-weight: 500;
}

.option-desc {
  color: #666;
  font-size: 0.95em;
  margin-top: 5px;
}

/* 支持區塊 */
.support-text {
  font-size: 1.15em;
  line-height: 1.8;
  text-align: center;
  margin: 20px 0 30px;
  color: rgba(255, 255, 255, 0.95);
}

.donation-area {
  margin-top: 30px;
}

.donation-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
}

.qr-code-container {
  text-align: center;
  padding: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.pay-method {
  font-size: 1.3em;
  font-weight: bold;
  color: #00C300;
  margin: 10px 0;
}

.pay-id {
  color: #666;
  font-size: 0.95em;
  margin-top: 10px;
}

.donation-info {
  padding: 20px;
}

.donation-info h4 {
  color: #333;
  font-size: 1.3em;
  margin-bottom: 15px;
}

.donation-notes {
  list-style: none;
  padding: 0;
  color: #666;
}

.donation-notes li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.donation-notes li:last-child {
  border-bottom: none;
}

.donation-notes strong {
  color: #764ba2;
}

.thank-you-message {
  margin-top: 30px;
}

.thank-you-message :deep(.el-alert) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.thank-you-message :deep(.el-alert__title) {
  color: white;
  font-size: 1.2em;
}

.thank-you-message :deep(.el-alert__description) {
  color: rgba(255, 255, 255, 0.9);
}

.thank-you-message p {
  margin-top: 10px;
  font-size: 1em;
}

:deep(.el-divider) {
  border-color: rgba(255, 255, 255, 0.3);
  margin: 40px 0;
}

.copyright-section {
  text-align: center;
  margin-top: 30px;
}

.copyright-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1em;
  line-height: 1.8;
}

.copyright-text small {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2em;
  }

  .author-card {
    padding: 20px;
  }

  .qr-code {
    width: 150px;
    height: 150px;
  }

  .skills-grid {
    grid-template-columns: 1fr;
  }

  .donation-option {
    margin: 10px;
  }

  .intro-text,
  .support-text {
    font-size: 1em;
  }
}
</style>