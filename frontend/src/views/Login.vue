<template>
  <div class="tech-bg tech-grid-overlay login-container">
    <!-- 动态光效背景 -->
    <div class="ambient-light ambient-light-1"></div>
    <div class="ambient-light ambient-light-2"></div>
    
    <div class="login-card">
      <!-- 角落装饰 -->
      <div class="tech-corner tech-corner-tl"></div>
      <div class="tech-corner tech-corner-tr"></div>
      <div class="tech-corner tech-corner-bl"></div>
      <div class="tech-corner tech-corner-br"></div>
      
      <div class="login-header">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <h1 class="tech-title">系统登录</h1>
        <p class="tech-subtitle">Welcome to Dify EChart</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label class="input-label">
            <span class="label-icon">👤</span>
            用户名
          </label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入用户名" 
            required
            class="tech-input"
          >
        </div>
        
        <div class="input-group">
          <label class="input-label">
            <span class="label-icon">🔒</span>
            密码
          </label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码" 
            required
            class="tech-input"
          >
        </div>
        
        <div class="input-group">
          <label class="checkbox-label">
            <input v-model="rememberMe" type="checkbox" class="tech-checkbox">
            <span class="checkmark"></span>
            <span class="checkbox-text">记住我</span>
          </label>
        </div>
        
        <button type="submit" :disabled="loading" class="tech-btn tech-btn-primary login-btn">
          <span v-if="loading" class="tech-loader">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span v-else>登 录</span>
        </button>
        
        <div class="login-footer">
          <router-link to="/register" class="tech-link">
            还没有账号？立即注册 →
          </router-link>
        </div>
        
        <div v-if="error" class="tech-error">
          {{ error }}
        </div>
      </form>
    </div>
    
    <!-- 版本信息 -->
    <div class="version-info">Dify EChart v1.0</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'
import { setToken } from '../utils/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await login({ 
      username: username.value, 
      password: password.value, 
      rememberMe: rememberMe.value 
    })
    setToken(data.token)
    router.push('/chart')
  } catch (e: any) {
    error.value = e.response?.data?.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  position: relative;
}

.ambient-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
}

.ambient-light-1 {
  width: 400px;
  height: 400px;
  background: var(--tech-primary);
  top: 10%;
  left: 10%;
  animation: float 8s ease-in-out infinite;
}

.ambient-light-2 {
  width: 300px;
  height: 300px;
  background: var(--tech-secondary);
  bottom: 10%;
  right: 10%;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.login-card {
  background: var(--tech-gradient-card);
  border: 1px solid var(--tech-border);
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  position: relative;
  backdrop-filter: blur(20px);
  box-shadow: var(--tech-shadow-md), var(--tech-shadow-glow);
  animation: tech-fade-in 0.5s ease;
}

.login-card:hover {
  border-color: var(--tech-border-glow);
  box-shadow: var(--tech-shadow-md), var(--tech-shadow-glow-strong);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: var(--tech-gradient-primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.logo svg {
  width: 32px;
  height: 32px;
  color: white;
}

.login-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--tech-text-secondary);
  font-family: var(--tech-font-mono);
}

.label-icon {
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--tech-text-secondary);
}

.tech-checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 1px solid var(--tech-border);
  border-radius: 4px;
  background: rgba(10, 10, 15, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkmark::after {
  content: '✓';
  color: var(--tech-primary);
  font-size: 12px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.2s ease;
}

.tech-checkbox:checked + .checkmark {
  border-color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
}

.tech-checkbox:checked + .checkmark::after {
  opacity: 1;
  transform: scale(1);
}

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 8px;
}

.login-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--tech-border);
}

.version-info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--tech-text-muted);
  font-family: var(--tech-font-mono);
}
</style>
