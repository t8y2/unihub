import path from 'path'
import { writeFile } from './index.js'

export async function simpleTemplate(targetDir, config) {
  // package.json
  const packageJson = {
    name: config.name,
    version: '1.0.0',
    description: config.description,
    author: config.author,
    license: 'MIT',
    scripts: {
      dev: 'npx serve dist',
      build: 'echo "No build needed for simple template"',
      package: 'node scripts/package.js'
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

  // dist/index.html
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.displayName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

    input, textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 8px;
    }

    button:hover {
      background: #0056b3;
    }

    button:active {
      transform: scale(0.98);
    }

    .result {
      margin-top: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${config.icon} ${config.displayName}</h1>
    <p class="description">${config.description}</p>

    <div class="input-group">
      <label for="input">输入内容:</label>
      <textarea id="input" placeholder="在这里输入内容..."></textarea>
    </div>

    <button onclick="processText()">处理</button>
    <button onclick="copyResult()">复制结果</button>
    <button onclick="clearAll()">清空</button>

    <div id="result" class="result" style="display: none;"></div>
  </div>

  <script>
    // UniHub API 示例
    const unihub = window.unihub

    function processText() {
      const input = document.getElementById('input').value
      if (!input) {
        alert('请输入内容')
        return
      }

      // 这里添加你的处理逻辑
      const result = input.toUpperCase()

      const resultDiv = document.getElementById('result')
      resultDiv.textContent = result
      resultDiv.style.display = 'block'
    }

    function copyResult() {
      const result = document.getElementById('result').textContent
      if (!result) {
        alert('没有可复制的内容')
        return
      }

      // 使用 UniHub 剪贴板 API
      if (unihub?.clipboard) {
        unihub.clipboard.writeText(result)
        alert('已复制到剪贴板')
      } else {
        // 降级方案
        navigator.clipboard.writeText(result)
          .then(() => alert('已复制到剪贴板'))
          .catch(() => alert('复制失败'))
      }
    }

    function clearAll() {
      document.getElementById('input').value = ''
      document.getElementById('result').style.display = 'none'
    }
  </script>
</body>
</html>
`

  writeFile(path.join(targetDir, 'dist', 'index.html'), html)

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

## 开发

\`\`\`bash
npm install
npm run dev
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
plugin.zip
.DS_Store
`

  writeFile(path.join(targetDir, '.gitignore'), gitignore)
}
