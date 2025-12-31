# UniHub 插件系统改进文档

## 🎉 新增功能

### 1. 全局搜索框 ⭐⭐⭐⭐⭐

**功能描述**：
- 快速搜索和启动插件
- 支持插件名称、描述、关键词匹配
- 智能排序（按匹配度）
- 键盘导航（↑↓ 选择，Enter 打开，ESC 关闭）

**使用方法**：
```
快捷键：
- ⌘K (Mac) 或 Ctrl+K (Windows/Linux)
- ⌘P (Mac) 或 Ctrl+P (Windows/Linux)

或点击顶部工具栏的"搜索"按钮
```

**实现文件**：
- `src/renderer/src/components/GlobalSearch.vue` - 搜索组件
- `src/renderer/src/App.vue` - 集成到主应用

**特性**：
- ✅ 实时搜索
- ✅ 模糊匹配
- ✅ 分数排序
- ✅ 键盘快捷键
- ✅ 美观的 UI

---

### 2. 权限系统 ⭐⭐⭐⭐⭐

**功能描述**：
- 插件权限管理
- 安装时显示权限请求
- 运行时权限验证
- 防止恶意插件访问敏感资源

**支持的权限**：
```typescript
type Permission =
  | 'fs'           // 文件系统访问
  | 'clipboard'    // 剪贴板访问
  | 'http'         // HTTP 请求
  | 'notification' // 系统通知
  | 'spawn'        // 子进程执行
  | 'system'       // 系统信息
```

**配置方法**：
```json
// package.json
{
  "unihub": {
    "permissions": ["fs", "clipboard", "http"]
  }
}
```

**实现文件**：
- `src/main/permission-manager.ts` - 权限管理器
- `src/renderer/src/components/PermissionDialog.vue` - 权限对话框
- `src/main/plugin-api.ts` - API 权限检查
- `src/main/node-api.ts` - Node API 权限检查

**安全特性**：
- ✅ 白名单机制（只允许声明的权限）
- ✅ 运行时验证（每次 API 调用都检查）
- ✅ 路径隔离（插件只能访问自己的目录）
- ✅ 风险等级提示（高/中/低）

---

### 3. 全局快捷键 ⭐⭐⭐⭐

**功能描述**：
- 全局快捷键支持
- 显示/隐藏主窗口
- 插件可注册自定义快捷键

**默认快捷键**：
```
⌘⇧Space (Mac) 或 Ctrl+Shift+Space (Windows/Linux)
- 显示/隐藏主窗口（类似 Spotlight）
```

**应用内快捷键**：
```
⌘K / Ctrl+K - 打开全局搜索
⌘P / Ctrl+P - 打开全局搜索
⌘T / Ctrl+T - 新建主页标签
⌘W / Ctrl+W - 关闭当前标签
⌘B / Ctrl+B - 切换侧边栏
```

**实现文件**：
- `src/main/shortcut-manager.ts` - 快捷键管理器
- `src/main/index.ts` - 注册全局快捷键

**API 示例**（未来支持）：
```typescript
// 插件注册快捷键
window.unihub.shortcut.register('Cmd+Shift+A', () => {
  console.log('快捷键触发')
})
```

---

## 🔧 改进的功能

### 1. 插件隔离

**改进内容**：
- 每个插件运行在独立的 WebContentsView 中
- 插件只能访问自己的数据目录
- 防止路径遍历攻击

**安全检查**：
```typescript
// 路径安全检查
private getSafePath(pluginId: string, filePath: string): string {
  const pluginDir = join(this.pluginsDir, pluginId)
  const fullPath = resolve(pluginDir, filePath)

  // 检查路径是否在插件目录内
  if (!fullPath.startsWith(pluginDir)) {
    throw new Error('路径遍历攻击检测')
  }

  return fullPath
}
```

### 2. 错误处理

**改进内容**：
- 统一的错误处理机制
- 权限错误提示
- 友好的错误消息

**示例**：
```typescript
// 权限不足时的错误
try {
  await window.unihub.clipboard.readText()
} catch (error) {
  // Error: 插件 com.example.plugin 缺少权限: clipboard
}
```

---

## 📊 与竞品对比

### 功能对比表

| 功能 | uTools | Rubick | UniHub (改进后) |
|------|--------|--------|-----------------|
| 全局搜索框 | ✅ | ✅ | ✅ |
| 关键词触发 | ✅ | ✅ | ✅ |
| 权限系统 | ✅ | ❌ | ✅ |
| 全局快捷键 | ✅ | ✅ | ✅ |
| 插件隔离 | ✅ | ❌ | ✅ |
| 热重载 | ✅ | ❌ | ✅ |
| Sidecar 支持 | ❌ | ❌ | ✅ |
| 开源 | ❌ | ✅ | ✅ |

### 优势总结

**UniHub 的独特优势**：
1. ✅ **现代化架构**：Vite + WebContentsView
2. ✅ **Sidecar 支持**：Go/Rust/C++ 原生性能
3. ✅ **标准化配置**：使用 package.json
4. ✅ **完善的权限系统**：细粒度权限控制
5. ✅ **开发体验优秀**：热重载 + TypeScript

---

## 🚀 使用示例

### 1. 创建带权限的插件

```json
// package.json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "unihub": {
    "id": "com.example.myplugin",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": ["clipboard", "http"],
    "keywords": ["工具", "效率", "clipboard"]
  }
}
```

### 2. 使用 API

```typescript
// 读取剪贴板（需要 clipboard 权限）
const text = await window.unihub.clipboard.readText()

// 发起 HTTP 请求（需要 http 权限）
const data = await window.unihub.http.get('https://api.example.com')

// 执行 Sidecar（需要 spawn 权限）
const result = await window.node.spawn('./sidecar/main', [], {
  input: JSON.stringify({ action: 'process' })
})
```

### 3. 搜索和启动插件

```
1. 按 ⌘K 打开搜索框
2. 输入关键词（如 "base64"）
3. 使用 ↑↓ 选择插件
4. 按 Enter 打开插件
```

---

## 📝 待实现功能

### P1 优先级

1. **插件市场 UI**
   - 浏览插件
   - 搜索插件
   - 一键安装
   - 评分和评论

2. **窗口控制 API**
   ```typescript
   window.unihub.window.hide()
   window.unihub.window.show()
   window.unihub.window.setSize(width, height)
   ```

3. **屏幕截图 API**
   ```typescript
   const screenshot = await window.unihub.screen.capture()
   ```

### P2 优先级

4. **插件更新检查**
   - 自动检查更新
   - 一键更新

5. **插件模板生成器**
   ```bash
   npm create unihub-plugin@latest
   ```

6. **兼容 uTools 插件格式**
   - 降低迁移成本
   - 快速扩充生态

---

## 🎯 总结

经过本次改进，UniHub 插件系统已经具备了：

1. ✅ **核心功能完整**：搜索、权限、快捷键
2. ✅ **安全性强**：权限系统 + 路径隔离
3. ✅ **开发体验好**：热重载 + TypeScript
4. ✅ **架构现代化**：Vite + WebContentsView

**下一步重点**：
- 建设插件生态（插件市场）
- 完善 API（窗口控制、截图）
- 提升用户体验（动画、主题）

---

## 📚 相关文档

- [插件开发指南](./PLUGIN_DEVELOPMENT.md)
- [API 参考](./PLUGIN_API.md)
- [架构设计](./ARCHITECTURE.md)
- [热重载指南](./HOT_RELOAD.md)
