import { app } from 'electron'
import { join } from 'path'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  rmSync,
  readFileSync,
  writeFileSync
} from 'fs'
import AdmZip from 'adm-zip'

export interface PluginDataInfo {
  pluginId: string
  pluginName: string
  dataSize: number // 字节
  fileCount: number
  lastModified: string
}

export interface BackupInfo {
  id: string
  pluginId: string
  pluginName: string
  createdAt: string
  size: number
  fileCount: number
}

export interface UninstallOptions {
  keepData: boolean // 是否保留用户数据
}

export class PluginDataManager {
  private userDataPath: string
  private pluginsDir: string
  private backupsDir: string
  private backupsMetaFile: string

  constructor() {
    this.userDataPath = app.getPath('userData')
    this.pluginsDir = join(this.userDataPath, 'plugins')
    this.backupsDir = join(this.userDataPath, 'plugin-backups')
    this.backupsMetaFile = join(this.backupsDir, 'backups-meta.json')

    // 确保备份目录存在
    if (!existsSync(this.backupsDir)) {
      mkdirSync(this.backupsDir, { recursive: true })
    }
  }

  /**
   * 获取插件数据信息
   */
  getPluginDataInfo(pluginId: string): PluginDataInfo | null {
    try {
      const pluginDir = join(this.pluginsDir, pluginId)

      if (!existsSync(pluginDir)) {
        return null
      }

      // 读取插件名称
      const packageJsonPath = join(pluginDir, 'package.json')
      let pluginName = pluginId
      if (existsSync(packageJsonPath)) {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        pluginName = pkg.unihub?.name || pkg.name || pluginId
      }

      const stats = this.calculateDirStats(pluginDir)

      return {
        pluginId,
        pluginName,
        dataSize: stats.size,
        fileCount: stats.fileCount,
        lastModified: stats.lastModified
      }
    } catch (error) {
      console.error(`获取插件 ${pluginId} 数据信息失败:`, error)
      return null
    }
  }

  /**
   * 获取所有插件的数据信息
   */
  getAllPluginsDataInfo(): PluginDataInfo[] {
    try {
      if (!existsSync(this.pluginsDir)) {
        return []
      }

      const pluginIds = readdirSync(this.pluginsDir).filter((name) => {
        const pluginPath = join(this.pluginsDir, name)
        return statSync(pluginPath).isDirectory()
      })

      return pluginIds
        .map((id) => this.getPluginDataInfo(id))
        .filter((info): info is PluginDataInfo => info !== null)
    } catch (error) {
      console.error('获取所有插件数据信息失败:', error)
      return []
    }
  }

  /**
   * 备份插件数据
   */
  async backupPluginData(
    pluginId: string
  ): Promise<{ success: boolean; message: string; backupId?: string }> {
    try {
      const pluginDir = join(this.pluginsDir, pluginId)

      if (!existsSync(pluginDir)) {
        return { success: false, message: '插件目录不存在' }
      }

      // 读取插件名称
      const packageJsonPath = join(pluginDir, 'package.json')
      let pluginName = pluginId
      if (existsSync(packageJsonPath)) {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        pluginName = pkg.unihub?.name || pkg.name || pluginId
      }

      // 生成备份 ID
      const backupId = `${pluginId}_${Date.now()}`
      const backupZipPath = join(this.backupsDir, `${backupId}.zip`)

      // 创建 ZIP 备份
      const zip = new AdmZip()
      this.addDirectoryToZip(zip, pluginDir, '')

      zip.writeZip(backupZipPath)

      // 获取备份文件大小
      const backupStats = statSync(backupZipPath)
      const stats = this.calculateDirStats(pluginDir)

      // 保存备份元数据
      const backupInfo: BackupInfo = {
        id: backupId,
        pluginId,
        pluginName,
        createdAt: new Date().toISOString(),
        size: backupStats.size,
        fileCount: stats.fileCount
      }

      this.saveBackupMeta(backupInfo)

      console.log(`✅ 插件 ${pluginName} 数据备份成功:`, backupZipPath)
      return {
        success: true,
        message: `备份成功，大小: ${this.formatSize(backupStats.size)}`,
        backupId
      }
    } catch (error) {
      console.error(`备份插件 ${pluginId} 数据失败:`, error)
      return {
        success: false,
        message: (error as Error).message
      }
    }
  }

