import type { Plugin } from '@/types/plugin'
import JsonFormatter from '@/components/JsonFormatter.vue'
import CodeFormatter from '@/components/CodeFormatter.vue'
// import JwtTool from '@/components/JwtTool.vue' // 已迁移为官方插件
import DataConverter from '@/components/DataConverter.vue'
// import TwoFactorAuth from '@/components/TwoFactorAuth.vue' // 已迁移为官方插件

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
  // JavaScript 格式化已迁移为官方插件，可在插件市场安装
  // {
  //   metadata: {
  //     id: 'javascript',
  //     name: 'JavaScript',
  //     description: 'JavaScript 代码格式化',
  //     version: '1.0.0',
  //     author: 'UniHub',
  //     icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  //     category: 'formatter',
  //     keywords: ['javascript', 'js', 'format', '格式化']
  //   },
  //   component: CodeFormatter,
  //   enabled: true,
  //   config: { language: 'javascript', title: 'JavaScript' }
  // },
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
  // JWT 工具已迁移为官方插件，可在插件市场安装
  // {
  //   metadata: {
  //     id: 'jwt',
  //     name: 'JWT 工具',
  //     description: 'JWT 编码解码与验证',
  //     version: '1.0.0',
  //     author: 'UniHub',
  //     icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
  //     category: 'tool',
  //     keywords: ['jwt', 'token', 'auth', '认证']
  //   },
  //   component: JwtTool,
  //   enabled: true
  // },
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
  }
  // 2FA 验证器已迁移为官方插件，可在插件市场安装
  // {
  //   metadata: {
  //     id: '2fa',
  //     name: '2FA 验证码',
  //     description: 'TOTP 双因素验证码生成',
  //     version: '1.0.0',
  //     author: 'UniHub',
  //     icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  //     category: 'tool',
  //     keywords: ['2fa', 'totp', 'otp', 'auth', '验证码']
  //   },
  //   component: TwoFactorAuth,
  //   enabled: true
  // }
]
