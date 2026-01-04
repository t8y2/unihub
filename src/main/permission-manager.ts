/**
 * 权限管理器
 * 管理插件的权限请求和验证
 */
import { createLogger } from '../shared/logger'

const logger = createLogger('permission-manager')

export type Permission =
  | 'fs' // 文件系统访问
  | 'clipboard' // 剪贴板访问
  | 'http' // HTTP 请求
  | 'notification' // 系统通知
  | 'spawn' // 子进程执行
  | 'system' // 系统信息和操作

export interface PluginPermissions {
  pluginId: string
  permissions: Permission[]
  grantedAt: string
}

export class PermissionManager {
  private permissions = new Map<string, Set<Permission>>()

  /**
   * 注册插件权限
   */
  registerPlugin(pluginId: string, requestedPermissions: string[]): void {
    const validPermissions = requestedPermissions.filter((p) =>
      this.isValidPermission(p)
    ) as Permission[]

    this.permissions.set(pluginId, new Set(validPermissions))
    logger.info({ pluginId, permissions: validPermissions }, '已注册插件权限')
  }

  /**
   * 检查插件是否有指定权限
   */
  hasPermission(pluginId: string, permission: Permission): boolean {
    // 内置插件不受权限限制
    if (pluginId === 'builtin' || pluginId === 'unknown') {
      return true
    }

    const pluginPermissions = this.permissions.get(pluginId)
    if (!pluginPermissions) {
      logger.warn({ pluginId }, '⚠插件未注册权限')
      return false
    }

    const has = pluginPermissions.has(permission)
    if (!has) {
      logger.warn({ pluginId, permission }, '⚠插件缺少权限')
    }
    return has
  }

  /**
   * 验证权限（抛出异常）
   */
  requirePermission(pluginId: string, permission: Permission): void {
    if (!this.hasPermission(pluginId, permission)) {
      const errorMessage = `插件 ${pluginId} 缺少权限: ${permission}

💡 解决方案：
1. 在 package.json 中添加权限声明：
   {
     "unihub": {
       "permissions": ["${permission}"]
     }
   }

2. 重新构建并安装插件：
   npm run build && npm run package

3. 在 UniHub 中卸载旧版本，安装新版本

📚 查看文档：docs/PERMISSION_FIX.md`

      throw new Error(errorMessage)
    }
  }

  /**
   * 获取插件的所有权限
   */
  getPermissions(pluginId: string): Permission[] {
    const pluginPermissions = this.permissions.get(pluginId)
    return pluginPermissions ? Array.from(pluginPermissions) : []
  }

  /**
   * 移除插件权限
   */
  unregisterPlugin(pluginId: string): void {
    this.permissions.delete(pluginId)
    logger.info({ pluginId }, '已移除插件权限')
  }

  /**
   * 检查是否为有效权限
   */
  private isValidPermission(permission: string): boolean {
    const validPermissions: Permission[] = [
      'fs',
      'clipboard',
      'http',
      'notification',
      'spawn',
      'system'
    ]
    return validPermissions.includes(permission as Permission)
  }

  /**
   * 获取权限描述
   */
  getPermissionDescription(permission: Permission): string {
    const descriptions: Record<Permission, string> = {
      fs: '访问文件系统（读写文件、创建目录）',
      clipboard: '访问剪贴板（读写文本和图片）',
      http: '发起 HTTP 请求（访问网络资源）',
      notification: '显示系统通知',
      spawn: '执行子进程（运行 Sidecar 程序）',
      system: '访问系统信息（平台、路径等）'
    }
    return descriptions[permission] || '未知权限'
  }

  /**
   * 获取所有已注册的插件
   */
  getAllPlugins(): string[] {
    return Array.from(this.permissions.keys())
  }
}

export const permissionManager = new PermissionManager()
