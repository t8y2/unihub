<template>
  <div v-if="result" class="result-display">
    <div class="result-header">
      <span class="result-status" :class="{ success: result.success, error: !result.success }">
        {{ result.success ? '✅' : '❌' }}
      </span>
      <span class="result-title">
        {{ result.success ? '处理成功' : '处理失败' }}
      </span>
      <span v-if="duration" class="result-duration">{{ duration }}ms</span>
    </div>
    
    <div class="result-content">
      <pre v-if="result.success && result.result">{{ formatResult(result.result) }}</pre>
      <div v-else-if="result.error" class="error-message">
        {{ result.error }}
      </div>
      <div v-if="result.message" class="result-message">
        {{ result.message }}
      </div>
    </div>
    
    <div class="result-actions">
      <button @click="copyResult" class="btn btn-copy">
        📋 复制结果
      </button>
      <button @click="$emit('clear')" class="btn btn-clear">
        🗑️ 清除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskResult } from '../types/plugin'

interface Props {
  result: TaskResult | null
  duration?: number
}

const props = defineProps<Props>()
defineEmits<{
  clear: []
}>()

const formatResult = (result: any): string => {
  if (typeof result === 'string') {
    return result
  }
  return JSON.stringify(result, null, 2)
}

const copyResult = async () => {
  if (!props.result?.result) return
  
  try {
    const text = formatResult(props.result.result)
    await navigator.clipboard.writeText(text)
    // 这里可以添加一个 toast 提示
    console.log('结果已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.result-display {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.result-status {
  font-size: 18px;
}

.result-title {
  font-weight: 600;
  color: #1f2937;
}

.result-duration {
  font-size: 12px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 4px;
}

.result-content {
  margin-bottom: 16px;
}

.result-content pre {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  margin: 0;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.result-message {
  color: #059669;
  background: #f0fdf4;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  margin-top: 8px;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy {
  background: #3b82f6;
  color: white;
}

.btn-copy:hover {
  background: #2563eb;
}

.btn-clear {
  background: #6b7280;
  color: white;
}

.btn-clear:hover {
  background: #4b5563;
}
</style>