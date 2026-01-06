#!/usr/bin/env node

import { Command } from 'commander'
import { createPlugin } from '../src/commands/create.js'
import { buildPlugin } from '../src/commands/build.js'
import { packagePlugin } from '../src/commands/package.js'
import { devPlugin } from '../src/commands/dev.js'
import { validatePlugin } from '../src/commands/validate.js'

const program = new Command()

program.name('unihub-plugin').description('UniHub 官方插件开发 CLI 工具').version('1.0.0')

// 创建插件
program
  .command('create [name]')
  .description('创建一个新的插件项目')
  .option('-t, --template <type>', '模板类型 (simple|vue|react)', 'vue')
  .option('-d, --dir <directory>', '目标目录')
  .action(createPlugin)

// 构建插件
program
  .command('build')
  .description('构建插件')
  .option('-w, --watch', '监听文件变化')
  .action(buildPlugin)

// 打包插件
program
  .command('package')
  .description('打包插件为 .zip 文件')
  .option('-o, --output <path>', '输出路径', 'plugin.zip')
  .action(packagePlugin)

// 开发模式
program
  .command('dev')
  .description('启动开发服务器')
  .option('-p, --port <port>', '端口号', '5173')
  .action(devPlugin)

// 验证插件
program.command('validate').description('验证插件配置').action(validatePlugin)

program.parse()
