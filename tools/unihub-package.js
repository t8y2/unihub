#!/usr/bin/env node

/**
 * UniHub 插件打包工具
 * 用法: node unihub-package.js [plugin-dir]
 */

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

// 获取插件目录
const pluginDir = process.argv[2] || process.cwd()
const absolutePluginDir = path.resolve(pluginDir)

console.log('📦 UniHub 插件打包工具')
console.log(`📁 插件目录: ${absolutePluginDir}\n`)

// 验证目录
if (!fs.existsSync(absolutePluginDir)) {
  console.error('❌ 插件目录不存在')
  process.exit(1)
}

// 验证 package.json
const packageJsonPath = path.join(absolutePluginDir, 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ 找不到 package.json')
  process.exit(1)
}

let packageJson
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
} catch (error) {
  console.error('❌ package.json 格式错误:', error.message)
  process.exit(1)
}

// 验证 unihub 配置
if (!packageJson.unihub) {
  console.error('❌ package.json 中缺少 unihub 配置')
  console.error('💡 请添加 unihub 字段，参考: https://github.com/unihub/docs')
  process.exit(1)
}

const { id, entry } = packageJson.unihub
if (!id || !entry) {
  console.error('❌ unihub 配置不完整，需要 id 和 entry 字段')
  process.exit(1)
}

// 验证入口文件
const entryPath = path.join(absolutePluginDir, entry)
if (!fs.existsSync(entryPath)) {
  console.error(`❌ 入口文件不存在: ${entry}`)
  console.error('💡 请先运行 npm run build 构建插件')
  process.exit(1)
}

console.log('✅ 验证通过')
console.log(`   插件 ID: ${id}`)
console.log(`   插件名称: ${packageJson.name}`)
console.log(`   版本: ${packageJson.version}`)
console.log(`   入口: ${entry}\n`)

// 开始打包
const outputPath = path.join(absolutePluginDir, 'plugin.zip')

// 删除旧文件
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath)
}

const output = fs.createWriteStream(outputPath)
const archive = archiver('zip', { zlib: { level: 9 } })

let fileCount = 0

output.on('close', () => {
  const bytes = archive.pointer()
  const sizeMB = (bytes / 1024 / 1024).toFixed(2)
  const sizeKB = (bytes / 1024).toFixed(2)
  
  console.log('\n✅ 打包完成!')
  console.log(`📦 文件: plugin.zip`)
  console.log(`📊 大小: ${sizeMB} MB (${sizeKB} KB)`)
  console.log(`📝 文件数: ${fileCount}`)
  console.log('\n🚀 下一步:')
  console.log('   1. 测试插件: 在 UniHub 中安装 plugin.zip')
  console.log('   2. 发布插件: 上传到 GitHub Release')
  console.log('   3. 提交市场: 提交 PR 到 unihub-plugins 仓库')
})

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  警告:', err.message)
  } else {
    throw err
  }
})

archive.on('error', (err) => {
  console.error('❌ 打包失败:', err.message)
  process.exit(1)
})

archive.on('entry', (entry) => {
  fileCount++
  console.log(`   + ${entry.name}`)
})

archive.pipe(output)

console.log('📦 打包中...\n')

// 添加 package.json
archive.file(packageJsonPath, { name: 'package.json' })

// 添加入口文件所在目录
const entryDir = path.dirname(entry)
const entryDirPath = path.join(absolutePluginDir, entryDir)

if (fs.statSync(entryDirPath).isDirectory()) {
  archive.directory(entryDirPath, entryDir)
} else {
  // 如果入口是单个文件
  archive.file(entryPath, { name: entry })
}

// 添加后端（如果有）
if (packageJson.unihub.backend) {
  const backendEntry = packageJson.unihub.backend.entry
  const backendDir = path.dirname(backendEntry)
  const backendDirPath = path.join(absolutePluginDir, backendDir)
  
  if (fs.existsSync(backendDirPath)) {
    archive.directory(backendDirPath, backendDir)
  } else {
    console.warn(`⚠️  后端目录不存在: ${backendDir}`)
  }
}

// 添加 README
const readmePath = path.join(absolutePluginDir, 'README.md')
if (fs.existsSync(readmePath)) {
  archive.file(readmePath, { name: 'README.md' })
}

// 添加 LICENSE
const licensePath = path.join(absolutePluginDir, 'LICENSE')
if (fs.existsSync(licensePath)) {
  archive.file(licensePath, { name: 'LICENSE' })
}

archive.finalize()
