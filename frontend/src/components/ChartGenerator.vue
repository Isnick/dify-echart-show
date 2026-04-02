<template>
  <div class="chart-generator">
    <!-- 输入区域 -->
    <div class="input-section">
      <div class="section-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="header-text">
          <h2>图表生成</h2>
          <p>输入描述，AI 将为您生成专业的 ECharts 图表</p>
        </div>
      </div>
      
      <div class="input-wrapper">
        <textarea
          v-model="prompt"
          placeholder="输入图表描述，例如：显示一个柱状图，数据是1到12月的销售额..."
          class="tech-input prompt-input"
          rows="3"
          @keydown.enter.ctrl.prevent="generate"
        ></textarea>
        <div class="input-hint">
          <span>💡 提示：按 Ctrl + Enter 快速生成</span>
          <span class="char-count">{{ prompt.length }} 字符</span>
        </div>
      </div>
      
      <div class="action-bar">
        <button 
          @click="generate" 
          :disabled="loading || !prompt.trim()" 
          class="tech-btn tech-btn-primary generate-btn"
        >
          <span v-if="loading" class="tech-loader">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <template v-else>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            生成图表
          </template>
        </button>
        
        <button 
          v-if="chartRendered" 
          @click="clearChart" 
          class="tech-btn clear-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          清空
        </button>
      </div>
      
      <div v-if="error" class="tech-error error-message">
        {{ error }}
      </div>
    </div>
    
    <!-- 思考过程折叠面板 -->
    <details
      v-if="generatingText && chartRendered"
      class="tech-details think-section"
    >
      <summary>
        <span class="summary-icon">🧠</span>
        查看 AI 思考过程
        <span class="summary-badge">{{ generatingText.length }} 字符</span>
      </summary>
      <div class="tech-details-content">
        {{ generatingText }}
      </div>
    </details>
    
    <!-- 实时生成文本 -->
    <div
      v-else-if="generatingText"
      class="generating-section"
    >
      <div class="generating-header">
        <span v-if="loading" class="tech-badge tech-badge-loading">
          <span></span>
          思考中...
        </span>
        <span v-else class="tech-badge tech-badge-success">
          <span></span>
          生成完成
        </span>
      </div>
      <div class="generating-content">
        {{ generatingText }}
      </div>
    </div>
    
    <!-- 图表容器 -->
    <div v-show="chartRendered" class="tech-chart-container chart-section">
      <div class="chart-header">
        <div class="chart-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          图表预览
        </div>
        <div class="chart-actions">
          <button @click="downloadChart" class="chart-action-btn" title="下载图片">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      </div>
      <div ref="chartRef" class="chart-canvas"></div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!chartRendered && !generatingText && !loading" class="empty-state">
      <div class="empty-illustration">
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="url(#gradient)" stroke-width="1" opacity="0.3"/>
          <circle cx="100" cy="100" r="60" stroke="url(#gradient)" stroke-width="1" opacity="0.5"/>
          <circle cx="100" cy="100" r="40" stroke="url(#gradient)" stroke-width="2"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00d4ff"/>
              <stop offset="100%" stop-color="#b829dd"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <p class="empty-title">准备就绪</p>
      <p class="empty-desc">在上方输入图表描述，开始生成您的第一个图表</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { generateChart } from '../api/chart'

const normalizeJsonText = (text: string): string => {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim()
}

const extractJsonObject = (text: string): string | null => {
  const startIndex = text.indexOf('{')

  if (startIndex === -1) {
    return null
  }

  let depth = 0
  let inString = false
  let isEscaped = false

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index]

    if (inString) {
      if (isEscaped) {
        isEscaped = false
        continue
      }

      if (char === '\\') {
        isEscaped = true
        continue
      }

      if (char === '"') {
        inString = false
      }

      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === '{') {
      depth += 1
    }

    if (char === '}') {
      depth -= 1

      if (depth === 0) {
        return text.slice(startIndex, index + 1)
      }
    }
  }

  return null
}

const extractChartOption = (text: string): Record<string, unknown> => {
  const withoutThink = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  const fencedJsonMatch = withoutThink.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const rawJsonText = fencedJsonMatch?.[1] ?? extractJsonObject(withoutThink)

  if (!rawJsonText) {
    throw new Error('未找到有效的 ECharts 配置')
  }

  const jsonText = normalizeJsonText(rawJsonText)

  return JSON.parse(jsonText) as Record<string, unknown>
}

const prompt = ref('')
const loading = ref(false)
const error = ref('')
const generatingText = ref('')
const chartRendered = ref(false)
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (chartRef.value && !chartInstance) {
    chartInstance = echarts.init(chartRef.value, 'dark', {
      renderer: 'canvas'
    })
    
    // 设置深色主题默认配置
    const defaultOption = {
      backgroundColor: 'transparent',
      textStyle: {
        color: '#e6edf3'
      },
      title: {
        textStyle: {
          color: '#e6edf3'
        }
      },
      legend: {
        textStyle: {
          color: '#8b949e'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        textStyle: {
          color: '#e6edf3'
        }
      }
    }
    
    chartInstance.setOption(defaultOption)
  }
}

