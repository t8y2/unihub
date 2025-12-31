<template>
  <div class="app">
    <header class="app-header">
      <h1>🚀 现代化 Vue 插件</h1>
      <p>使用 Vite + Vue 3 + TypeScript 构建的现代化插件</p>
    </header>

    <main class="app-main">
      <!-- SDK 测试区域 -->
      <div class="sdk-test-section">
        <h3>🧪 SDK 测试</h3>
        <div class="test-buttons">
          <button @click="testNodeAPI" class="test-btn">测试 Node.js API</button>
          <button @click="testAppAPI" class="test-btn">测试 App API</button>
        </div>
        <div v-if="testResult" class="test-result">
          <pre>{{ testResult }}</pre>
        </div>
      </div>

      <div class="tasks-grid">
        <!-- Base64 编码/解码 -->
        <TaskCard
          title="Base64 编码/解码"
          description="对文本进行 Base64 编码或解码"
          icon="🔤"
          :loading="loading"
          :disabled="!inputText.trim()"
          @execute="executeTask('encode')"
          @clear="clearAll"
        >
          <div class="input-group">
            <label>输入文本</label>
            <textarea 
              v-model="inputText" 
              placeholder="输入要处理的文本..."
              rows="4"
            />
          </div>
          <div class="input-group">
            <label>操作类型</label>
            <select v-model="encodeType">
              <option value="base64_encode">Base64 编码</option>
              <option value="base64_decode">Base64 解码</option>
              <option value="url_encode">URL 编码</option>
              <option value="url_decode">URL 解码</option>
            </select>
          </div>
        </TaskCard>

        <!-- 文本加密/解密 -->
        <TaskCard
          title="文本加密/解密"
          description="使用多种算法加密或解密文本"
          icon="🔐"
          :loading="loading"
          :disabled="!inputText.trim()"
          @execute="executeTask('encrypt')"
          @clear="clearAll"
        >
          <div class="input-group">
            <label>加密类型</label>
            <select v-model="cryptoType">
              <option value="caesar">凯撒密码</option>
              <option value="rot13">ROT13</option>
              <option value="reverse">反转加密</option>
              <option value="hash_md5">MD5 哈希</option>
              <option value="hash_sha256">SHA256 哈希</option>
            </select>
          </div>
          <div v-if="cryptoType === 'caesar'" class="input-group">
            <label>偏移量</label>
            <input v-model.number="caesarShift" type="number" min="1" max="25" />
          </div>
        </TaskCard>

        <!-- 数据压缩 -->
        <TaskCard
          title="数据压缩"
          description="压缩或解压缩文本数据"
          icon="📦"
          :loading="loading"
          :disabled="!inputText.trim()"
          @execute="executeTask('compress')"
          @clear="clearAll"
        >
          <div class="input-group">
            <label>压缩类型</label>
            <select v-model="compressType">
              <option value="gzip">Gzip 压缩</option>
              <option value="zlib">Zlib 压缩</option>
              <option value="simple">简单压缩</option>
            </select>
          </div>
        </TaskCard>
      </div>

      <!-- 结果显示 -->
      <ResultDisplay 
        :result="result" 
        :duration="executionTime"
        @clear="clearResult" 
      />

      <!-- 历史记录 -->
      <div v-if="history.length > 0" class="history-section">
        <h3>📋 执行历史</h3>
        <div class="history-list">
          <div 
            v-for="item in history.slice(-5)" 
            :key="item.id"
            class="history-item"
            @click="loadFromHistory(item)"
          >
            <div class="history-header">
              <span class="history-type">{{ getTaskTypeName(item.type) }}</span>
              <span class="history-time">{{ formatTime(item.timestamp) }}</span>
              <span class="history-duration">{{ item.duration }}ms</span>
            </div>
            <div class="history-preview">
              {{ item.input.substring(0, 50) }}{{ item.input.length > 50 ? '...' : '' }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { pluginSDK } from './plugin-sdk'
import TaskCard from './components/TaskCard.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import type { TaskResult, TaskHistory, TaskType } from './types/plugin'

// 响应式数据
const inputText = ref('')
const loading = ref(false)
const result = ref<TaskResult | null>(null)
const executionTime = ref(0)
const testResult = ref('')

// 任务选项
const encodeType = ref('base64_encode')
const cryptoType = ref('caesar')
const compressType = ref('gzip')
const caesarShift = ref(3)

// 历史记录
const history = ref<TaskHistory[]>([])

// 测试 Node.js API
const testNodeAPI = async () => {
  try {
    testResult.value = '测试中...'
    const result = await pluginSDK.node.getPluginDir()
    testResult.value = JSON.stringify(result, null, 2)
  } catch (error: any) {
    testResult.value = `错误: ${error.message}`
  }
}

// 测试 App API
const testAppAPI = async () => {
  try {
    testResult.value = '测试中...'
    const result = await pluginSDK.app.getPath('userData')
    testResult.value = JSON.stringify(result, null, 2)
  } catch (error: any) {
    testResult.value = `错误: ${error.message}`
  }
}

// 执行任务
const executeTask = async (taskCategory: string) => {
  if (!inputText.value.trim()) return

  loading.value = true
  const startTime = Date.now()

  try {
    let taskType: string
    let options: Record<string, any> = {}

    // 根据任务类别确定具体任务类型和选项
    switch (taskCategory) {
      case 'encode':
        taskType = encodeType.value
        break
      case 'encrypt':
        taskType = cryptoType.value
        if (cryptoType.value === 'caesar') {
          options.shift = caesarShift.value
        }
        break
      case 'compress':
        taskType = compressType.value
        break
      default:
        taskType = taskCategory
    }

    // TODO: 调用后端（需要实现 Sidecar 通信）
    const taskResult: TaskResult = {
      success: true,
      result: `处理结果: ${inputText.value}`,
      message: '功能开发中...'
    }
    result.value = taskResult

    // 记录执行时间
    executionTime.value = Date.now() - startTime

    // 添加到历史记录
    if (taskResult.success) {
      const historyItem: TaskHistory = {
        id: Date.now().toString(),
        type: taskType as TaskType,
        input: inputText.value,
        output: taskResult.result || '',
        timestamp: new Date().toISOString(),
        duration: executionTime.value
      }
      history.value.push(historyItem)
    }

  } catch (error) {
    result.value = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
    executionTime.value = Date.now() - startTime
  } finally {
    loading.value = false
  }
}

// 清除所有
const clearAll = () => {
  inputText.value = ''
  result.value = null
  executionTime.value = 0
}

// 清除结果
const clearResult = () => {
  result.value = null
  executionTime.value = 0
}

// 从历史记录加载
const loadFromHistory = (item: TaskHistory) => {
  inputText.value = item.input
  result.value = {
    success: true,
    result: item.output,
    message: '从历史记录加载'
  }
}

// 获取任务类型名称
const getTaskTypeName = (type: string): string => {
  const names: Record<string, string> = {
    'base64_encode': 'Base64编码',
    'base64_decode': 'Base64解码',
    'url_encode': 'URL编码',
    'url_decode': 'URL解码',
    'caesar': '凯撒密码',
    'rot13': 'ROT13',
    'reverse': '反转加密',
    'hash_md5': 'MD5哈希',
    'hash_sha256': 'SHA256哈希',
    'gzip': 'Gzip压缩',
    'zlib': 'Zlib压缩',
    'simple': '简单压缩'
  }
  return names[type] || type
}

// 格式化时间
const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
}

.app-header h1 {
  font-size: 2.5rem;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-header p {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
}

.sdk-test-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.sdk-test-section h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
}

.test-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.test-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.test-btn:hover {
  transform: translateY(-2px);
}

.test-result {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.test-result pre {
  margin: 0;
  font-size: 13px;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-all;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.input-group input,
.input-group textarea,
.input-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input-group input:focus,
.input-group textarea:focus,
.input-group select:focus {
  outline: none;
  border-color: #667eea;
}

.input-group textarea {
  resize: vertical;
  font-family: inherit;
}

.history-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.history-section h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.history-type {
  font-weight: 600;
  color: #667eea;
}

.history-time {
  font-size: 12px;
  color: #6b7280;
}

.history-duration {
  font-size: 12px;
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
}

.history-preview {
  font-size: 13px;
  color: #6b7280;
  font-family: monospace;
}
</style>