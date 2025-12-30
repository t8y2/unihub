<template>
  <div class="task-card">
    <div class="task-header">
      <div class="task-icon">{{ icon }}</div>
      <div class="task-info">
        <h3 class="task-title">{{ title }}</h3>
        <p class="task-description">{{ description }}</p>
      </div>
    </div>
    
    <div class="task-content">
      <slot />
    </div>
    
    <div class="task-actions">
      <button 
        @click="$emit('execute')" 
        :disabled="disabled"
        class="btn btn-primary"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? '处理中...' : '执行' }}
      </button>
      <button @click="$emit('clear')" class="btn btn-secondary">
        清除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string
  loading?: boolean
  disabled?: boolean
}

defineProps<Props>()
defineEmits<{
  execute: []
  clear: []
}>()
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.task-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.task-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.task-info {
  flex: 1;
}

.task-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.task-description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.task-content {
  margin-bottom: 20px;
}

.task-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>