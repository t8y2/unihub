<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const editorRef = ref<HTMLDivElement>()
let vditor: Vditor | null = null
let saveTimer: NodeJS.Timeout | null = null

const STORAGE_KEY = 'markdown-editor-content'
const AUTO_SAVE_INTERVAL = 10000 // 10 秒自动保存

// 声明 window.unihub 类型
declare global {
  interface Window {
    unihub?: {
      db?: {
        get: (key: string) => Promise<any>
        set: (key: string, value: any) => Promise<void>
      }
    }
    electron?: {
      ipcRenderer?: {
        on: (channel: string, listener: (...args: any[]) => void) => void
        removeListener: (channel: string, listener: (...args: any[]) => void) => void
      }
    }
  }
}

// 默认内容
function getDefaultContent() {
  return `# 欢迎使用 Markdown 编辑器 📝

这是一个基于 Vditor 的 Markdown 编辑器，支持实时预览和丰富的语法。

## 功能特性

- ✅ **实时预览** - 即时渲染模式，所见即所得
- ✅ **语法高亮** - 支持代码块语法高亮
- ✅ **数学公式** - 支持 LaTeX 数学公式
- ✅ **图表支持** - 支持 Mermaid 流程图
- ✅ **自动保存** - 内容每 10 秒自动保存
- ✅ **手动保存** - 支持 Cmd/Ctrl+S 快捷键
- ✅ **主题切换** - 工具栏右侧可切换深色/浅色主题

## 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, Markdown!')
}
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 表格

| 功能 | 支持 | 说明 |
|------|------|------|
| 实时预览 | ✅ | 即时渲染 |
| 代码高亮 | ✅ | 多语言支持 |
| 数学公式 | ✅ | LaTeX 语法 |

## 任务列表

- [x] 创建编辑器
- [x] 添加工具栏
- [ ] 添加更多功能

## 引用

> 这是一段引用文本
> 
> —— 作者

## 链接和图片

[UniHub 项目](https://github.com/t8y2/unihub)

---

开始你的 Markdown 创作之旅吧！ 🚀
`
}

// 加载内容
async function loadContent(): Promise<string> {
  try {
    if (window.unihub?.db) {
      const saved = await window.unihub.db.get('content')
      if (saved) {
        return saved
      }
    }
  } catch (error) {
    console.error('[Markdown] unihub.db 加载失败:', error)
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return saved
    }
  } catch (error) {
    console.error('[Markdown] localStorage 加载失败:', error)
  }
  
  return getDefaultContent()
}

// 保存内容
async function saveContent(content: string): Promise<void> {
  try {
    if (window.unihub?.db) {
      await window.unihub.db.set('content', content)
      return
    }
  } catch (error) {
    console.error('[Markdown] unihub.db 保存失败:', error)
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, content)
  } catch (error) {
    console.error('[Markdown] localStorage 保存失败:', error)
  }
}

// 手动保存
async function handleManualSave() {
  const content = vditor?.getValue()
  if (content) {
    await saveContent(content)
    showSaveIndicator()
  }
}

// 显示保存指示器
function showSaveIndicator() {
  const indicator = document.createElement('div')
  indicator.textContent = '✓ 已保存'
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 9999;
    animation: fadeInOut 2s ease-in-out;
  `
  document.body.appendChild(indicator)
  
  setTimeout(() => {
    indicator.remove()
  }, 2000)
}

// 监听键盘事件
function handleKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    handleManualSave()
  }
}

// 监听插件可见性变化
function handleVisibilityChange(_event: unknown, ...args: unknown[]) {
  const visible = args[0] as boolean
  console.log('[Markdown] 可见性变化:', visible, 'vditor存在:', !!vditor)
  
  if (!visible) {
    // 插件隐藏时，停止自动保存并保存当前内容
    if (saveTimer) {
      clearInterval(saveTimer)
      saveTimer = null
      console.log('[Markdown] 已停止自动保存')
    }
    const content = vditor?.getValue()
    if (content) {
      saveContent(content)
    }
  } else {
    // 插件显示时，恢复自动保存
    if (!saveTimer && vditor) {
      saveTimer = setInterval(async () => {
        const content = vditor?.getValue()
        if (content) {
          await saveContent(content)
          console.log('[Markdown] 保存完成')
        }
      }, AUTO_SAVE_INTERVAL)
      console.log('[Markdown] 已恢复自动保存')
    }
  }
}

onMounted(async () => {
  const initialContent = await loadContent()
  
  vditor = new Vditor(editorRef.value!, {
    height: '100%',
    theme: 'classic',
    mode: 'ir',
    placeholder: '开始编写 Markdown...',
    toolbarConfig: {
      pin: true,
    },
    cache: {
      enable: false,
    },
    counter: {
      enable: true,
      type: 'markdown',
    },
    preview: {
      markdown: {
        toc: true,
        mark: true,
        footnotes: true,
        autoSpace: true,
      },
      math: {
        engine: 'KaTeX',
      },
    },
    upload: {
      handler: () => {
        return null
      },
    },
    after: () => {
      vditor?.setValue(initialContent)
      
      saveTimer = setInterval(async () => {
        const content = vditor?.getValue()
        if (content) {
          await saveContent(content)
          console.log('[Markdown] 保存完成')
        }
      }, AUTO_SAVE_INTERVAL)
    },
  })
  
  window.addEventListener('keydown', handleKeyDown)
  
  // 监听插件可见性变化
  if (window.electron?.ipcRenderer) {
    window.electron.ipcRenderer.on('plugin-visibility-changed', handleVisibilityChange)
  }
  
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      10% { opacity: 1; transform: translateY(0); }
      90% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `
  document.head.appendChild(style)
})

onBeforeUnmount(async () => {
  if (saveTimer) {
    clearInterval(saveTimer)
    saveTimer = null
  }
  
  window.removeEventListener('keydown', handleKeyDown)
  
  // 移除可见性监听
  if (window.electron?.ipcRenderer) {
    window.electron.ipcRenderer.removeListener('plugin-visibility-changed', handleVisibilityChange)
  }
  
  const content = vditor?.getValue()
  if (content) {
    await saveContent(content)
  }
  
  vditor?.destroy()
})
</script>

<template>
  <div class="editor-container">
    <div ref="editorRef" class="editor"></div>
  </div>
</template>

<style scoped>
.editor-container {
  height: 100vh;
  background: #fff;
}

.editor {
  height: 100%;
}

:deep(.vditor) {
  border: none;
}
</style>
