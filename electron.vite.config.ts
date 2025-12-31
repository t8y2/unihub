import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      },
      // 性能优化
      minify: 'esbuild',
      target: 'node18'
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
      minify: 'esbuild'
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
    plugins: [vue(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        },
        output: {
          // 代码分割优化
          manualChunks: {
            'vue-vendor': ['vue'],
            'ui-components': [
              '@radix-icons/vue',
              'lucide-vue-next',
              'reka-ui'
            ],
            'utils': [
              'highlight.js',
              'jose',
              'js-yaml',
              'jsqr',
              'otpauth',
              'qrcode-generator',
              'smol-toml',
              'xml-js'
            ]
          }
        }
      },
      // 性能优化
      minify: 'esbuild',
      target: 'chrome120',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      // 启用 sourcemap（仅开发环境）
      sourcemap: false
    },
    // 开发服务器优化
    server: {
      hmr: {
        overlay: false
      }
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'vue',
        '@radix-icons/vue',
        'lucide-vue-next',
        'reka-ui'
      ],
      exclude: ['electron']
    }
  }
})
