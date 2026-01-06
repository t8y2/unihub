import path from 'path'
import { writeFile } from './index.js'

export async function reactTemplate(targetDir, config) {
  // package.json
  const packageJson = {
    name: config.name,
    version: '1.0.0',
    description: config.description,
    author: config.author,
    license: 'MIT',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      package: 'npm run build && node scripts/package.js'
    },
    dependencies: {
      react: '^18.3.0',
      'react-dom': '^18.3.0'
    },
    devDependencies: {
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      '@vitejs/plugin-react': '^4.3.0',
      archiver: '^7.0.1',
      typescript: '^5.3.0',
      vite: '^6.0.0'
    },
    unihub: {
      id: config.pluginId,
      name: config.displayName,
      icon: config.icon,
      category: config.category,
      entry: 'dist/index.html',
      permissions: config.permissions
    }
  }

  writeFile(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2))

  // vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
`

  writeFile(path.join(targetDir, 'vite.config.ts'), viteConfig)

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }]
  }

  writeFile(path.join(targetDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2))

  // tsconfig.node.json
  const tsconfigNode = {
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true
    },
    include: ['vite.config.ts', 'scripts/**/*.js']
  }

  writeFile(path.join(targetDir, 'tsconfig.node.json'), JSON.stringify(tsconfigNode, null, 2))

  // index.html
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.displayName}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`

  writeFile(path.join(targetDir, 'index.html'), html)

  // src/main.tsx
  const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`

  writeFile(path.join(targetDir, 'src', 'main.tsx'), mainTsx)

  // src/App.tsx
  const appTsx = `import { useState } from 'react'

// UniHub API
declare global {
  interface Window {
    unihub?: {
      clipboard?: {
        writeText: (text: string) => Promise<void>
        readText: () => Promise<string>
      }
    }
  }
}

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  const processText = () => {
    if (!input) {
      alert('请输入内容')
      return
    }
    
    // 这里添加你的处理逻辑
    setResult(input.toUpperCase())
  }

  const copyResult = async () => {
    if (!result) {
      alert('没有可复制的内容')
      return
    }

    try {
      if (window.unihub?.clipboard) {
        await window.unihub.clipboard.writeText(result)
      } else {
        await navigator.clipboard.writeText(result)
      }
      alert('已复制到剪贴板')
    } catch (error) {
      alert('复制失败')
    }
  }

  const clearAll = () => {
    setInput('')
    setResult('')
  }

  return (
    <div className="container">
      <h1>${config.icon} ${config.displayName}</h1>
      <p className="description">${config.description}</p>

      <div className="input-group">
        <label htmlFor="input">输入内容:</label>
        <textarea
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="在这里输入内容..."
        />
      </div>

      <div className="button-group">
        <button onClick={processText}>处理</button>
        <button onClick={copyResult}>复制结果</button>
        <button onClick={clearAll}>清空</button>
      </div>

      {result && (
        <div className="result">
          {result}
        </div>
      )}
    </div>
  )
}

export default App
`

  writeFile(path.join(targetDir, 'src', 'App.tsx'), appTsx)

  // src/style.css
  const styleCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

#root {
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

h1 {
  color: #333;
  margin-bottom: 16px;
}

.description {
  color: #666;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #0056b3;
}

button:active {
  transform: scale(0.98);
}

.result {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #007bff;
  word-break: break-all;
}
`

  writeFile(path.join(targetDir, 'src', 'style.css'), styleCss)

  // scripts/package.js
  const packageScript = `import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import archiver from 'archiver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function packagePlugin() {
  console.log('📦 开始打包插件...')

  const packageJsonPath = path.join(rootDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const unihubConfig = packageJson.unihub

  if (!unihubConfig) {
    throw new Error('package.json 中缺少 unihub 配置')
  }

  const distDir = path.join(rootDir, 'dist')
  if (!fs.existsSync(distDir)) {
    throw new Error('请先运行 npm run build 构建项目')
  }

  const zipPath = path.join(rootDir, 'plugin.zip')
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath)
  }

  const output = fs.createWriteStream(zipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(\`✅ 插件打包完成: plugin.zip (\${archive.pointer()} bytes)\`)
  })

  archive.on('error', (err) => {
    throw err
  })

  archive.pipe(output)
  archive.file(packageJsonPath, { name: 'package.json' })
  archive.directory(distDir, 'dist')
  await archive.finalize()
}

packagePlugin().catch((err) => {
  console.error('❌ 打包失败:', err)
  process.exit(1)
})
`

  writeFile(path.join(targetDir, 'scripts', 'package.js'), packageScript)

  // README.md
  const readme = `# ${config.displayName}

${config.description}

## 技术栈

- React 18
- TypeScript
- Vite

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

## 插件信息

- **ID**: ${config.pluginId}
- **分类**: ${config.category}
- **权限**: ${config.permissions.join(', ')}
`

  writeFile(path.join(targetDir, 'README.md'), readme)

  // .gitignore
  const gitignore = `node_modules/
dist/
plugin.zip
.DS_Store
*.log
`

  writeFile(path.join(targetDir, '.gitignore'), gitignore)
}
