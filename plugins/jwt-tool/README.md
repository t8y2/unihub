# JWT 工具插件

JWT 编码解码与验证工具 - 支持 HS256/HS384/HS512 算法

## 功能特性

- ✅ JWT Token 解码（不验证签名）
- ✅ JWT Token 验证（验证签名）
- ✅ JWT Token 生成（支持自定义过期时间）
- ✅ 支持 HS256/HS384/HS512 算法
- ✅ 语法高亮显示
- ✅ 一键复制结果

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 打包插件
npm run package
```

## 安装

1. 构建并打包插件：`npm run build && npm run package`
2. 在 UniHub 中安装 `plugin.zip`

## 使用

### 解码模式

1. 粘贴 JWT Token
2. 点击"解码 Token"查看 header 和 payload
3. 输入密钥后点击"验证 Token"进行签名验证

### 编码模式

1. 输入 JSON 格式的 Payload
2. 输入密钥
3. 选择算法（HS256/HS384/HS512）
4. 设置过期时间（如：1h, 7d, 30m）
5. 点击"生成 Token"

## 许可证

MIT
