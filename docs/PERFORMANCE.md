# 🚀 性能优化指南

本文档记录了 UniHub 应用的性能优化措施和最佳实践。

## 📊 优化概览

### 主进程优化
- ✅ 插件列表缓存（避免重复读取文件）
- ✅ 缓存预热（应用启动时）
- ✅ WebContentsView 性能配置
- ✅ 异步加载插件 URL

### 渲染进程优化
- ✅ Computed 缓存（插件列表、分类）
- ✅ requestIdleCallback 延迟非关键操作
- ✅ for 循环代替 forEach（性能提升 ~20%）
- ✅ ResizeObserver 代替 resize 事件
- ✅ 搜索结果缓存（LRU 策略）
- ✅ 插件市场数据缓存（5分钟）

### 构建优化
- ✅ 代码分割（vendor、ui-components、utils）
- ✅ esbuild 压缩（比 terser 快 20-40 倍）
- ✅ CSS 代码分割
- ✅ 依赖预构建优化
- ✅ 关闭 sourcemap（生产环境）

## 🎯 性能指标

### 启动性能
- 应用启动时间：< 2s
- 插件列表加载：< 100ms（缓存命中）
- 首屏渲染：< 500ms

### 运行时性能
- 标签切换：< 50ms
- 搜索响应：< 100ms
- 插件加载：< 1s

### 内存占用
- 基础内存：~100MB
- 每个插件：~50MB
- 最大内存：< 500MB（5个插件）

## 🔧 优化技术

### 1. 缓存策略

#### 插件列表缓存
```typescript
// src/main/plugin-manager.ts
private cachedPlugins: InstalledPlugin[] | null = null

private getInstalledPlugins(): InstalledPlugin[] {
  if (this.cachedPlugins !== null) {
    return this.cachedPlugins
  }
  // 读取文件...
}
```

#### 搜索结果缓存
```typescript
// src/renderer/src/components/GlobalSearch.vue
const searchCache = new Map<string, SearchResult[]>()
const MAX_CACHE_SIZE = 50
```

#### 插件市场缓存
```typescript
// src/renderer/src/components/PluginMarketplace.vue
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟
localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp }))
```

### 2. 异步优化

#### requestIdleCallback
```typescript
// src/renderer/src/App.vue
if ('requestIdleCallback' in window) {
  requestIdleCallback(performUpdate, { timeout: 100 })
} else {
  setTimeout(performUpdate, 0)
}
```

#### ResizeObserver
```typescript
// src/renderer/src/plugins/marketplace/installer.ts
this.resizeObserver = new ResizeObserver(() => {
  this.updateViewBounds()
})
this.resizeObserver.observe(container)
```

### 3. 循环优化

#### for 循环代替 forEach
```typescript
// 优化前
plugins.forEach((plugin) => { /* ... */ })

// 优化后
for (let i = 0; i < plugins.length; i++) {
  const plugin = plugins[i]
  // ...
}
```

性能提升：~20%（大数组）

### 4. WebContentsView 优化

```typescript
// src/main/webcontents-view-manager.ts
webPreferences: {
  backgroundThrottling: false,  // 禁用后台节流
  offscreen: false,             // 禁用离屏渲染
  enableWebSQL: false,          // 禁用 WebSQL
  spellcheck: false             // 禁用拼写检查
}
```

### 5. 构建优化

#### 代码分割
```typescript
// electron.vite.config.ts
manualChunks: {
  'vue-vendor': ['vue'],
  'ui-components': ['@radix-icons/vue', 'lucide-vue-next', 'reka-ui'],
  'utils': ['highlight.js', 'jose', 'js-yaml', ...]
}
```

#### esbuild 压缩
```typescript
build: {
  minify: 'esbuild',
  target: 'chrome120'
}
```

## 📈 性能监控

### Chrome DevTools
```javascript
// 测量渲染性能
performance.mark('start')
// ... 操作 ...
performance.mark('end')
performance.measure('operation', 'start', 'end')
```

### Electron DevTools
```bash
# 启用性能分析
ELECTRON_ENABLE_LOGGING=1 npm run dev
```

### 内存分析
```javascript
// 主进程
console.log(process.memoryUsage())

// 渲染进程
console.log(performance.memory)
```

## 🎨 最佳实践

### 1. 避免不必要的重新渲染
- 使用 `computed` 缓存计算结果
- 使用 `v-memo` 缓存模板
- 使用 `markRaw` 标记非响应式对象

### 2. 懒加载
- 路由懒加载
- 组件懒加载
- 图片懒加载

### 3. 虚拟滚动
- 长列表使用虚拟滚动
- 减少 DOM 节点数量

### 4. 防抖和节流
- 搜索输入防抖
- 滚动事件节流
- resize 事件节流

### 5. Web Workers
- CPU 密集型任务使用 Worker
- 避免阻塞主线程

## 🔍 性能问题排查

### 1. 启动慢
- 检查插件数量
- 检查缓存是否生效
- 检查文件 I/O

### 2. 运行卡顿
- 检查内存占用
- 检查 CPU 使用率
- 检查事件监听器

### 3. 内存泄漏
- 检查事件监听器清理
- 检查定时器清理
- 检查 WebContentsView 清理

## 📚 参考资源

- [Vue 3 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [Electron 性能优化](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Vite 性能优化](https://vitejs.dev/guide/performance.html)
- [Web Performance](https://web.dev/performance/)

## 🎯 未来优化方向

- [ ] 虚拟滚动（长列表）
- [ ] Service Worker（离线缓存）
- [ ] IndexedDB（大数据存储）
- [ ] Web Workers（CPU 密集型任务）
- [ ] 预加载（预测用户行为）
- [ ] 增量更新（插件市场）
