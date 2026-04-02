<template>
  <div class="tech-bg tech-grid-overlay register-container">
    <!-- 动态光效背景 -->
    <div class="ambient-light ambient-light-1"></div>
    <div class="ambient-light ambient-light-2"></div>
    
    <div class="register-card">
      <!-- 角落装饰 -->
      <div class="tech-corner tech-corner-tl"></div>
      <div class="tech-corner tech-corner-tr"></div>
      <div class="tech-corner tech-corner-bl"></div>
      <div class="tech-corner tech-corner-br"></div>
      
      <div class="register-header">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <h1 class="tech-title">账号注册</h1>
        <p class="tech-subtitle">Create your account</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
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
          <label class="input-label">
            <span class="label-icon">🔐</span>
            确认密码
          </label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="请再次输入密码" 
            required
            class="tech-input"
            :class="{ 'input-error': confirmPassword && password !== confirmPassword }"
          >
          <span v-if="confirmPassword && password !== confirmPassword" class="input-hint error">
            两次输入的密码不一致
          </span>
        </div>
        
        <button 
          type="submit" 
          :disabled="loading || (confirmPassword && password !== confirmPassword)" 
          class="tech-btn tech-btn-primary register-btn"
        >
          <span v-if="loading" class="tech-loader">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span v-else>注 册</span>
        </button>
        
        <div class="register-footer">
          <router-link to="/login" class="tech-link">
            ← 已有账号？立即登录
          </router-link>
        </div>
        
        <div v-if="error" class="tech-error">
          {{ error }}
        </div>
      </form>
    </div>
    
    <div class="version-info">Dify EChart v1.0</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'
import { setToken } from '../utils/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { data } = await register({ 
      username: username.value, 
      password: password.value 
    })
    setToken(data.token)
    router.push('/chart')
  } catch (e: any) {
    error.value = e.response?.data?.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
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
  background: var(--tech-secondary);
  top: 10%;
  right: 10%;
  animation: float 8s ease-in-out infinite;
}

.ambient-light-2 {
  width: 300px;
  height: 300px;
  background: var(--tech-primary);
  bottom: 10%;
  left: 10%;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.register-card {
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

.register-card:hover {
  border-color: var(--tech-border-glow);
  box-shadow: var(--tech-shadow-md), var(--tech-shadow-glow-strong);
}

.register-header {
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

.register-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.register-header p {
  font-size: 14px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.input-error {
  border-color: var(--tech-error) !important;
  box-shadow: 0 0 15px rgba(255, 71, 87, 0.2) !important;
}

.input-hint {
  font-size: 12px;
  font-family: var(--tech-font-mono);
}

.input-hint.error {
  color: var(--tech-error);
}

.register-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 8px;
}

.register-footer {
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
