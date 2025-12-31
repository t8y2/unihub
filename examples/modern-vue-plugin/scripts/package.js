#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import archiver from 'archiver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

console.log('📦 开始打包插件...')

// 检查 dist 目录
if (!fs.existsSync(path.join(rootDir, 'dist'))) {
  console.error('❌ dist 目录不存在，请先运行 npm run build')
  process.exit(1)
}

// 检查 dist/index.html
if (!fs.existsSync(path.join(rootDir, 'dist/index.html'))) {
  console.error('❌ dist/index.html 不存在')
  process.exit(1)
}

// 删除旧的 zip 文件
const zipPath = path.join(rootDir, 'plugin.zip')
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath)
  console.log('🗑️  删除旧的 plugin.zip')
}

// 创建 zip 文件
const output = fs.createWriteStream(zipPath)
const archive = archiver('zip', {
  zlib: { level: 9 } // 最高压缩级别
})

output.on('close', () => {
  const bytes = archive.pointer()
  const sizeMB = (bytes / 1024 / 1024).toFixed(2)
  const sizeKB = (bytes / 1024).toFixed(2)
  
  console.log('✅ 打包完成!')
  console.log(`📦 文件: plugin.zip`)
  console.log(`📊 大小: ${sizeMB} MB (${sizeKB} KB)`)
  console.log('\n📋 包含文件:')
})

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  警告:', err)
  } else {
    throw err
  }
})

archive.on('error', (err) => {
  console.error('❌ 打包失败:', err)
  throw err
})

archive.pipe(output)

// 添加 package.json（必需）
console.log('📄 添加 package.json')
archive.file(path.join(rootDir, 'package.json'), { name: 'package.json' })

// 添加 dist 目录（必需）
console.log('📁 添加 dist/')
archive.directory(path.join(rootDir, 'dist'), 'dist')

// 添加后端文件（可选）
if (fs.existsSync(path.join(rootDir, 'backend'))) {
  console.log('�  添加 backend/')
  archive.directory(path.join(rootDir, 'backend'), 'backend')
}

// 添加 README（可选）
if (fs.existsSync(path.join(rootDir, 'README.md'))) {
  console.log('📖 添加 README.md')
  archive.file(path.join(rootDir, 'README.md'), { name: 'README.md' })
}

// 完成打包
archive.finalize()
