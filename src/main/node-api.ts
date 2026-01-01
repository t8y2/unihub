import { ipcMain, dialog } from 'electron'
import { readFile, writeFile, readdir, stat, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, resolve, relative } from 'path'
import { app } from 'electron'
import { spawn } from 'child_process'
import { permissionManager } from './permission-manager'

/**
 * Node.js API for plugins
 * 提供有限权限的 Node.js 功能
 */
export class NodeAPI {
  private pluginsDir: string

  constructor() {
    this.pluginsDir = join(app.getPath('userData'), 'plugins')
    this.registerHandlers()
  }

  private registerHandlers(): void {
    // ==================== 文件系统 API ====================

    // 读取文件（限制在插件目录内）
    ipcMain.handle('node-api:fs:readFile', async (_, pluginId: string, filePath: string) => {
      try {
        const safePath = this.getSafePath(pluginId, filePath)
        const content = await readFile(safePath, 'utf-8')
        return { success: true, data: content }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // 写入文件（限制在插件目录内）
    ipcMain.handle(
      'node-api:fs:writeFile',
      async (_, pluginId: string, filePath: string, content: string) => {
        try {
          const safePath = this.getSafePath(pluginId, filePath)
          await writeFile(safePath, content, 'utf-8')
          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      }
    )

    // 读取目录（限制在插件目录内）
    ipcMain.handle('node-api:fs:readdir', async (_, pluginId: string, dirPath: string) => {
      try {
        const safePath = this.getSafePath(pluginId, dirPath)
        const files = await readdir(safePath)
        return { success: true, data: files }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // 检查文件是否存在
    ipcMain.handle('node-api:fs:exists', async (_, pluginId: string, filePath: string) => {
      try {
        const safePath = this.getSafePath(pluginId, filePath)
        const exists = existsSync(safePath)
        return { success: true, data: exists }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // 获取文件信息
    ipcMain.handle('node-api:fs:stat', async (_, pluginId: string, filePath: string) => {
      try {
        const safePath = this.getSafePath(pluginId, filePath)
        const stats = await stat(safePath)
        return {
          success: true,
          data: {
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            size: stats.size,
            mtime: stats.mtime.toISOString()
          }
        }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // 创建目录
    ipcMain.handle('node-api:fs:mkdir', async (_, pluginId: string, dirPath: string) => {
      try {
        const safePath = this.getSafePath(pluginId, dirPath)
        await mkdir(safePath, { recursive: true })
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // 选择文件（用户主动选择，不受路径限制）
    ipcMain.handle('node-api:fs:selectFile', async () => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openFile']
        })
        return { success: true, data: result.filePaths[0] || null }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // 选择目录
    ipcMain.handle('node-api:fs:selectDirectory', async () => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory']
        })
        return { success: true, data: result.filePaths[0] || null }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // ==================== 子进程 API ====================

    // 执行命令（限制在插件目录内的可执行文件）
    ipcMain.handle(
      'node-api:spawn',
      async (
        _,
        pluginId: string,
        command: string,
        args: string[],
        options: Record<string, unknown> = {}
      ) => {
        try {
          // 权限检查
          permissionManager.requirePermission(pluginId, 'spawn')

          // 安全检查：只允许执行插件目录内的文件
          if (!command.startsWith('./') && !command.startsWith('.\\')) {
            throw new Error('只能执行插件目录内的文件（必须以 ./ 或 .\\ 开头）')
          }

          const pluginDir = join(this.pluginsDir, pluginId)
          const safePath = resolve(pluginDir, command)

          // 确保路径在插件目录内
          if (!safePath.startsWith(pluginDir)) {
            throw new Error('路径遍历攻击检测：不允许访问插件目录外的文件')
          }

          return await this.executeProcess(safePath, args, {
            cwd: pluginDir,
            timeout: (options.timeout as number) || 30000,
            input: options.input as string | undefined
          })
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      }
    )

    // 获取插件目录路径
    ipcMain.handle('node-api:getPluginDir', async (_, pluginId: string) => {
      return { success: true, data: join(this.pluginsDir, pluginId) }
    })
  }

  /**
   * 获取安全路径（防止路径遍历攻击）
   */
  private getSafePath(pluginId: string, filePath: string): string {
    const pluginDir = join(this.pluginsDir, pluginId)
    const fullPath = resolve(pluginDir, filePath)

    // 检查路径是否在插件目录内
    const relativePath = relative(pluginDir, fullPath)
    if (relativePath.startsWith('..') || resolve(fullPath) !== fullPath) {
      throw new Error('路径遍历攻击检测：不允许访问插件目录外的文件')
    }

    return fullPath
  }

  /**
   * 执行进程
   */
  private executeProcess(
    command: string,
    args: string[],
    options: {
      cwd: string
      timeout: number
      input?: string
    }
  ): Promise<{
    success: boolean
    stdout?: string
    stderr?: string
    exitCode?: number
    error?: string
  }> {
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        cwd: options.cwd,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''
      let killed = false

      // 设置超时
      const timer = setTimeout(() => {
        killed = true
        process.kill()
        resolve({
          success: false,
          error: '执行超时'
        })
      }, options.timeout)

      // 收集输出
      process.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      process.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      // 发送输入
      if (options.input) {
        process.stdin?.write(options.input)
        process.stdin?.end()
      }

      // 处理退出
      process.on('close', (code) => {
        if (!killed) {
          clearTimeout(timer)
          resolve({
            success: code === 0,
            stdout,
            stderr,
            exitCode: code || 0
          })
        }
      })

      // 处理错误
      process.on('error', (error) => {
        if (!killed) {
          clearTimeout(timer)
          resolve({
            success: false,
            error: error.message
          })
        }
      })
    })
  }
}