onMounted(() => {
  initChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

const handleResize = () => {
  chartInstance?.resize()
}

const generate = async () => {
  if (!prompt.value.trim()) return
  loading.value = true
  error.value = ''
  generatingText.value = ''
  chartRendered.value = false
  
  // 确保图表实例已初始化
  if (!chartInstance) {
    initChart()
  }
  
  try {
    const result = await generateChart({ prompt: prompt.value }, (text) => {
      generatingText.value = text
    })

    generatingText.value = result.finalAnswer.length >= result.fullText.length
      ? result.finalAnswer
      : result.fullText

    let config: Record<string, unknown> | null = null
    try {
      config = extractChartOption(result.finalAnswer)
    } catch {
      // 无法提取有效图表配置时，直接显示返回的原始内容
      console.log('无法解析为图表配置，显示原始内容')
    }

    if (!config) {
      // 无有效配置，只显示原始内容，不渲染图表
      chartRendered.value = false
      loading.value = false
      error.value = ''
      return
    }

    if (!chartInstance) {
      throw new Error('图表容器初始化失败')
    }

    // 合并配置并应用科技感样式
    const styledConfig = {
      backgroundColor: 'transparent',
      ...config,
      textStyle: {
        color: '#e6edf3',
        ...(config.textStyle as Record<string, unknown> || {})
      }
    }

    chartInstance.clear()
    chartInstance.setOption(styledConfig)
    // 确保图表尺寸正确 - 在容器可见后需要重新计算尺寸
    setTimeout(() => {
      chartInstance?.resize()
    }, 0)
    chartRendered.value = true
    error.value = ''
  } catch (e: unknown) {
    console.error('Error:', e)
    chartRendered.value = false
    error.value = `生成失败: ${e instanceof Error ? e.message : '未知错误'}`
  } finally {
    loading.value = false
  }
}

const clearChart = () => {
  prompt.value = ''
  generatingText.value = ''
  chartRendered.value = false
  error.value = ''
  if (chartInstance) {
    chartInstance.clear()
  }
}

const downloadChart = () => {
  if (!chartInstance) return
  
  const url = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#161b22'
  })
  
  const link = document.createElement('a')
  link.download = `chart-${Date.now()}.png`
  link.href = url
  link.click()
}
</script>

<style scoped>
.chart-generator {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-section {
  background: var(--tech-gradient-card);
  border: 1px solid var(--tech-border);
  border-radius: 16px;
  padding: 28px;
  position: relative;
}

.input-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--tech-primary), transparent);
  opacity: 0.5;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(184, 41, 221, 0.1) 100%);
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon svg {
  width: 24px;
  height: 24px;
  color: var(--tech-primary);
}

.header-text h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--tech-text-primary);
  margin-bottom: 4px;
}

.header-text p {
  font-size: 13px;
  color: var(--tech-text-secondary);
}

.input-wrapper {
  margin-bottom: 16px;
}

.prompt-input {
  width: 100%;
  min-height: 100px;
  resize: vertical;
  font-family: var(--tech-font-ui);
  line-height: 1.6;
}

.input-hint {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--tech-text-muted);
  font-family: var(--tech-font-mono);
}

.char-count {
  color: var(--tech-text-secondary);
}

.action-bar {
  display: flex;
  gap: 12px;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  font-size: 15px;
}

.generate-btn .icon {
  width: 18px;
  height: 18px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-btn .icon {
  width: 16px;
  height: 16px;
}

.error-message {
  margin-top: 16px;
}

.think-section {
  animation: tech-fade-in 0.3s ease;
}

.summary-icon {
  font-size: 14px;
}

.summary-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 4px;
  font-size: 11px;
  color: var(--tech-primary);
}

.generating-section {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  overflow: hidden;
  animation: tech-fade-in 0.3s ease;
}

.generating-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--tech-border);
  background: rgba(0, 212, 255, 0.05);
}

.generating-content {
  padding: 20px;
  color: var(--tech-text-secondary);
  font-family: var(--tech-font-mono);
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.chart-section {
  animation: tech-fade-in 0.5s ease;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--tech-border);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
  color: var(--tech-text-primary);
}

.chart-title .icon {
  width: 20px;
  height: 20px;
  color: var(--tech-primary);
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid var(--tech-border);
  border-radius: 8px;
  color: var(--tech-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-action-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
}

.chart-action-btn svg {
  width: 18px;
  height: 18px;
}

.chart-canvas {
  width: 100%;
  height: 500px;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-illustration {
  width: 160px;
  height: 160px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--tech-text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--tech-text-secondary);
}
</style>
