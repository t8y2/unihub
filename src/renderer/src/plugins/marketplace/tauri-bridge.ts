/**
 * Electron 桥接层
 * 为插件提供安全的 API 访问
 */

import { createBackendAPI } from './backend-bridge'

export interface HttpRequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string
}

export interface HttpResponse {
  status: number
  headers: Record<string, string>
  body: string
}

export interface SystemInfo {
  os: string
  arch: string
  version: string
}

/**
 * 插件可用的 API
 */
export interface PluginAPI {
  // HTTP 请求
  httpRequest: (options: HttpRequestOptions) => Promise<HttpResponse>

  // 文件系统（需要权限）
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>

  // 剪贴板
  readClipboard: () => Promise<string>
  writeClipboard: (text: string) => Promise<void>

  // 通知
  showNotification: (title: string, body: string) => Promise<void>

  // 加密/哈希
  hash: (data: string, algorithm: 'md5' | 'sha256' | 'sha512') => Promise<string>
  base64Encode: (data: string) => Promise<string>
  base64Decode: (data: string) => Promise<string>

  // 压缩
  compress: (data: string) => Promise<string>
  decompress: (data: string) => Promise<string>

  // 系统信息
  getSystemInfo: () => Promise<SystemInfo>

  // 后端调用
  callBackend: (pluginId: string, functionName: string, args: any) => Promise<any>
  loadBackend: (pluginId: string) => Promise<void>
  unloadBackend: (pluginId: string) => Promise<void>
}

/**
 * 创建插件可用的 API（使用 Electron + Node.js）
 * 根据插件权限返回相应的 API
 */
export function createPluginAPI(permissions: string[] = []): Partial<PluginAPI> {
  const api: any = {}

  // 后端 API（总是可用）
  const backendAPI = createBackendAPI()
  api.callBackend = backendAPI.callBackend
  api.loadBackend = backendAPI.loadBackend
  api.unloadBackend = backendAPI.unloadBackend

  // 网络权限
  if (permissions.includes('network')) {
    api.httpRequest = async (options: HttpRequestOptions) => {
      try {
        const response = await fetch(options.url, {
          method: options.method || 'GET',
          headers: options.headers,
          body: options.body
        })

        const body = await response.text()
        const headers: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          headers[key] = value
        })

        return {
          status: response.status,
          headers,
          body
        }
      } catch (error) {
        throw new Error(`HTTP 请求失败: ${error}`)
      }
    }
  }

  // 文件系统权限
  if (permissions.includes('filesystem')) {
    api.readFile = async (path: string) => {
      try {
        return await window.api.fs.readFile(path)
      } catch (error) {
        throw new Error(`读取文件失败: ${error}`)
      }
    }

    api.writeFile = async (path: string, content: string) => {
      try {
        await window.api.fs.writeFile(path, content)
      } catch (error) {
        throw new Error(`写入文件失败: ${error}`)
      }
    }
  }

  // 剪贴板权限
  if (permissions.includes('clipboard')) {
    api.readClipboard = async () => {
      try {
        return await navigator.clipboard.readText()
      } catch (error) {
        throw new Error(`读取剪贴板失败: ${error}`)
      }
    }

    api.writeClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch (error) {
        throw new Error(`写入剪贴板失败: ${error}`)
      }
    }
  }

  // 通知权限
  if (permissions.includes('notification')) {
    api.showNotification = async (title: string, body: string) => {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body })
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            new Notification(title, { body })
          }
        }
      } catch (error) {
        throw new Error(`显示通知失败: ${error}`)
      }
    }
  }

  // 加密/哈希（使用 Web Crypto API）
  api.hash = async (data: string, algorithm: 'md5' | 'sha256' | 'sha512') => {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      let algoName = algorithm.toUpperCase()
      if (algorithm === 'md5') {
        // MD5 需要额外的库，这里简化处理
        throw new Error('MD5 暂不支持，请使用 SHA-256 或 SHA-512')
      }

      const hashBuffer = await crypto.subtle.digest(algoName.replace('SHA', 'SHA-'), dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      throw new Error(`哈希计算失败: ${error}`)
    }
  }

  api.base64Encode = async (data: string) => {
    try {
      return btoa(data)
    } catch (error) {
      throw new Error(`Base64 编码失败: ${error}`)
    }
  }

  api.base64Decode = async (data: string) => {
    try {
      return atob(data)
    } catch (error) {
      throw new Error(`Base64 解码失败: ${error}`)
    }
  }

  // 压缩（使用 CompressionStream API）
  api.compress = async (data: string) => {
    try {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(data))
          controller.close()
        }
      })

      const compressedStream = stream.pipeThrough(new CompressionStream('gzip'))
      const reader = compressedStream.getReader()
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        compressed.set(chunk, offset)
        offset += chunk.length
      }

      return btoa(String.fromCharCode(...compressed))
    } catch (error) {
      throw new Error(`压缩失败: ${error}`)
    }
  }

  api.decompress = async (data: string) => {
    try {
      const compressed = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(compressed)
          controller.close()
        }
      })

      const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'))
      const reader = decompressedStream.getReader()
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const decoder = new TextDecoder()
      return decoder.decode(
        new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], [] as number[]))
      )
    } catch (error) {
      throw new Error(`解压失败: ${error}`)
    }
  }

  // 系统信息
  api.getSystemInfo = async () => {
    return {
      os: navigator.platform,
      arch: navigator.userAgent.includes('x64') ? 'x64' : 'arm64',
      version: navigator.appVersion
    }
  }

  return api
}
