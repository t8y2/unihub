import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

export async function validatePlugin() {
  console.log(chalk.cyan.bold('\n🔍 验证插件配置\n'))

  const errors = []
  const warnings = []

  try {
    // 检查 package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      errors.push('未找到 package.json 文件')
      printResults(errors, warnings)
      return
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    const unihubConfig = packageJson.unihub

    if (!unihubConfig) {
      errors.push('package.json 中缺少 unihub 配置')
      printResults(errors, warnings)
      return
    }

    // 验证必填字段
    const requiredFields = {
      id: 'ID',
      name: '名称',
      icon: '图标',
      category: '分类',
      entry: '入口文件'
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!unihubConfig[field]) {
        errors.push(`缺少必填字段: ${label} (${field})`)
      }
    }

    // 验证 ID 格式
    if (unihubConfig.id && !/^[a-z0-9.-]+$/.test(unihubConfig.id)) {
      errors.push('ID 格式不正确，应使用反向域名格式 (如: com.example.plugin)')
    }

    // 验证分类
    const validCategories = [
      'tool',
      'formatter',
      'encoder',
      'productivity',
      'developer',
      'entertainment',
      'custom'
    ]
    if (unihubConfig.category && !validCategories.includes(unihubConfig.category)) {
      errors.push(`无效的分类: ${unihubConfig.category}，有效值: ${validCategories.join(', ')}`)
    }

    // 验证权限
    const validPermissions = ['clipboard', 'fs', 'http', 'spawn', 'db', 'notification', 'system']
    if (unihubConfig.permissions) {
      for (const permission of unihubConfig.permissions) {
        if (!validPermissions.includes(permission)) {
          warnings.push(`未知的权限: ${permission}`)
        }
      }
    }

    // 检查入口文件
    if (unihubConfig.entry) {
      const entryPath = path.join(process.cwd(), unihubConfig.entry)
      if (!fs.existsSync(entryPath)) {
        errors.push(`入口文件不存在: ${unihubConfig.entry}`)
      }
    }

    // 检查 dist 目录
    const distDir = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distDir)) {
      warnings.push('dist 目录不存在，请先运行 npm run build')
    }

    // 检查版本号
    if (!packageJson.version) {
      warnings.push('缺少版本号')
    }

    // 检查描述
    if (!packageJson.description) {
      warnings.push('缺少描述')
    }

    // 检查作者
    if (!packageJson.author) {
      warnings.push('缺少作者信息')
    }

    printResults(errors, warnings)
  } catch (error) {
    console.error(chalk.red('验证失败:'), error.message)
    process.exit(1)
  }
}

function printResults(errors, warnings) {
  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.green('✅ 验证通过！插件配置正确。\n'))
    return
  }

  if (errors.length > 0) {
    console.log(chalk.red.bold('❌ 错误:\n'))
    errors.forEach((error) => {
      console.log(chalk.red(`  • ${error}`))
    })
    console.log()
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold('⚠️  警告:\n'))
    warnings.forEach((warning) => {
      console.log(chalk.yellow(`  • ${warning}`))
    })
    console.log()
  }

  if (errors.length > 0) {
    process.exit(1)
  }
}
