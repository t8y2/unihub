import type { Plugin } from '@/types/plugin'
import JsonFormatter from '@/components/JsonFormatter.vue'
import CodeFormatter from '@/components/CodeFormatter.vue'
import JwtTool from '@/components/JwtTool.vue'
import DataConverter from '@/components/DataConverter.vue'
import TwoFactorAuth from '@/components/TwoFactorAuth.vue'
import QRCodeTool from '@/components/QRCodeTool.vue'
import Base64Tool from '@/components/Base64Tool.vue'
import UrlTool from '@/components/UrlTool.vue'
import TimestampTool from '@/components/TimestampTool.vue'

// 内置插件定义
export const builtinPlugins: Plugin[] = [
  // 格式化工具
  {
    metadata: {
      id: 'json',
      name: 'JSON',
      description: 'JSON 格式化与压缩',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      category: 'formatter',
      keywords: ['json', 'format', '格式化']
    },
    component: JsonFormatter,
    enabled: true
  },
  {
    metadata: {
      id: 'javascript',
      name: 'JavaScript',
      description: 'JavaScript 代码格式化',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      category: 'formatter',
      keywords: ['javascript', 'js', 'format', '格式化']
    },
    component: CodeFormatter,
    enabled: true,
    config: { language: 'javascript', title: 'JavaScript' }
  },
  {
    metadata: {
      id: 'css',
      name: 'CSS',
      description: 'CSS 样式格式化',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
      category: 'formatter',
      keywords: ['css', 'style', 'format', '格式化']
    },
    component: CodeFormatter,
    enabled: true,
    config: { language: 'css', title: 'CSS' }
  },
  {
    metadata: {
      id: 'html',
      name: 'HTML',
      description: 'HTML 代码格式化',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      category: 'formatter',
      keywords: ['html', 'markup', 'format', '格式化']
    },
    component: CodeFormatter,
    enabled: true,
    config: { language: 'html', title: 'HTML' }
  },

  // 工具
  {
    metadata: {
      id: 'jwt',
      name: 'JWT 工具',
      description: 'JWT 编码解码与验证',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      category: 'tool',
      keywords: ['jwt', 'token', 'auth', '认证']
    },
    component: JwtTool,
    enabled: true
  },
  {
    metadata: {
      id: 'converter',
      name: '格式转换',
      description: 'JSON/YAML/TOML/XML 互转',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      category: 'tool',
      keywords: ['convert', 'json', 'yaml', 'toml', 'xml', '转换']
    },
    component: DataConverter,
    enabled: true
  },
  {
    metadata: {
      id: '2fa',
      name: '2FA 验证码',
      description: 'TOTP 双因素验证码生成',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      category: 'tool',
      keywords: ['2fa', 'totp', 'otp', 'auth', '验证码']
    },
    component: TwoFactorAuth,
    enabled: true
  },
  {
    metadata: {
      id: 'qrcode',
      name: '二维码',
      description: '二维码生成与识别',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
      category: 'tool',
      keywords: ['qrcode', 'qr', 'barcode', '二维码']
    },
    component: QRCodeTool,
    enabled: true
  },
  {
    metadata: {
      id: 'timestamp',
      name: '时间戳',
      description: '时间戳与日期互转',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      category: 'tool',
      keywords: ['timestamp', 'time', 'date', '时间戳']
    },
    component: TimestampTool,
    enabled: true
  },

  // 编码工具
  {
    metadata: {
      id: 'base64',
      name: 'Base64',
      description: 'Base64 编码解码',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      category: 'encoder',
      keywords: ['base64', 'encode', 'decode', '编码']
    },
    component: Base64Tool,
    enabled: true
  },
  {
    metadata: {
      id: 'url',
      name: 'URL 编码',
      description: 'URL 编码解码',
      version: '1.0.0',
      author: 'UniHub',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
      category: 'encoder',
      keywords: ['url', 'encode', 'decode', '编码']
    },
    component: UrlTool,
    enabled: true
  }
]
