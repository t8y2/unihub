// 新增：插件打包脚本
import archiver from 'archiver'
import { createWriteStream, readFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'

const pluginDir = process.cwd()

console.log('📦 开始打包插件...')
console.log(`📁 插件目录: ${pluginDir}`)

if (!existsSync(join(pluginDir, 'dist'))) {
  console.error('❌ dist 目录不存在，请先运行 npm run build')
  process.exit(1)
}

if (!existsSync(join(pluginDir, 'dist/index.html'))) {
  console.error('❌ dist/index.html 不存在')
  process.exit(1)
}

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
  console.log('📦 文件: plugin.zip')
  console.log(`📊 大小: ${sizeMB} MB (${sizeKB} KB)`)
})

archive.on('error', (err) => {
  console.error('❌ 打包失败:', err)
  throw err
})

archive.pipe(output)

const packageJson = JSON.parse(readFileSync(join(pluginDir, 'package.json'), 'utf-8'))
archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' })

archive.directory(join(pluginDir, 'dist'), 'dist')

if (existsSync(join(pluginDir, 'README.md'))) {
  console.log('📖 添加 README.md')
  archive.file(join(pluginDir, 'README.md'), { name: 'README.md' })
}

archive.finalize()
