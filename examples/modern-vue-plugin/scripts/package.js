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
  console.log('🔧 添加 backend/')
  archive.directory(path.join(rootDir, 'backend'), 'backend')
}

// 添加 sidecar 文件（可选）
if (fs.existsSync(path.join(rootDir, 'sidecar'))) {
  console.log('🚀 添加 sidecar/')
  archive.directory(path.join(rootDir, 'sidecar'), 'sidecar')
}

// 添加 README（可选）
if (fs.existsSync(path.join(rootDir, 'README.md'))) {
  console.log('📖 添加 README.md')
  archive.file(path.join(rootDir, 'README.md'), { name: 'README.md' })
}

// 完成打包
archive.finalize()

// 生成 marketplace 条目
output.on('close', () => {
  generateMarketplaceEntry()
})

/**
 * 生成 marketplace 条目
 */
function generateMarketplaceEntry() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
    
    if (!pkg.unihub) {
      console.log('\n⚠️  未找到 unihub 配置，跳过生成 marketplace 条目')
      return
    }

    const entry = {
      id: pkg.unihub.id,
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      author: typeof pkg.author === 'string' 
        ? { name: pkg.author }
        : pkg.author,
      icon: pkg.unihub.icon || '📦',
      category: pkg.unihub.category || 'tool',
      keywords: pkg.keywords || [],
      permissions: pkg.unihub.permissions || [],
      install: {
        // 从 package.json 读取安装信息
        ...(pkg.unihub.install || {}),
        // 如果没有 zip 链接，生成一个占位符
        zip: pkg.unihub.install?.zip || `https://example.com/${pkg.name}/plugin.zip`
      },
      // 向后兼容
      downloadUrl: pkg.unihub.install?.zip || pkg.homepage || '',
      homepage: pkg.homepage || '',
      repository: typeof pkg.repository === 'string' 
        ? pkg.repository 
        : pkg.repository?.url || '',
      screenshots: pkg.unihub.screenshots || [],
      downloads: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 保存到文件
    const marketplaceFile = path.join(rootDir, 'marketplace-entry.json')
    fs.writeFileSync(marketplaceFile, JSON.stringify(entry, null, 2))
    
    console.log('\n✅ 已生成 marketplace 条目: marketplace-entry.json')
    console.log('\n📋 Marketplace 条目预览:')
    console.log('─'.repeat(50))
    console.log(`名称: ${entry.name}`)
    console.log(`ID: ${entry.id}`)
    console.log(`版本: ${entry.version}`)
    console.log(`分类: ${entry.category}`)
    
    if (entry.install.npm) {
      console.log(`npm: ${entry.install.npm}`)
    }
    if (entry.install.github) {
      console.log(`GitHub: ${entry.install.github}`)
    }
    if (entry.install.zip) {
      console.log(`ZIP: ${entry.install.zip}`)
    }
    
    console.log('─'.repeat(50))
    console.log('\n💡 提示: 将此条目添加到 marketplace/plugins.json 中')
  } catch (error) {
    console.error('\n❌ 生成 marketplace 条目失败:', error.message)
  }
}
