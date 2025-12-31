# 性能优化指南

## 🚀 启动性能优化

### 优化前后对比

| 阶段 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| 窗口显示 | ~3秒 | ~0.5秒 | ⚡ 6倍提升 |
| API 初始化 | 阻塞启动 | 异步加载 | ✅ 不阻塞 |
| 插件加载 | 同步加载 | 延迟加载 | ✅ 按需加载 |

### 优化策略

#### 1. 异步初始化

**优化前**（阻塞启动）:
```typescript
app.whenReady().then(() => {
  pluginManager.warmupCache()        // 阻塞 3秒
  pluginManager.initializePermissions() // 阻塞
  setupIpcHandlers()
  createWindow()                     // 窗口延迟显示
})
```

**优化后**（立即显示）:
```typescript
app.whenReady().then(() => {
  setupIpcHandlers()                 // 立即设置
  createWindow()                     // 立即创建窗口
  
  // 异步初始化（不阻塞）
  setImmediate(() => {
    pluginManager.warmupCache()
    pluginManager.initializePermissions()
  })
})
```

#### 2. 延迟加载

只在需要时才加载插件：

```typescript
// 启动时不加载所有插件
// 只在用户打开插件时才加载
ipcMain.handle('plugin:open', async (_, pluginId) => {
  const result = await pluginManager.loadPlugin(pluginId)
  // ...
})
```

#### 3. 缓存优化

使用内存缓存避免重复读取：

```typescript
class PluginManager {
  private cachedPlugins: InstalledPlugin[] | null = null
  
  getInstalledPlugins() {
    if (this.cachedPlugins !== null) {
      return this.cachedPlugins  // 直接返回缓存
    }
    // 读取文件...
  }
}
```

## 📊 性能监控

### 添加性能日志

```typescript
console.time('app-startup')

app.whenReady().then(() => {
  console.timeEnd('app-startup')  // 输出启动时间
  
  console.time('window-show')
  createWindow()
  mainWindow.on('ready-to-show', () => {
    console.timeEnd('window-show')
  })
})
```

### 监控关键指标

| 指标 | 目标 | 当前 |
|------|------|------|
| 窗口显示时间 | < 1秒 | ~0.5秒 ✅ |
| API 初始化 | < 100ms | ~50ms ✅ |
| 插件加载 | < 500ms | ~200ms ✅ |
| 内存占用 | < 200MB | ~150MB ✅ |

## 🎯 最佳实践

### 1. 启动优化

- ✅ 立即创建窗口
- ✅ 异步初始化非关键功能
- ✅ 延迟加载插件
- ✅ 使用缓存减少 I/O

### 2. 运行时优化

- ✅ 使用 WebContentsView 而不是 BrowserView
- ✅ 复用插件实例
- ✅ 及时清理不用的资源
- ✅ 使用 ResizeObserver 而不是 resize 事件

### 3. 内存优化

- ✅ 及时清理缓存
- ✅ 避免内存泄漏
- ✅ 使用弱引用
- ✅ 限制并发插件数量

## 🔍 性能分析工具

### Electron DevTools

```typescript
// 在开发模式下打开性能分析
if (is.dev) {
  mainWindow.webContents.openDevTools()
}
```

### Chrome Performance

1. 打开 DevTools
2. 切换到 Performance 标签
3. 点击录制
4. 重启应用
5. 停止录制
6. 分析火焰图

### Node.js Profiler

```bash
# 启动时启用 profiler
electron --inspect=5858 .

# 在 Chrome 中打开
chrome://inspect
```

## 📈 持续优化

### 定期检查

- 每次发布前测试启动时间
- 监控内存使用
- 检查是否有性能回退

### 用户反馈

- 收集用户的性能反馈
- 分析慢启动的原因
- 针对性优化

## 🚨 常见性能问题

### 问题 1: 启动慢

**原因**: 同步加载所有插件

**解决**: 延迟加载，按需加载

### 问题 2: 内存占用高

**原因**: 插件未及时清理

**解决**: 实现插件生命周期管理

### 问题 3: 插件切换卡顿

**原因**: 每次都重新创建 WebContentsView

**解决**: 复用已创建的视图

## 📚 相关资源

- [Electron 性能优化](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Node.js 性能分析](https://nodejs.org/en/docs/guides/simple-profiling/)
