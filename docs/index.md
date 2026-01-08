---
layout: home

hero:
  name: UniHub
  text: 开发者工具集合平台
  tagline: 一站式开发工具箱，提升你的开发效率
  image:
    src: /logo.svg
    alt: UniHub
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 下载
      link: /guide/installation
    - theme: alt
      text: GitHub
      link: https://github.com/t8y2/unihub

features:
  - icon: 🛠️
    title: 丰富的内置工具
    details: JSON 格式化、Base64 编解码、时间戳转换、正则测试等常用开发工具，开箱即用
  - icon: 🔌
    title: 插件扩展系统
    details: 支持第三方插件，可从插件商店安装或自行开发，无限扩展功能
  - icon: ⚡
    title: 快速高效
    details: 基于 Electron + Vue 3 构建，原生性能，毫秒级响应
  - icon: 🎨
    title: 优雅的界面
    details: 现代化 UI 设计，支持深色/浅色主题，舒适的使用体验
  - icon: 🔒
    title: 安全可靠
    details: 本地运行，数据不上传，插件权限隔离，保护你的隐私
  - icon: 🌐
    title: 跨平台支持
    details: 支持 macOS、Windows、Linux，一次开发，处处运行
---

## 快速体验

```bash
# 克隆项目
git clone https://github.com/t8y2/unihub.git

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 内置工具

UniHub 内置了多种常用开发工具：

| 工具          | 描述                  |
| ------------- | --------------------- |
| JSON 格式化   | JSON 美化、压缩、校验 |
| Base64 编解码 | 文本/图片 Base64 转换 |
| 时间戳转换    | Unix 时间戳与日期互转 |
| URL 编解码    | URL 编码与解码        |
| 正则测试      | 正则表达式在线测试    |
| 哈希计算      | MD5、SHA1、SHA256 等  |
| UUID 生成     | 生成各版本 UUID       |
| 颜色转换      | HEX、RGB、HSL 互转    |

## 插件生态

通过插件商店，你可以安装更多功能：

- **Markdown 编辑器** - 所见即所得的 Markdown 编辑体验
- **代码对比工具** - 基于 Monaco Editor 的代码差异对比
- **剪贴板历史** - 记录和管理剪贴板历史
- **Excalidraw** - 手绘风格的图表绘制工具
- **Ctool** - 40+ 开发工具集合

[查看更多插件 →](/guide/plugin-management)
