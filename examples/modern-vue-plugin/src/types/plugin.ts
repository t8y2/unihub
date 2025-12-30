// 插件相关类型定义
export interface TaskResult {
  success: boolean
  result?: any
  error?: string
  message?: string
  timestamp?: string
}

export interface TaskRequest {
  data: string
  options?: Record<string, any>
}

export type TaskType = 'encode' | 'decode' | 'encrypt' | 'decrypt' | 'compress' | 'decompress'

export interface TaskHistory {
  id: string
  type: TaskType
  input: string
  output: string
  timestamp: string
  duration: number
}