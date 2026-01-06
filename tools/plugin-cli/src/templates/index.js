import fs from 'fs'
import path from 'path'
import { simpleTemplate } from './simple.js'
import { vueTemplate } from './vue.js'
import { reactTemplate } from './react.js'

export async function generateTemplate(template, targetDir, config) {
  switch (template) {
    case 'simple':
      await simpleTemplate(targetDir, config)
      break
    case 'vue':
      await vueTemplate(targetDir, config)
      break
    case 'react':
      await reactTemplate(targetDir, config)
      break
    default:
      throw new Error(`未知的模板类型: ${template}`)
  }
}

export function writeFile(filePath, content) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, content, 'utf-8')
}
