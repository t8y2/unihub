import archiver from 'archiver'
import { createWriteStream, readFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'

// 获取当前工作目录（插件目录）
const pluginDir = process.cwd()

console.log('📦 开始打包插件...')
console.log(`📁 插件目录: ${pluginDir}`)

// 检查 dist 目录
if (!existsSync(join(pluginDir, 'dist'))) {
  console.error('❌ dist 目录不存在，请先运行 npm run build')
  process.exit(1)
}

// 检查 dist/index.html
if (!existsSync(join(pluginDir, 'dist/index.html'))) {
  console.error('❌ dist/index.html 不存在')
  process.exit(1)
}

// 删除旧的 zip 文件
const zipPath = join(pluginDir, 'plugin.zip')
if (existsSync(zipPath)) {
  unlinkSync(zipPath)
  console.log('🗑️  删除旧的 plugin.zip')
}

const output = createWriteStream(zipPath)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  const bytes = archive.pointer()
  const sizeMB = (bytes / 1024 / 1024).toFixed(2)
  const sizeKB = (bytes / 1024).toFixed(2)
  console.log('✅ 打包完成!')
  console.log(`📦 文件: plugin.zip`)
  console.log(`📊 大小: ${sizeMB} MB (${sizeKB} KB)`)
})

archive.on('error', (err) => {
  console.error('❌ 打包失败:', err)
  throw err
})

archive.pipe(output)

// 添加 package.json
const packageJson = JSON.parse(readFileSync(join(pluginDir, 'package.json'), 'utf-8'))
archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' })

// 添加 dist 目录
archive.directory(join(pluginDir, 'dist'), 'dist')

// 添加 README（可选）
if (existsSync(join(pluginDir, 'README.md'))) {
  console.log('📖 添加 README.md')
  archive.file(join(pluginDir, 'README.md'), { name: 'README.md' })
}

// 添加 sidecar 文件（可选）
if (existsSync(join(pluginDir, 'sidecar'))) {
  console.log('🚀 添加 sidecar/')
  archive.directory(join(pluginDir, 'sidecar'), 'sidecar')
}

archive.finalize()
