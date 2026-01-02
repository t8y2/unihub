import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { createLogger } from '../shared/logger'

const logger = createLogger('settings')

/**
 * 应用设置接口
 */
export interface AppSettings {
  // 快捷键设置
  shortcuts: {
    toggleWindow: string // 显示/隐藏窗口
    globalSearch: string // 全局搜索
  }
  // 通用设置
  general: {
    launchAtStartup: boolean
    minimizeToTray: boolean
    language: string
  }
  // 外观设置
  appearance: {
    theme: 'light' | 'dark' | 'system'
    sidebarWidth: number
  }
}

/**
 * 默认设置
 */
const defaultSettings: AppSettings = {
  shortcuts: {
    toggleWindow: process.platform === 'darwin' ? 'Command+Shift+Space' : 'Ctrl+Shift+Space',
    globalSearch: process.platform === 'darwin' ? 'Command+K' : 'Ctrl+K'
  },
  general: {
    launchAtStartup: false,
    minimizeToTray: true,
    language: 'zh-CN'
  },
  appearance: {
    theme: 'system',
    sidebarWidth: 208
  }
}

/**
 * 设置管理器
 */
export class SettingsManager {
  private settingsPath: string
  private settings: AppSettings

  constructor() {
    const userDataPath = app.getPath('userData')
    const configDir = join(userDataPath, 'config')

    // 确保配置目录存在
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true })
    }

    this.settingsPath = join(configDir, 'settings.json')
    this.settings = this.loadSettings()
  }

  /**
   * 加载设置
   */
  private loadSettings(): AppSettings {
    try {
      if (existsSync(this.settingsPath)) {
        const data = readFileSync(this.settingsPath, 'utf-8')
        const loaded = JSON.parse(data)
        // 合并默认设置，确保新增的设置项有默认值
        return this.mergeSettings(defaultSettings, loaded)
      }
    } catch (error) {
      logger.error({ err: error }, '加载设置失败')
    }
    return { ...defaultSettings }
  }

  /**
   * 深度合并设置
   */
  private mergeSettings(defaults: AppSettings, loaded: Partial<AppSettings>): AppSettings {
    return {
      shortcuts: { ...defaults.shortcuts, ...loaded.shortcuts },
      general: { ...defaults.general, ...loaded.general },
      appearance: { ...defaults.appearance, ...loaded.appearance }
    }
  }

  /**
   * 保存设置
   */
  private saveSettings(): void {
    try {
      writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2))
    } catch (error) {
      logger.error({ err: error }, '保存设置失败')
    }
  }

  /**
   * 获取所有设置
   */
  getAll(): AppSettings {
    return { ...this.settings }
  }

  /**
   * 获取快捷键设置
   */
  getShortcuts(): AppSettings['shortcuts'] {
    return { ...this.settings.shortcuts }
  }

  /**
   * 更新快捷键
   */
  setShortcut(key: keyof AppSettings['shortcuts'], value: string): void {
    this.settings.shortcuts[key] = value
    this.saveSettings()
  }

  /**
   * 获取通用设置
   */
  getGeneral(): AppSettings['general'] {
    return { ...this.settings.general }
  }

  /**
   * 更新通用设置
   */
  setGeneral<K extends keyof AppSettings['general']>(
    key: K,
    value: AppSettings['general'][K]
  ): void {
    this.settings.general[key] = value
    this.saveSettings()
  }

  /**
   * 获取外观设置
   */
  getAppearance(): AppSettings['appearance'] {
    return { ...this.settings.appearance }
  }

  /**
   * 更新外观设置
   */
  setAppearance<K extends keyof AppSettings['appearance']>(
    key: K,
    value: AppSettings['appearance'][K]
  ): void {
    this.settings.appearance[key] = value
    this.saveSettings()
  }

  /**
   * 重置为默认设置
   */
  resetToDefaults(): void {
    this.settings = { ...defaultSettings }
    this.saveSettings()
  }

  /**
   * 批量更新设置
   */
  update(partial: Partial<AppSettings>): void {
    if (partial.shortcuts) {
      this.settings.shortcuts = { ...this.settings.shortcuts, ...partial.shortcuts }
    }
    if (partial.general) {
      this.settings.general = { ...this.settings.general, ...partial.general }
    }
    if (partial.appearance) {
      this.settings.appearance = { ...this.settings.appearance, ...partial.appearance }
    }
    this.saveSettings()
  }
}

export const settingsManager = new SettingsManager()
