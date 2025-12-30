import type { PluginManifest, PluginPermission } from '@/types/marketplace'
import type { Plugin } from '@/types/plugin'
import { markRaw } from 'vue'
import { createTauriAPI, isTauriAvailable } from './tauri-bridge'

/**
 * 插件加载器
 * 负责加载远程插件并创建沙箱环境
 */
export class PluginLoader {
  /**
   * 从 URL 加载插件
   */
  async loadFromUrl(url: string): Promise<Plugin> {
    try {
      // 1. 下载插件包
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`下载失败: ${response.statusText}`)
      }

      const blob = await response.blob()

      // 2. 解压并加载
      return await this.loadFromBlob(blob)
    } catch (error) {
      throw new Error(`加载插件失败: ${error}`)
    }
  }

  /**
   * 从 Blob 加载插件
   */
  async loadFromBlob(blob: Blob): Promise<Plugin> {
    try {
      // 检查是否是 ZIP 文件
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // ZIP 文件签名：50 4B 03 04
      const isZip =
        uint8Array[0] === 0x50 &&
        uint8Array[1] === 0x4b &&
        uint8Array[2] === 0x03 &&
        uint8Array[3] === 0x04

      if (isZip) {
        // TODO: 实现 ZIP 解压和多文件加载
        // 1. 解压 ZIP
        // 2. 读取 manifest.json
        // 3. 加载 frontend/index.js（或 manifest.main 指定的文件）
        // 4. 如果有 backend/，加载动态库
        throw new Error('ZIP 格式插件加载功能开发中，请暂时使用单文件 .js 格式')
      } else {
        // 单文件 JS 格式（向后兼容）
        const text = await blob.text()
        return await this.loadFromCode(text)
      }
    } catch (error) {
      throw new Error(`加载插件失败: ${error}`)
    }
  }

  /**
   * 从代码字符串加载插件
   */
  async loadFromCode(code: string): Promise<Plugin> {
    try {
      // 创建沙箱环境（传递空权限，实际权限从 manifest 读取）
      const sandbox = this.createSandbox([])

      // 在沙箱中执行代码
      const pluginModule = await this.executeInSandbox(code, sandbox)

      // 调试信息
      console.log('插件模块:', pluginModule)
      console.log('是否有 default:', !!pluginModule?.default)

      // 验证插件格式
      if (!pluginModule || !pluginModule.default) {
        console.error('插件模块结构:', pluginModule)
        throw new Error('插件格式错误：缺少 default 导出')
      }

      const pluginDef = pluginModule.default

      // 获取权限
      const permissions = pluginDef.metadata?.permissions || []

      // 创建 Tauri API（根据权限）
      if (isTauriAvailable()) {
        const tauriAPI = createTauriAPI(permissions)
        // 将 API 注入到全局，供插件组件使用
        ;(window as any).__PLUGIN_TAURI_API__ = tauriAPI
      }

      // 转换为标准插件格式
      const plugin: Plugin = {
        metadata: {
          id: pluginDef.metadata.id,
          name: pluginDef.metadata.name,
          description: pluginDef.metadata.description,
          version: pluginDef.metadata.version,
          author: pluginDef.metadata.author.name,
          icon: pluginDef.metadata.icon || 'M12 4v16m8-8H4',
          category: pluginDef.metadata.category,
          keywords: pluginDef.metadata.keywords || []
        },
        component: markRaw(pluginDef.component),
        enabled: true,
        config: pluginDef.config
      }

      // 标记是否有后端
      if (pluginDef.metadata?.has_backend) {
        ;(plugin as any).hasBackend = true
      }

      return plugin
    } catch (error) {
      throw new Error(`执行插件代码失败: ${error}`)
    }
  }

  /**
   * 创建沙箱环境
   */
  private createSandbox(permissions: PluginPermission[]): any {
    const sandbox: any = {
      console: console,
      // Vue 相关
      ref: (window as any).Vue?.ref,
      reactive: (window as any).Vue?.reactive,
      computed: (window as any).Vue?.computed,
      watch: (window as any).Vue?.watch,
      onMounted: (window as any).Vue?.onMounted,
      onUnmounted: (window as any).Vue?.onUnmounted
    }

    // 根据权限添加 API
    if (permissions.includes('network')) {
      sandbox.fetch = fetch.bind(window)
    }

    if (permissions.includes('clipboard')) {
      sandbox.navigator = {
        clipboard: navigator.clipboard
      }
    }

    // 添加 Tauri API（如果在 Tauri 环境中）
    if (isTauriAvailable()) {
      const tauriAPI = createTauriAPI(permissions)
      sandbox.$tauri = tauriAPI
    }

    // 注意：不要在这里设置 eval/Function/require
    // 它们会在沙箱执行时被自动隔离

    return sandbox
  }

  /**
   * 在沙箱中执行代码
   */
  private async executeInSandbox(code: string, sandbox: any): Promise<any> {
    try {
      // 创建模块导出对象
      const module = { exports: {} }
      const exports = module.exports

      // 过滤掉不能作为参数名的保留字
      const sandboxKeys = Object.keys(sandbox).filter((key) => {
        // 排除严格模式下的保留字
        const reserved = [
          'eval',
          'arguments',
          'yield',
          'let',
          'static',
          'implements',
          'interface',
          'package',
          'private',
          'protected',
          'public'
        ]
        return !reserved.includes(key)
      })

      const sandboxValues = sandboxKeys.map((key) => sandbox[key])

      // 构建沙箱代码
      const sandboxCode = `
        'use strict';
        ${code}
        return module.exports;
      `

      // 执行代码
      const func = new Function(...sandboxKeys, 'module', 'exports', sandboxCode)
      const result = func(...sandboxValues, module, exports)

      return result
    } catch (error) {
      throw new Error(`沙箱执行失败: ${error}`)
    }
  }

  /**
   * 验证插件清单
   */
  validateManifest(manifest: PluginManifest): boolean {
    const required = ['id', 'name', 'description', 'version', 'author', 'category', 'main']

    for (const field of required) {
      if (!manifest[field as keyof PluginManifest]) {
        throw new Error(`插件清单缺少必需字段: ${field}`)
      }
    }

    // 验证 ID 格式（反向域名）
    if (!/^[a-z0-9.-]+\.[a-z0-9.-]+$/.test(manifest.id)) {
      throw new Error('插件 ID 格式错误，应使用反向域名格式，如: com.example.plugin')
    }

    // 验证版本格式
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      throw new Error('版本号格式错误，应使用语义化版本，如: 1.0.0')
    }

    return true
  }
}

export const pluginLoader = new PluginLoader()
