<template>
  <div class="app">
    <header class="app-header">
      <h1>🚀 UniHub 插件示例</h1>
      <p>演示如何使用 Sidecar 处理文本</p>
    </header>

    <main class="app-main">
      <div class="card">
        <h2>🔤 Base64 编码/解码</h2>
        <p class="description">使用 Go Sidecar 处理文本编码</p>

        <div class="input-group">
          <label>输入文本</label>
          <textarea v-model="inputText" placeholder="输入要处理的文本..." rows="4" />
        </div>

        <div class="input-group">
          <label>操作类型</label>
          <select v-model="action">
            <option value="base64_encode">Base64 编码</option>
            <option value="base64_decode">Base64 解码</option>
          </select>
        </div>

        <div class="button-group">
          <button :disabled="!inputText.trim() || loading" class="btn-primary" @click="execute">
            {{ loading ? '处理中...' : '执行' }}
          </button>
          <button class="btn-secondary" @click="clear">清除</button>
        </div>

        <div v-if="result" class="result-section">
          <div v-if="result.success" class="result-success">
            <h3>✅ 处理成功</h3>
            <div class="result-content">{{ result.result }}</div>
            <div class="result-meta">耗时: {{ executionTime }}ms</div>
            <button class="btn-copy" @click="copyResult">📋 复制结果</button>
          </div>
          <div v-else class="result-error">
            <h3>❌ 处理失败</h3>
            <div class="error-message">{{ result.error }}</div>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast 通知 -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 响应式数据
const inputText = ref('')
const action = ref('base64_encode')
const loading = ref(false)
const result = ref<{ success: boolean; result?: string; error?: string } | null>(null)
const executionTime = ref(0)

// Toast 状态
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'info',
  icon: '✅'
})

// 显示 Toast
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success'): void => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }

  toast.message = message
  toast.type = type
  toast.icon = icons[type]
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// 执行任务
const execute = async (): Promise<void> => {
  if (!inputText.value.trim()) return

  loading.value = true
  result.value = null
  const startTime = Date.now()

  try {
    // 调用 sidecar
    const spawnResult = await window.node.spawn('./sidecar/main', [], {
      input: JSON.stringify({
        action: action.value,
        data: inputText.value
      }),
      timeout: 5000
    })

    // 解析结果
    const response = JSON.parse(spawnResult.stdout)

    if (response.success) {
      result.value = {
        success: true,
        result: response.result
      }
      showToast('处理成功！', 'success')
    } else {
      result.value = {
        success: false,
        error: response.error || '处理失败'
      }
      showToast(response.error || '处理失败', 'error')
    }

    executionTime.value = Date.now() - startTime
  } catch (error) {
    result.value = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
    executionTime.value = Date.now() - startTime
    showToast(error instanceof Error ? error.message : '未知错误', 'error')
  } finally {
    loading.value = false
  }
}

// 清除
const clear = (): void => {
  inputText.value = ''
  result.value = null
  executionTime.value = 0
}

// 复制结果
const copyResult = async (): Promise<void> => {
  if (result.value?.result) {
    try {
      await window.unihub.clipboard.writeText(result.value.result)
      showToast('已复制到剪贴板', 'success')
    } catch (error) {
      showToast('复制失败', 'error')
      console.error('复制失败:', error)
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  padding: 40px 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-main {
  max-width: 600px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.card h2 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #1f2937;
}

.description {
  color: #6b7280;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.input-group textarea,
.input-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-group textarea:focus,
.input-group select:focus {
  outline: none;
  border-color: #667eea;
}

.input-group textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-copy {
  background: #10b981;
  color: white;
  width: 100%;
  margin-top: 12px;
}

.btn-copy:hover {
  background: #059669;
}

.result-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
}

.result-success h3,
.result-error h3 {
  font-size: 1.1rem;
  margin-bottom: 12px;
}

.result-success h3 {
  color: #10b981;
}

.result-error h3 {
  color: #ef4444;
}

.result-content {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  word-break: break-all;
  white-space: pre-wrap;
  color: #1f2937;
  margin-bottom: 8px;
}

.result-meta {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
}

.error-message {
  background: #fef2f2;
  padding: 12px;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

/* Toast 样式 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  min-width: 200px;
  max-width: 400px;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
}

.toast-success {
  border-left: 4px solid #10b981;
  color: #065f46;
}

.toast-error {
  border-left: 4px solid #ef4444;
  color: #991b1b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
  color: #1e40af;
}

/* Toast 动画 */
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}
</style>