  /**
   * 恢复插件数据
   */
  async restorePluginData(backupId: string): Promise<{ success: boolean; message: string }> {
    try {
      const backupZipPath = join(this.backupsDir, `${backupId}.zip`)

      if (!existsSync(backupZipPath)) {
        return { success: false, message: '备份文件不存在' }
      }

      // 读取备份元数据
      const backups = this.loadBackupsMeta()
      const backupInfo = backups.find((b) => b.id === backupId)

      if (!backupInfo) {
        return { success: false, message: '备份信息不存在' }
      }

      const pluginDir = join(this.pluginsDir, backupInfo.pluginId)

      // 如果插件目录已存在，先备份当前数据
      if (existsSync(pluginDir)) {
        const tempBackupResult = await this.backupPluginData(backupInfo.pluginId)
        if (!tempBackupResult.success) {
          console.warn('当前数据备份失败，继续恢复操作')
        }
        // 删除现有目录
        rmSync(pluginDir, { recursive: true, force: true })
      }

      // 确保父目录存在
      if (!existsSync(this.pluginsDir)) {
        mkdirSync(this.pluginsDir, { recursive: true })
      }

      // 解压备份
      const zip = new AdmZip(backupZipPath)
      zip.extractAllTo(pluginDir, true)

      console.log(`✅ 插件 ${backupInfo.pluginName} 数据恢复成功`)
      return {
        success: true,
        message: `恢复成功，已恢复 ${backupInfo.fileCount} 个文件`
      }
    } catch (error) {
      console.error(`恢复备份 ${backupId} 失败:`, error)
      return {
        success: false,
        message: (error as Error).message
      }
    }
  }

  /**
   * 删除备份
   */
  deleteBackup(backupId: string): { success: boolean; message: string } {
    try {
      const backupZipPath = join(this.backupsDir, `${backupId}.zip`)

      if (existsSync(backupZipPath)) {
        rmSync(backupZipPath, { force: true })
      }

      // 从元数据中删除
      const backups = this.loadBackupsMeta()
      const filtered = backups.filter((b) => b.id !== backupId)
      this.saveBackupsMeta(filtered)

      return { success: true, message: '备份已删除' }
    } catch (error) {
      console.error(`删除备份 ${backupId} 失败:`, error)
      return {
        success: false,
        message: (error as Error).message
      }
    }
  }

  /**
   * 获取所有备份
   */
  getAllBackups(): BackupInfo[] {
    return this.loadBackupsMeta()
  }

  /**
   * 获取指定插件的所有备份
   */
  getPluginBackups(pluginId: string): BackupInfo[] {
    const allBackups = this.loadBackupsMeta()
    return allBackups.filter((b) => b.pluginId === pluginId)
  }

  /**
   * 清理插件数据（删除插件目录）
   */
  clearPluginData(pluginId: string): { success: boolean; message: string } {
    try {
      const pluginDir = join(this.pluginsDir, pluginId)

      if (!existsSync(pluginDir)) {
        return { success: true, message: '插件数据不存在' }
      }

      rmSync(pluginDir, { recursive: true, force: true })

      console.log(`✅ 插件 ${pluginId} 数据已清理`)
      return { success: true, message: '数据已清理' }
    } catch (error) {
      console.error(`清理插件 ${pluginId} 数据失败:`, error)
      return {
        success: false,
        message: (error as Error).message
      }
    }
  }

  /**
   * 卸载插件时的数据处理
   */
  async handleUninstallData(
    pluginId: string,
    options: UninstallOptions
  ): Promise<{ success: boolean; message: string; backupId?: string }> {
    try {
      if (options.keepData) {
        // 保留数据：创建备份
        const backupResult = await this.backupPluginData(pluginId)
        if (!backupResult.success) {
          return {
            success: false,
            message: `备份数据失败: ${backupResult.message}`
          }
        }

        return {
          success: true,
          message: '插件已卸载，数据已备份',
          backupId: backupResult.backupId
        }
      } else {
        // 不保留数据：直接删除
        const clearResult = this.clearPluginData(pluginId)
        if (!clearResult.success) {
          return {
            success: false,
            message: `清理数据失败: ${clearResult.message}`
          }
        }

        return {
          success: true,
          message: '插件已卸载，数据已清理'
        }
      }
    } catch (error) {
      console.error(`处理插件 ${pluginId} 卸载数据失败:`, error)
      return {
        success: false,
        message: (error as Error).message
      }
    }
  }

