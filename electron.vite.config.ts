import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
        // 移除 external 配置，让依赖正常打包到 bundle 中
      },
      // 性能优化
      minify: 'esbuild',
      target: 'node18',
      reportCompressedSize: false, // 禁用压缩大小报告，加快构建
      chunkSizeWarningLimit: 2000
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        }
      },
      // 性能优化
      minify: 'esbuild',
      reportCompressedSize: false
      // preload 必须使用 node target，不能设置为 chrome
    }
  },
  renderer: {
    root: './src/renderer',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        // 使用包含编译器的 Vue 版本，支持运行时模板编译
        vue: 'vue/dist/vue.esm-bundler.js'
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version)
    },
    plugins: [vue(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        },
        // Tree shaking 优化
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false
        },
        output: {
          // 代码分割优化 - 更细粒度的分块
          manualChunks(id): string | undefined {
            // Vue 核心
            if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
              return 'vue-core'
            }
            // UI 组件库
            if (id.includes('node_modules/reka-ui')) {
              return 'reka-ui'
            }
            if (id.includes('node_modules/lucide-vue-next')) {
              return 'lucide-icons'
            }
            if (id.includes('node_modules/@radix-icons')) {
              return 'radix-icons'
            }
            // 代码高亮
            if (id.includes('node_modules/highlight.js')) {
              return 'highlight'
            }
            // 工具库
            if (
              id.includes('node_modules/jose') ||
              id.includes('node_modules/otpauth') ||
              id.includes('node_modules/qrcode-generator')
            ) {
              return 'crypto-utils'
            }
            if (
              id.includes('node_modules/js-yaml') ||
              id.includes('node_modules/smol-toml') ||
              id.includes('node_modules/xml-js')
            ) {
              return 'parsers'
            }
            // VueUse 工具库
            if (id.includes('node_modules/@vueuse/')) {
              return 'vueuse'
            }
            // 样式相关
            if (id.includes('node_modules/tailwind') || id.includes('node_modules/clsx')) {
              return 'styles'
            }
            // 其他大型库单独分包
            if (id.includes('node_modules/prettier')) {
              return 'prettier'
            }
            // 其他 node_modules
            if (id.includes('node_modules')) {
              return 'vendor'
            }
            // 默认返回 undefined，让 Vite 自动处理
            return undefined
          },
          // 优化代码分割
          experimentalMinChunkSize: 10000 // 减小最小 chunk 大小到 10KB
        }
      },
      // 性能优化
      minify: 'esbuild',
      target: 'chrome120',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1500,
      reportCompressedSize: false, // 禁用压缩大小报告
      sourcemap: false,
      // 进一步优化
      assetsInlineLimit: 4096, // 小于 4KB 的资源内联
      cssMinify: 'esbuild'
    },
    // 开发服务器优化
    server: {
      hmr: {
        overlay: false
      },
      // 预热常用文件
      warmup: {
        clientFiles: ['./src/App.vue', './src/main.ts']
      }
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: ['vue', '@radix-icons/vue', 'lucide-vue-next', 'reka-ui'],
      exclude: ['electron'],
      // 强制预构建
      force: false
    },
    // 进一步优化构建
    esbuild: {
      // 移除 console 和 debugger（生产环境）
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
      // 压缩标识符
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true
    }
  }
})
