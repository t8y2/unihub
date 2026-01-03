#!/usr/bin/env node

/**
 * 同步 marketplace/plugins.json 到 GitHub Gist
 * 用于 pre-commit hook，确保插件列表实时更新
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const { readFileSync, existsSync } = require('fs')
const { join } = require('path')

// 手动加载 .env 文件
const envPath = join(__dirname, '../.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

const GIST_ID = process.env.GIST_ID
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const PLUGINS_FILENAME = 'unihub-plugins.json'

async function syncPluginsToGist() {
  // 检查环境变量
  if (!GIST_ID || !GITHUB_TOKEN) {
    console.log('⚠️  跳过 Gist 同步：未配置 GIST_ID 或 GITHUB_TOKEN')
    console.log('   如需启用，请在 .env 文件中配置这两个变量')
    process.exit(0)
  }

  try {
    // 读取 plugins.json
    const pluginsPath = join(__dirname, '../marketplace/plugins.json')
    const pluginsContent = readFileSync(pluginsPath, 'utf-8')

    // 验证 JSON 格式
    JSON.parse(pluginsContent)

    console.log('📤 正在同步插件列表到 Gist...')

    // 更新 Gist
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'UniHub-Sync-Script'
      },
      body: JSON.stringify({
        files: {
          [PLUGINS_FILENAME]: {
            content: pluginsContent
          }
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`GitHub API 错误 (${response.status}): ${error}`)
    }

    console.log('✅ 插件列表已同步到 Gist')
    console.log(`   Gist ID: ${GIST_ID}`)
    console.log(`   文件名: ${PLUGINS_FILENAME}`)
  } catch (error) {
    console.error('❌ 同步失败:', error.message)
    // 不阻止提交，只是警告
    console.log('⚠️  提交将继续，但 Gist 未更新')
    process.exit(0)
  }
}

syncPluginsToGist()
