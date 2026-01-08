import archiver from 'archiver'
import { createWriteStream, readFileSync, existsSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

console.log('📦 开始打包插件...')
console.log(`📁 插件目录: ${rootDir}`)

// 删除旧的 zip 文件
const zipPath = join(rootDir, 'plugin.zip')
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
  throw err
})

archive.pipe(output)

// 添加 dist 目录
archive.directory(join(rootDir, 'dist'), 'dist')

// 添加 package.json
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' })

// 添加 README（可选）
if (existsSync(join(rootDir, 'README.md'))) {
  console.log('📖 添加 README.md')
  archive.file(join(rootDir, 'README.md'), { name: 'README.md' })
}

archive.finalize()
