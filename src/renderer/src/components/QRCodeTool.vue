<script setup lang="ts">
import { ref } from 'vue'
import qrcode from 'qrcode-generator'
import jsQR from 'jsqr'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const inputText = ref('')
const qrCodeDataUrl = ref('')
const qrSize = ref('4')
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')

const decodeResult = ref('')
const decodeError = ref('')

const generateQRCode = () => {
  if (!inputText.value.trim()) {
    alert('请输入要生成二维码的内容')
    return
  }

  try {
    const qr = qrcode(0, errorLevel.value)
    qr.addData(inputText.value)
    qr.make()
    
    const canvas = document.createElement('canvas')
    const moduleCount = qr.getModuleCount()
    const size = parseInt(qrSize.value)
    const canvasSize = moduleCount * size
    
    canvas.width = canvasSize
    canvas.height = canvasSize
    
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建 canvas context')
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasSize, canvasSize)
    
    ctx.fillStyle = '#000000'
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(col * size, row * size, size, size)
        }
      }
    }
    
    qrCodeDataUrl.value = canvas.toDataURL('image/png')
  } catch (e: any) {
    alert(`生成失败: ${e.message}`)
  }
}

const downloadQRCode = () => {
  if (!qrCodeDataUrl.value) {
    alert('请先生成二维码')
    return
  }

  try {
    const link = document.createElement('a')
    link.download = `qrcode-${Date.now()}.png`
    link.href = qrCodeDataUrl.value
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e: any) {
    alert(`下载失败: ${e.message}`)
  }
}

const copyQRCode = async () => {
  if (!qrCodeDataUrl.value) {
    alert('请先生成二维码')
    return
  }

  try {
    // 将 data URL 转换为 Blob
    const response = await fetch(qrCodeDataUrl.value)
    const blob = await response.blob()
    
    // 使用 Clipboard API 复制图片
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    
    alert('已复制到剪贴板')
  } catch (e: any) {
    console.error('复制失败:', e)
    // 如果 Clipboard API 失败，尝试复制 data URL
    try {
      await navigator.clipboard.writeText(qrCodeDataUrl.value)
      alert('已复制图片链接到剪贴板')
    } catch (e2) {
      alert('复制失败，请使用下载功能')
    }
  }
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  decodeError.value = ''
  decodeResult.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        decodeError.value = '无法创建 canvas context'
        return
      }
      
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        decodeResult.value = code.data
      } else {
        decodeError.value = '未能识别二维码，请确保图片清晰且包含有效的二维码'
      }
    }
    
    img.onerror = () => {
      decodeError.value = '图片加载失败'
    }
    
    img.src = e.target?.result as string
  }
  
  reader.onerror = () => {
    decodeError.value = '文件读取失败'
  }
  
  reader.readAsDataURL(file)
}

const pasteAndDecode = async () => {
  try {
    const items = await navigator.clipboard.read()
    
    for (const item of items) {
      const imageType = item.types.find(t => t.startsWith('image/'))
      if (imageType) {
        const blob = await item.getType(imageType)
        
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              decodeError.value = '无法创建 canvas context'
              return
            }
            
            ctx.drawImage(img, 0, 0)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            
            const code = jsQR(imageData.data, imageData.width, imageData.height)
            
            if (code) {
              decodeResult.value = code.data
              decodeError.value = ''
            } else {
              decodeError.value = '未能识别二维码'
            }
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(blob)
        return
      }
    }
    
    alert('剪贴板中没有图片')
  } catch (e: any) {
    alert(`粘贴失败: ${e.message}`)
  }
}

const copyDecodeResult = async () => {
  if (!decodeResult.value) return
  
  try {
    await navigator.clipboard.writeText(decodeResult.value)
    alert('已复制')
  } catch (e) {
    alert('复制失败')
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-800">
    <div class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">二维码工具</h2>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
        <!-- 生成二维码 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            生成二维码
          </h3>

          <div class="space-y-4">
            <div>
              <Label class="mb-2">输入内容</Label>
              <Textarea
                v-model="inputText"
                placeholder="输入文本、URL 或其他内容..."
                class="h-32 resize-none font-mono text-sm"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="mb-2">像素大小</Label>
                <Select v-model="qrSize">
                  <SelectTrigger>
                    <SelectValue placeholder="选择大小" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">小 (2px)</SelectItem>
                    <SelectItem value="4">中 (4px)</SelectItem>
                    <SelectItem value="6">大 (6px)</SelectItem>
                    <SelectItem value="8">超大 (8px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label class="mb-2">容错级别</Label>
                <Select v-model="errorLevel">
                  <SelectTrigger>
                    <SelectValue placeholder="选择级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L (7%)</SelectItem>
                    <SelectItem value="M">M (15%)</SelectItem>
                    <SelectItem value="Q">Q (25%)</SelectItem>
                    <SelectItem value="H">H (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button @click="generateQRCode" class="w-full">
              生成二维码
            </Button>

            <div v-if="qrCodeDataUrl" class="border-t border-gray-200 pt-4">
              <div class="flex flex-col items-center">
                <img
                  :src="qrCodeDataUrl"
                  alt="QR Code"
                  class="rounded-lg shadow-sm border border-gray-200 max-w-xs"
                  style="image-rendering: pixelated;"
                />
                <div class="flex gap-2 mt-4">
                  <Button @click="downloadQRCode" variant="default">
                    下载
                  </Button>
                  <Button @click="copyQRCode" variant="secondary">
                    复制图片
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 解析二维码 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            解析二维码
          </h3>

          <div class="space-y-4">
            <div>
              <Label class="mb-2">上传图片</Label>
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            <Button @click="pasteAndDecode" variant="secondary" class="w-full">
              从剪贴板粘贴图片
            </Button>

            <div v-if="decodeResult" class="border-t border-gray-200 pt-4">
              <Label class="mb-2">解析结果</Label>
              <div class="relative">
                <Textarea
                  :model-value="decodeResult"
                  readonly
                  class="h-40 resize-none bg-gray-50 font-mono text-sm"
                />
                <Button
                  @click="copyDecodeResult"
                  size="icon"
                  variant="ghost"
                  class="absolute top-2 right-2"
                  title="复制"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </div>
            </div>

            <div v-if="decodeError" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-sm text-red-900">{{ decodeError }}</p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p class="text-xs text-blue-900">
                <strong>提示：</strong>支持上传图片文件或从剪贴板粘贴图片进行解析
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
