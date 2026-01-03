import archiver from 'archiver'
import { createWriteStream, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const output = createWriteStream(join(rootDir, 'plugin.zip'))
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(`✅ 插件打包完成: ${archive.pointer()} bytes`)
  console.log('📦 文件: plugin.zip')
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

archive.finalize()
