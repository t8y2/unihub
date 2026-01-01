/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import archiver from 'archiver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function packagePlugin() {
  console.log('📦 开始打包插件...')

  // 读取 package.json
  const packageJsonPath = path.join(rootDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const unihubConfig = packageJson.unihub

  if (!unihubConfig) {
    throw new Error('package.json 中缺少 unihub 配置')
  }

  // 确保 dist 目录存在
  const distDir = path.join(rootDir, 'dist')
  if (!fs.existsSync(distDir)) {
    throw new Error('请先运行 npm run build 构建项目')
  }

  console.log('✅ 配置验证通过')

  // 删除旧的 zip 文件
  const zipPath = path.join(rootDir, 'plugin.zip')
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath)
  }

  // 创建 plugin.zip
  const output = fs.createWriteStream(zipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(`✅ 插件打包完成: plugin.zip (${archive.pointer()} bytes)`)
    console.log('\n📋 插件信息:')
    console.log(`   ID: ${unihubConfig.id}`)
    console.log(`   名称: ${unihubConfig.name}`)
    console.log(`   版本: ${unihubConfig.version}`)
    console.log(`   分类: ${unihubConfig.category}`)
    console.log(`   权限: ${unihubConfig.permissions?.join(', ') || '无'}`)
  })

  archive.on('error', (err) => {
    throw err
  })

  archive.pipe(output)

  // 添加 package.json 到根目录
  archive.file(packageJsonPath, { name: 'package.json' })

  // 添加 dist 目录（不是 frontend 子目录）
  archive.directory(distDir, 'dist')

  await archive.finalize()
}

packagePlugin().catch((err) => {
  console.error('❌ 打包失败:', err)
  process.exit(1)
})
