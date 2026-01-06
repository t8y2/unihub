import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import { generateTemplate } from '../templates/index.js'

export async function createPlugin(name, options) {
  console.log(chalk.cyan.bold('\n🚀 UniHub 插件创建向导\n'))

  // 如果没有提供名称，询问用户
  if (!name) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '插件名称:',
        validate: (input) => {
          if (!input) return '插件名称不能为空'
          if (!/^[a-z0-9-]+$/.test(input)) {
            return '插件名称只能包含小写字母、数字和连字符'
          }
          return true
        }
      }
    ])
    name = answers.name
  }

  // 收集插件信息
  const config = await inquirer.prompt([
    {
      type: 'input',
      name: 'displayName',
      message: '插件显示名称:',
      default: name
    },
    {
      type: 'input',
      name: 'description',
      message: '插件描述:',
      default: '一个 UniHub 插件'
    },
    {
      type: 'input',
      name: 'author',
      message: '作者名称:',
      default: 'UniHub Developer'
    },
    {
      type: 'list',
      name: 'template',
      message: '选择模板:',
      choices: [
        { name: 'Simple HTML - 纯 HTML/CSS/JS', value: 'simple' },
        { name: 'Vue 3 + TypeScript - 现代化开发', value: 'vue' },
        { name: 'React + TypeScript - React 开发', value: 'react' }
      ],
      default: options.template || 'vue'
    },
    {
      type: 'list',
      name: 'category',
      message: '插件分类:',
      choices: [
        { name: '工具 (tool)', value: 'tool' },
        { name: '格式化 (formatter)', value: 'formatter' },
        { name: '编码/解码 (encoder)', value: 'encoder' },
        { name: '效率 (productivity)', value: 'productivity' },
        { name: '开发者工具 (developer)', value: 'developer' },
        { name: '娱乐 (entertainment)', value: 'entertainment' },
        { name: '自定义 (custom)', value: 'custom' }
      ],
      default: 'tool'
    },
    {
      type: 'input',
      name: 'icon',
      message: '插件图标 (Emoji 或 URL):',
      default: '🔌'
    },
    {
      type: 'checkbox',
      name: 'permissions',
      message: '需要的权限:',
      choices: [
        { name: '剪贴板 (clipboard)', value: 'clipboard', checked: true },
        { name: '文件系统 (fs)', value: 'fs' },
        { name: 'HTTP 请求 (http)', value: 'http' },
        { name: '后端进程 (spawn)', value: 'spawn' },
        { name: '数据库 (db)', value: 'db' },
        { name: '系统通知 (notification)', value: 'notification' },
        { name: '系统信息 (system)', value: 'system' }
      ]
    }
  ])

  const targetDir = options.dir || path.join(process.cwd(), name)

  // 检查目录是否存在
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `目录 ${chalk.cyan(targetDir)} 已存在，是否覆盖？`,
        default: false
      }
    ])

    if (!overwrite) {
      console.log(chalk.yellow('\n❌ 已取消创建'))
      return
    }

    fs.rmSync(targetDir, { recursive: true, force: true })
  }

  const spinner = ora('正在创建插件...').start()

  try {
    // 创建目录
    fs.mkdirSync(targetDir, { recursive: true })

    // 生成插件 ID
    const pluginId = `com.${config.author.toLowerCase().replace(/\s+/g, '')}.${name}`

    // 生成模板文件
    await generateTemplate(config.template, targetDir, {
      name,
      displayName: config.displayName,
      description: config.description,
      author: config.author,
      pluginId,
      category: config.category,
      icon: config.icon,
      permissions: config.permissions
    })

    spinner.succeed(chalk.green('插件创建成功！'))

    // 显示后续步骤
    console.log(chalk.cyan('\n📦 后续步骤:\n'))
    console.log(chalk.white(`  cd ${name}`))
    console.log(chalk.white(`  npm install`))
    console.log(chalk.white(`  npm run dev`))
    console.log(chalk.white(`  npm run package\n`))

    console.log(chalk.gray('💡 提示: 使用 uhp dev 启动开发服务器\n'))
  } catch (error) {
    spinner.fail(chalk.red('创建失败'))
    console.error(chalk.red(error.message))
    process.exit(1)
  }
}
