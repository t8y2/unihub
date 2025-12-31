#!/usr/bin/env node

/**
 * UniHub 插件创建工具
 * 用法: node create-plugin.js <plugin-name>
 */

const fs = require('fs')
const path = require('path')

const pluginName = process.argv[2]

if (!pluginName) {
  console.error('❌ 请提供插件名称')
  console.log('用法: node create-plugin.js <plugin-name>')
  console.log('示例: node create-plugin.js my-awesome-plugin')
  process.exit(1)
}

// 生成插件 ID
const pluginId = `com.${pluginName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
const pluginDir = path.resolve(pluginName)

console.log('🚀 创建 UniHub 插件')
console.log(`📦 插件名称: ${pluginName}`)
console.log(`🆔 插件 ID: ${pluginId}`)
console.log(`📁 目录: ${pluginDir}\n`)

// 检查目录是否存在
if (fs.existsSync(pluginDir)) {
  console.error('❌ 目录已存在:', pluginDir)
  process.exit(1)
}

// 创建目录结构
console.log('📁 创建目录结构...')
fs.mkdirSync(pluginDir, { recursive: true })
fs.mkdirSync(path.join(pluginDir, 'src'), { recursive: true })
fs.mkdirSync(path.join(pluginDir, 'scripts'), { recursive: true })

// 创建 package.json
console.log('📄 创建 package.json...')
const packageJson = {
  name: pluginName,
  version: '1.0.0',
  description: `${pluginName} plugin for UniHub`,
  author: 'Your Name <your@email.com>',
  license: 'MIT',
  keywords: ['unihub', 'plugin'],
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
    package: 'npm run build && node scripts/package.js'
  },
  dependencies: {
    vue: '^3.4.0'
  },
  devDependencies: {
    '@vitejs/plugin-vue': '^5.0.0',
    archiver: '^7.0.0',
    typescript: '^5.3.0',
    vite: '^5.0.0',
    'vite-plugin-singlefile': '^2.3.0',
    'vue-tsc': '^1.8.0'
  },
  unihub: {
    id: pluginId,
    icon: '🚀',
    category: 'tool',
    entry: 'dist/index.html',
    permissions: []
  }
}

fs.writeFileSync(
  path.join(pluginDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
)

// 创建 vite.config.ts
console.log('⚙️  创建 vite.config.ts...')
const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile() // 打包成单个 HTML 文件
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000, // 内联所有资源
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
`

fs.writeFileSync(path.join(pluginDir, 'vite.config.ts'), viteConfig)

// 创建 index.html
console.log('📄 创建 index.html...')
const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pluginName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`

fs.writeFileSync(path.join(pluginDir, 'index.html'), indexHtml)

// 创建 src/main.ts
console.log('📄 创建 src/main.ts...')
const mainTs = `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
`

fs.writeFileSync(path.join(pluginDir, 'src/main.ts'), mainTs)

// 创建 src/App.vue
console.log('📄 创建 src/App.vue...')
const appVue = `<template>
  <div class="container">
    <h1>🚀 ${pluginName}</h1>
    <p>欢迎使用 UniHub 插件！</p>
    
    <div class="demo">
      <input 
        v-model="input" 
        type="text" 
        placeholder="输入一些文本..."
        class="input"
      />
      <button @click="handleClick" class="button">
        处理
      </button>
      <div v-if="result" class="result">
        结果: {{ result }}
      </div>
    </div>

    <div class="api-demo">
      <h2>API 示例</h2>
      <button @click="testClipboard" class="button">
        📋 读取剪贴板
      </button>
      <button @click="testStorage" class="button">
        💾 测试存储
      </button>
      <button @click="testSystem" class="button">
        ℹ️ 系统信息
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const result = ref('')

const handleClick = () => {
  result.value = input.value.toUpperCase()
}

// 测试剪贴板 API
const testClipboard = async () => {
  if (window.unihub?.clipboard) {
    const text = await window.unihub.clipboard.readText()
    alert('剪贴板内容: ' + text)
  } else {
    alert('剪贴板 API 不可用')
  }
}

// 测试存储 API
const testStorage = async () => {
  if (window.unihub?.db) {
    await window.unihub.db.put('test-key', 'Hello UniHub!')
    const value = await window.unihub.db.get('test-key')
    alert('存储的值: ' + value)
  } else {
    alert('存储 API 不可用')
  }
}

// 测试系统 API
const testSystem = async () => {
  if (window.unihub?.system) {
    const info = await window.unihub.system.getInfo()
    alert('系统信息: ' + JSON.stringify(info, null, 2))
  } else {
    alert('系统 API 不可用')
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.demo {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.button:hover {
  background: #0056b3;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  font-weight: bold;
}

.api-demo {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #e8f4f8;
  border-radius: 8px;
}

.api-demo h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
</style>
`

fs.writeFileSync(path.join(pluginDir, 'src/App.vue'), appVue)

// 创建 src/style.css
console.log('📄 创建 src/style.css...')
const styleCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #ffffff;
  color: #333;
}

#app {
  min-height: 100vh;
}
`

fs.writeFileSync(path.join(pluginDir, 'src/style.css'), styleCss)

// 创建打包脚本
console.log('📄 创建 scripts/package.js...')
const packageScript = fs.readFileSync(
  path.join(__dirname, '../examples/modern-vue-plugin/scripts/package.js'),
  'utf-8'
)
fs.writeFileSync(path.join(pluginDir, 'scripts/package.js'), packageScript)

// 创建 README.md
console.log('📄 创建 README.md...')
const readme = `# ${pluginName}

${pluginName} plugin for UniHub

## 开发

\`\`\`bash
npm install
npm run dev
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`

## 打包

\`\`\`bash
npm run package
\`\`\`

生成的 \`plugin.zip\` 可以直接在 UniHub 中安装。

## 许可证

MIT
`

fs.writeFileSync(path.join(pluginDir, 'README.md'), readme)

// 创建 .gitignore
console.log('📄 创建 .gitignore...')
const gitignore = `node_modules
dist
plugin.zip
.DS_Store
`

fs.writeFileSync(path.join(pluginDir, '.gitignore'), gitignore)

// 创建 tsconfig.json
console.log('📄 创建 tsconfig.json...')
const tsconfig = {
  compilerOptions: {
    target: 'ES2020',
    useDefineForClassFields: true,
    module: 'ESNext',
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    skipLibCheck: true,
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'preserve',
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true
  },
  include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
  references: [{ path: './tsconfig.node.json' }]
}

fs.writeFileSync(
  path.join(pluginDir, 'tsconfig.json'),
  JSON.stringify(tsconfig, null, 2)
)

// 创建 tsconfig.node.json
const tsconfigNode = {
  compilerOptions: {
    composite: true,
    skipLibCheck: true,
    module: 'ESNext',
    moduleResolution: 'bundler',
    allowSyntheticDefaultImports: true
  },
  include: ['vite.config.ts']
}

fs.writeFileSync(
  path.join(pluginDir, 'tsconfig.node.json'),
  JSON.stringify(tsconfigNode, null, 2)
)

console.log('\n✅ 插件创建成功!\n')
console.log('📋 下一步:')
console.log(`   cd ${pluginName}`)
console.log('   npm install')
console.log('   npm run dev\n')
console.log('📚 文档: https://github.com/unihub/docs')
