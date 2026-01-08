import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'UniHub',
  description: '开发者工具集合平台',
  lang: 'zh-CN',

  head: [['link', { rel: 'icon', href: '/logo.svg' }]],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: '插件开发', link: '/plugin/' },
      { text: 'API 参考', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/t8y2/unihub' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速上手', link: '/guide/getting-started' }
          ]
        },
        {
          text: '功能',
          items: [
            { text: '内置工具', link: '/guide/builtin-tools' },
            { text: '插件管理', link: '/guide/plugin-management' },
            { text: '快捷键', link: '/guide/shortcuts' },
            { text: '主题设置', link: '/guide/theme' }
          ]
        }
      ],
      '/plugin/': [
        {
          text: '插件开发',
          items: [
            { text: '概述', link: '/plugin/' },
            { text: '快速开始', link: '/plugin/quick-start' },
            { text: '插件结构', link: '/plugin/structure' },
            { text: '插件配置', link: '/plugin/config' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '权限系统', link: '/plugin/permissions' },
            { text: '与主应用通信', link: '/plugin/communication' },
            { text: '主题适配', link: '/plugin/theming' },
            { text: '发布插件', link: '/plugin/publishing' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概述', link: '/api/' },
            { text: 'Plugin API', link: '/api/plugin-api' },
            { text: 'Node API', link: '/api/node-api' },
            { text: '事件', link: '/api/events' }
          ]
        }
      ]
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/t8y2/unihub' }],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024-present UniHub Team'
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '页面导航'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于'
    }
  }
})