  /**
   * 清理所有过期备份（超过指定天数）
   */
  cleanupOldBackups(daysToKeep: number = 30): {
    success: boolean
    message: string
    deletedCount: number
  } {
    try {
      const backups = this.loadBackupsMeta()
      const now = Date.now()
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000 // 转换为毫秒

      let deletedCount = 0
      const remainingBackups: BackupInfo[] = []

      for (const backup of backups) {
        const backupAge = now - new Date(backup.createdAt).getTime()

        if (backupAge > maxAge) {
          // 删除过期备份
          const backupZipPath = join(this.backupsDir, `${backup.id}.zip`)
          if (existsSync(backupZipPath)) {
            rmSync(backupZipPath, { force: true })
            deletedCount++
          }
        } else {
          remainingBackups.push(backup)
        }
      }

      // 更新元数据
      this.saveBackupsMeta(remainingBackups)

      console.log(`✅ 清理了 ${deletedCount} 个过期备份`)
      return {
        success: true,
        message: `已清理 ${deletedCount} 个过期备份`,
        deletedCount
      }
    } catch (error) {
      console.error('清理过期备份失败:', error)
      return {
        success: false,
        message: (error as Error).message,
        deletedCount: 0
      }
    }
  }

  // ========== 私有辅助方法 ==========

  /**
   * 计算目录统计信息
   */
  private calculateDirStats(dirPath: string): {
    size: number
    fileCount: number
    lastModified: string
  } {
    let totalSize = 0
    let fileCount = 0
    let latestMtime = 0

    const traverse = (path: string): void => {
      const items = readdirSync(path)

      for (const item of items) {
        const itemPath = join(path, item)
        const stats = statSync(itemPath)

        if (stats.isDirectory()) {
          traverse(itemPath)
        } else {
          totalSize += stats.size
          fileCount++
          if (stats.mtimeMs > latestMtime) {
            latestMtime = stats.mtimeMs
          }
        }
      }
    }

    traverse(dirPath)

    return {
      size: totalSize,
      fileCount,
      lastModified: new Date(latestMtime).toISOString()
    }
  }

  /**
   * 递归添加目录到 ZIP
   */
  private addDirectoryToZip(zip: AdmZip, dirPath: string, zipPath: string): void {
    const items = readdirSync(dirPath)

    for (const item of items) {
      const itemPath = join(dirPath, item)
      const itemZipPath = zipPath ? `${zipPath}/${item}` : item
      const stats = statSync(itemPath)

      if (stats.isDirectory()) {
        this.addDirectoryToZip(zip, itemPath, itemZipPath)
      } else {
        zip.addLocalFile(itemPath, zipPath)
      }
    }
  }

  /**
   * 加载备份元数据
   */
  private loadBackupsMeta(): BackupInfo[] {
    try {
      if (!existsSync(this.backupsMetaFile)) {
        return []
      }

      const data = readFileSync(this.backupsMetaFile, 'utf-8')
      return JSON.parse(data) as BackupInfo[]
    } catch (error) {
      console.error('加载备份元数据失败:', error)
      return []
    }
  }

  /**
   * 保存备份元数据
   */
  private saveBackupsMeta(backups: BackupInfo[]): void {
    try {
      writeFileSync(this.backupsMetaFile, JSON.stringify(backups, null, 2))
    } catch (error) {
      console.error('保存备份元数据失败:', error)
    }
  }

  /**
   * 保存单个备份元数据
   */
  private saveBackupMeta(backup: BackupInfo): void {
    const backups = this.loadBackupsMeta()
    backups.push(backup)
    this.saveBackupsMeta(backups)
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
}

export const pluginDataManager = new PluginDataManager()
