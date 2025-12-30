// Tauri API 兼容层 - 在 Electron 中模拟 Tauri API

export const invoke = async (command: string, args?: any): Promise<any> => {
  // 这里可以根据需要映射到 Electron API
  // 大部分 Tauri 命令在 Electron 中不需要
  console.warn(`Tauri invoke called: ${command}`, args)
  return null
}

export const convertFileSrc = (filePath: string): string => {
  // Electron 中不需要转换
  return `file://${filePath}`
}
