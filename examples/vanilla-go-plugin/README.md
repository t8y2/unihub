# 原生 JS + Go 插件示例

展示如何使用纯原生 JavaScript + Go 后端开发高性能插件。

## 技术栈

- **前端**: 原生 JavaScript（零依赖）
- **后端**: Go 1.21+
- **通信**: Electron IPC + 子进程

## 功能

- 数据压缩（Gzip）
- 数据加密（Base64）
- 哈希计算（MD5、SHA256）
- 性能基准测试

## 开发

```bash
# 编译 Go 后端
./build.sh

# 打包插件
./package.sh

# 测试
python3 -m http.server 8080
```

## 优势

- ⚡ 极快的加载速度（无框架开销）
- 🚀 高性能后端（Go 原生编译）
- 📦 小体积（前端 < 5KB）
- 🎯 适合性能敏感的工具
