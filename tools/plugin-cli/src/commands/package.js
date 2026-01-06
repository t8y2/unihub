import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import chalk from 'chalk'
import ora from 'ora'

export async function packagePlugin(options) {
  console.log(chalk.cyan.bold('\n📦 打包插件\n'))

  const spinner = ora('正在打包...').start()

  try {
    // 读取 package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('未找到 package.json 文件')
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    const unihubConfig = packageJson.unihub

    if (!unihubConfig) {
      throw new Error('package.json 中缺少 unihub 配置')
    }

    // 验证必填字段
    const requiredFields = ['id', 'name', 'icon', 'category', 'entry']
    for (const field of requiredFields) {
      if (!unihubConfig[field]) {
        throw new Error(`unihub 配置缺少必填字段: ${field}`)
      }
    }

    // 确保 dist 目录存在
    const distDir = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distDir)) {
      throw new Error('dist 目录不存在，请先运行 npm run build')
    }

    // 删除旧的 zip 文件
    const zipPath = path.join(process.cwd(), options.output)
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath)
    }

    // 创建 zip 文件
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => {
      spinner.succeed(chalk.green('打包完成！'))

      console.log(chalk.cyan('\n📋 插件信息:\n'))
      console.log(chalk.white(`  ID:       ${unihubConfig.id}`))
      console.log(chalk.white(`  名称:     ${unihubConfig.name}`))
      console.log(chalk.white(`  版本:     ${packageJson.version}`))
      console.log(chalk.white(`  分类:     ${unihubConfig.category}`))
      console.log(chalk.white(`  权限:     ${unihubConfig.permissions?.join(', ') || '无'}`))
      console.log(chalk.white(`  大小:     ${(archive.pointer() / 1024).toFixed(2)} KB`))
      console.log(chalk.white(`  输出:     ${zipPath}\n`))
    })

    archive.on('error', (err) => {
      throw err
    })

    archive.pipe(output)

    // 添加 package.json
    archive.file(packageJsonPath, { name: 'package.json' })

    // 添加 dist 目录
    archive.directory(distDir, 'dist')

    // 如果有 sidecar 目录，也添加进去
    const sidecarDir = path.join(process.cwd(), 'sidecar')
    if (fs.existsSync(sidecarDir)) {
      archive.directory(sidecarDir, 'sidecar')
    }

    // 如果有 README，也添加进去
    const readmePath = path.join(process.cwd(), 'README.md')
    if (fs.existsSync(readmePath)) {
      archive.file(readmePath, { name: 'README.md' })
    }

    await archive.finalize()
  } catch (error) {
    spinner.fail(chalk.red('打包失败'))
    console.error(chalk.red(`\n❌ ${error.message}\n`))
    process.exit(1)
  }
}
