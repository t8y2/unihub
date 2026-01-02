# 插件统计系统

## 功能

- 实时下载量统计
- 用户评分（1-5星）
- 完全免费（GitHub Gist + Vercel）

## 开发者使用

使用官方统计服务（默认配置）：

```bash
npm run dev  # 直接启动即可
```

## Fork 后部署自己的服务

详见 [stats-api/README.md](../stats-api/README.md)

## CDN 加速

Vercel 自带全球 CDN，无需额外配置。

如需自定义域名：

1. Vercel Dashboard → 项目 → Settings → Domains
2. 添加自定义域名
3. 配置 DNS（Vercel 会自动配置 CDN）
