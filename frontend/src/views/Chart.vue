<template>
  <div class="tech-bg chart-page">
    <!-- 导航栏 -->
    <nav class="tech-navbar navbar">
      <div class="navbar-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-title">Dify EChart</span>
          <span class="brand-subtitle">AI 智能图表生成</span>
        </div>
      </div>
      
      <div class="navbar-actions">
        <div class="user-info">
          <span class="user-badge">
            <span class="status-dot"></span>
            在线
          </span>
        </div>
        <button @click="logout" class="tech-btn tech-btn-danger logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          登出
        </button>
      </div>
    </nav>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-wrapper">
        <ChartGenerator />
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <span>Dify EChart Wangqh © 2026</span>
      <span class="footer-divider">|</span>
      <span class="tech-badge tech-badge-success">
        System Ready
      </span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { removeToken } from '../utils/auth'
import ChartGenerator from '../components/ChartGenerator.vue'

const router = useRouter()

const logout = () => {
  removeToken()
  router.push('/login')
}
</script>

<style scoped>
.chart-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  height: 72px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon {
  width: 44px;
  height: 44px;
  background: var(--tech-gradient-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.brand-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  font-size: 20px;
  font-weight: 600;
  background: var(--tech-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--tech-font-mono);
}

.brand-subtitle {
  font-size: 12px;
  color: var(--tech-text-muted);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 20px;
  font-size: 13px;
  color: var(--tech-accent);
  font-family: var(--tech-font-mono);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--tech-accent);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--tech-accent);
  animation: tech-pulse 2s infinite;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
}

.logout-btn .icon {
  width: 16px;
  height: 16px;
}

.main-content {
  flex: 1;
  padding: 32px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid var(--tech-border);
  font-size: 12px;
  color: var(--tech-text-muted);
  font-family: var(--tech-font-mono);
}

.footer-divider {
  color: var(--tech-border);
}
</style>
