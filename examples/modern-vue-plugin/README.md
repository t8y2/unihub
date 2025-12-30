# 现代化 Vue 插件

## 🚀 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite 5
- **类型系统**: TypeScript
- **样式**: 原生 CSS + 现代设计
- **后端**: Python 3

## 🛠️ 开发流程

### 1. 安装依赖
```bash
cd examples/modern-vue-plugin
npm install
```

### 2. 开发模式
```bash
npm run dev
```
这会启动 Vite 开发服务器，支持热更新。

### 3. 构建生产版本
```bash
npm run build
```
构建后的文件会输出到 `dist/` 目录，所有资源都会内联到单个 HTML 文件中。

### 4. 打包插件
```bash
npm run package
```
或者直接运行：
```bash
./package.sh
```

## 🎯 功能特色

### 编码/解码
- Base64 编码/解码
- URL 编码/解码

### 加密/解密
- 凯撒密码（可调整偏移量）
- ROT13 加密
- 反转加密
- MD5 哈希
- SHA256 哈希

### 数据压缩
- Gzip 压缩
- Zlib 压缩
- 简单行程编码

### 用户体验
- 响应式设计
- 实时结果显示
- 执行历史记录
- 一键复制结果
- 加载状态指示

## 📦 构建原理

### Vite 配置关键点

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 将所有资源内联到 HTML 中
        inlineDynamicImports: true,
        manualChunks: undefined,
      }
    }
  }
})
```

### 打包流程

1. **开发**: `npm run dev` → Vite 开发服务器
2. **构建**: `npm run build` → 生成 `dist/index.html`（所有资源内联）
3. **打包**: `./package.sh` → 创建插件 ZIP 包

### 与 CDN 方式对比

| 方式 | CDN 引入 | 现代构建 |
|------|----------|----------|
| **依赖管理** | 手动管理版本 | npm/pnpm 自动管理 |
| **类型支持** | 无 | 完整 TypeScript 支持 |
| **组件化** | 全局组件 | 模块化组件 |
| **构建优化** | 无 | Tree-shaking, 压缩 |
| **开发体验** | 基础 | 热更新, 错误提示 |
| **文件大小** | 多个文件 | 单个优化文件 |

## 🔧 自定义开发

### 添加新功能
1. 在 `src/App.vue` 中添加新的 TaskCard
2. 在 `backend/main.py` 中添加对应的处理函数
3. 更新类型定义 `src/types/plugin.ts`

### 样式定制
- 修改 `src/App.vue` 中的 CSS
- 支持 CSS 变量和现代特性
- 响应式设计

### 构建定制
- 修改 `vite.config.ts`
- 支持插件、别名、环境变量等

## 🎉 优势总结

✅ **现代开发体验**: TypeScript + 热更新  
✅ **组件化架构**: 可维护性强  
✅ **类型安全**: 编译时错误检查  
✅ **构建优化**: 自动压缩和优化  
✅ **单文件输出**: 便于插件分发  
✅ **开发工具**: Vue DevTools 支持