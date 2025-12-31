#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { program } = require('commander')
const chalk = require('chalk')
const inquirer = require('inquirer')
const archiver = require('archiver')
const axios = require('axios')

program
  .name('unihub-cli')
  .description('UniHub 插件开发工具')
  .version('1.0.0')

// 创建插件模板
program
  .command('create <name>')
  .description('创建新插件项目')
  .option('-t, --template <type>', '模板类型 (vue|react|vanilla)', 'vue')
  .action(async (name, options) => {
    console.log(chalk.blue('🚀 创建插件项目...'))
    
    const templates = {
      vue: 'examples/modern-vue-plugin',
      react: 'examples/react-python-plugin', 
      vanilla: 'examples/vanilla-go-plugin'
    }
    
    const templatePath = templates[options.template]
    if (!templatePath) {
      console.error(chalk.red('❌ 不支持的模板类型'))
      return
    }
    
    // 复制模板文件
    await copyTemplate(templatePath, name)
    
    console.log(chalk.green(`✅ 插件项目 ${name} 创建成功！`))
    console.log(chalk.yellow(`📁 cd ${name}`))
    console.log(chalk.yellow('🔧 npm install'))
    console.log(chalk.yellow('🚀 npm run dev'))
  })

// 验证插件
program
  .command('validate [path]')
  .description('验证插件包')
  .action(async (pluginPath = '.') => {
    console.log(chalk.blue('🔍 验证插件...'))
    
    const manifestPath = path.join(pluginPath, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      console.error(chalk.red('❌ 找不到 manifest.json'))
      return
    }
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      
      // 验证必需字段
      const required = ['id', 'name', 'version', 'description', 'author']
      const missing = required.filter(field => !manifest[field])
      
      if (missing.length > 0) {
        console.error(chalk.red(`❌ 缺少必需字段: ${missing.join(', ')}`))
        return
      }
      
      // 验证前端文件
      const frontendPath = path.join(pluginPath, 'frontend/index.html')
      if (!fs.existsSync(frontendPath)) {
        console.error(chalk.red('❌ 找不到 frontend/index.html'))
        return
      }
      
      console.log(chalk.green('✅ 插件验证通过'))
      console.log(chalk.gray(`📦 ${manifest.name} v${manifest.version}`))
      
    } catch (error) {
      console.error(chalk.red('❌ manifest.json 格式错误'))
    }
  })

// 打包插件
program
  .command('build [path]')
  .description('打包插件')
  .option('-o, --output <file>', '输出文件名', 'plugin.zip')
  .action(async (pluginPath = '.', options) => {
    console.log(chalk.blue('📦 打包插件...'))
    
    const outputPath = path.resolve(options.output)
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    output.on('close', () => {
      console.log(chalk.green(`✅ 插件已打包: ${outputPath}`))
      console.log(chalk.gray(`📊 大小: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`))
    })
    
    archive.on('error', (err) => {
      console.error(chalk.red('❌ 打包失败:'), err)
    })
    
    archive.pipe(output)
    
    // 添加文件到压缩包
    archive.file(path.join(pluginPath, 'manifest.json'), { name: 'manifest.json' })
    archive.directory(path.join(pluginPath, 'frontend'), 'frontend')
    
    // 如果有后端文件
    const backendPath = path.join(pluginPath, 'backend')
    if (fs.existsSync(backendPath)) {
      archive.directory(backendPath, 'backend')
    }
    
    await archive.finalize()
  })

// 提交插件
program
  .command('submit <file>')
  .description('提交插件到商店')
  .option('-s, --server <url>', 'API 服务器', 'https://api.unihub.dev')
  .action(async (file, options) => {
    console.log(chalk.blue('🚀 提交插件...'))
    
    if (!fs.existsSync(file)) {
      console.error(chalk.red('❌ 插件文件不存在'))
      return
    }
    
    // 获取开发者信息
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: '开发者邮箱:',
        validate: (input) => input.includes('@') || '请输入有效邮箱'
      },
      {
        type: 'password',
        name: 'token',
        message: '开发者令牌:'
      }
    ])
    
    try {
      const formData = new FormData()
      formData.append('file', fs.createReadStream(file))
      formData.append('email', answers.email)
      
      const response = await axios.post(`${options.server}/v1/plugins/submit`, formData, {
        headers: {
          'Authorization': `Bearer ${answers.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log(chalk.green('✅ 插件提交成功！'))
      console.log(chalk.gray(`🆔 提交ID: ${response.data.submissionId}`))
      
    } catch (error) {
      console.error(chalk.red('❌ 提交失败:'), error.response?.data?.message || error.message)
    }
  })

// 开发服务器
program
  .command('dev [path]')
  .description('启动开发服务器')
  .option('-p, --port <port>', '端口号', '8080')
  .action(async (pluginPath = '.', options) => {
    console.log(chalk.blue('🔧 启动开发服务器...'))
    
    const express = require('express')
    const cors = require('cors')
    const app = express()
    
    app.use(cors())
    app.use(express.static(pluginPath))
    
    app.listen(options.port, () => {
      console.log(chalk.green(`✅ 开发服务器已启动`))
      console.log(chalk.yellow(`🌐 http://localhost:${options.port}`))
      console.log(chalk.gray('💡 在 UniHub 中输入上述 URL 进行测试'))
    })
  })

// 工具函数
async function copyTemplate(templatePath, targetName) {
  const targetPath = path.resolve(targetName)
  
  if (fs.existsSync(targetPath)) {
    throw new Error('目标目录已存在')
  }
  
  fs.mkdirSync(targetPath, { recursive: true })
  
  // 递归复制文件
  function copyRecursive(src, dest) {
    const stats = fs.statSync(src)
    
    if (stats.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true })
      const files = fs.readdirSync(src)
      
      for (const file of files) {
        if (file === 'node_modules' || file === '.git') continue
        copyRecursive(path.join(src, file), path.join(dest, file))
      }
    } else {
      fs.copyFileSync(src, dest)
    }
  }
  
  copyRecursive(templatePath, targetPath)
  
  // 更新 manifest.json
  const manifestPath = path.join(targetPath, 'manifest.json')
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    manifest.id = `com.${targetName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    manifest.name = targetName
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  }
}

program.parse()