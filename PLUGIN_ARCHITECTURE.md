# 插件架构设计

## 🎯 设计理念

**完全开放的插件系统**：支持任意前端框架和后端语言的组合。

## 📦 插件结构

```
plugin.zip
├── manifest.json      # 插件元数据
├── frontend/          # 前端代码（任意框架）
│   └── index.html    # 入口文件
└── backend/           # 后端代码（可选，任意语言）
    └── main.*        # 可执行文件或脚本
```

## 🎨 支持的前端框架

### 1. 原生 JavaScript
- 零依赖，最快加载
- 直接操作 DOM
- 适合简单插件

### 2. Vue 3
- 通过 CDN 引入
- 响应式开发
- 组件化

### 3. React
- 通过 CDN 引入
- 使用 Babel Standalone
- 现代化开发

### 4. 其他框架
- Svelte（编译后）
- Alpine.js
- Lit
- 任何可以打包成 HTML 的框架

## 🔧 支持的后端语言

### 1. Python
```
backend/main.py
```
调用方式：`python3 main.py <function> <args>`

### 2. Go
```
backend/main.go → 编译为 main
```
调用方式：`./main <function> <args>`

### 3. Node.js
```
backend/main.js
```
调用方式：`node main.js <function> <args>`

### 4. Rust
```
backend/Cargo.toml + src/
```
编译后调用：`./target/release/backend <function> <args>`

### 5. 其他语言
- Java: `java -jar backend.jar`
- Ruby: `ruby main.rb`
- PHP: `php main.php`
- 任何可以编译为可执行文件的语言

## 🔄 通信协议

### 前端调用后端

```javascript
const response = await window.api.plugin.backendCall(
  'plugin-id',      // 插件 ID
  'function-name',  // 函数名
  JSON.stringify({ /* args */ })  // 参数（JSON 字符串）
)
```

### 后端接收参数

命令行参数：
1. `argv[1]` - 函数名
2. `argv[2]` - JSON 参数字符串

### 后端返回结果

通过 `stdout` 输出 JSON 字符串：

```json
{
  "success": true,
  "result": "...",
  "message": "..."
}
```

## 🚀 示例组合

| 前端 | 后端 | 用途 |
|------|------|------|
| 原生 JS | Go | 高性能工具 |
| React | Python | 数据分析 |
| Vue | Node.js | Web 工具 |
| Svelte | Rust | 系统工具 |

## 📝 开发流程

1. 选择前端框架
2. 选择后端语言（可选）
3. 实现功能
4. 打包成 ZIP
5. 发布或本地测试

## 🎁 优势

- ✅ 技术栈自由选择
- ✅ 无需学习特定框架
- ✅ 充分利用现有技能
- ✅ 性能最优化
- ✅ 易于维护和扩展
