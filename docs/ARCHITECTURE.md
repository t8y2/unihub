# UniHub 架构设计

## 核心理念

**1+N 模式**：1 门核心语言（JavaScript/TypeScript）+ N 种扩展方式（Sidecar）

## 三等公民制度

### 第一公民：JavaScript/TypeScript（80%）
- **地位**：主驾驶，房子的地基
- **运行**：Electron 内置 Node.js，进程内
- **性能**：< 1ms，零依赖
- **场景**：UI、文件处理、HTTP、数据存储

### 第二公民：Go/Rust/C++（15%）
- **地位**：外包工，修水管的师傅
- **运行**：编译成 .exe，通过 spawn 调用
- **性能**：50-200ms（首次），5-10ms（后续）
- **场景**：图像处理、视频转码、加密算法

### 第三公民：Python/Shell（5%）
- **地位**：不推荐
- **运行**：依赖用户环境或打包成 .exe
- **问题**：环境依赖、版本冲突、兼容性差

## API 设计

### window.node（第一公民）

```typescript
// 文件系统（限制在插件目录内）
await window.node.fs.readFile('./data.json')
await window.node.fs.writeFile('./output.txt', 'Hello')

// 用户选择（不受限制）
await window.node.fs.selectFile()

// Sidecar
await window.node.spawn('./sidecar/main', [], {
  input: JSON.stringify({ action: 'process' })
})
```

### window.unihub（简化 API）

```typescript
// 数据库
await window.unihub.db.put('key', value)
await window.unihub.db.get('key')

// 剪贴板
await window.unihub.clipboard.writeText('Hello')

// HTTP
await window.unihub.http.get('https://api.example.com')
```

## 安全设计

- **路径安全**：限制在插件目录内，防止路径遍历
- **进程安全**：只能执行插件目录内的文件
- **权限系统**：`fs`, `clipboard`, `http`, `notification`, `spawn`

## 插件结构

```
my-plugin/
├── package.json
├── dist/
│   ├── index.html
│   └── assets/
│       ├── index.js
│       └── style.css
└── sidecar/          # 可选
    ├── main-darwin
    ├── main-windows.exe
    └── main-linux
```

## 为什么用多文件模式？

1. **安全性**：避免 `unsafe-inline`，防止 XSS
2. **性能**：避免 Base64 膨胀 33%
3. **稳定性**：工具链默认支持

**关键配置**：`vite.config.ts` 中设置 `base: './'`

## 总结

- **极度标准化**：只认 Web 技术栈
- **零依赖**：用户不需要安装运行时
- **责任明确**：平台提供容器，开发者负责兼容性
- **性能优先**：推荐第一公民（Node.js）
- **灵活扩展**：需要时使用第二公民（Sidecar）

**一句话**：Node.js 是地基，Sidecar 是外包工。
