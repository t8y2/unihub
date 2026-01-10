<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus, Plus, Download, X, Settings, Check, HelpCircle } from 'lucide-vue-next'
import imageCompression from 'browser-image-compression'
import { toast } from 'vue-sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'

interface ImageItem {
  file: File
  preview: string
  name: string
  size: number
  width: number
  height: number
  compressed?: boolean
  compressedBlob?: Blob
  compressedSize?: number
  reduction?: number
}

const fileInput = ref<HTMLInputElement>()
const images = ref<ImageItem[]>([])
const quality = ref(80)
const outputFormat = ref<string>('original')
const compressing = ref(false)
const autoDownload = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  await addImages(files)
}

const handleDrop = async (e: DragEvent) => {
  const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'))
  await addImages(files)
}

const addImages = async (files: File[]) => {
  for (const file of files) {
    // 跳过 GIF 文件
    if (file.type === 'image/gif') {
      toast.warning(`跳过 ${file.name}：不支持 GIF 动图压缩`)
      continue
    }
    
    const img = new Image()
    const preview = URL.createObjectURL(file)
    
    img.onload = () => {
      images.value.push({
        file,
        preview,
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height
      })
    }
    
    img.src = preview
  }
  
  const validCount = files.filter(f => f.type !== 'image/gif').length
  if (validCount > 0) {
    toast.success(`已添加 ${validCount} 张图片`)
  }
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(images.value[index].preview)
  images.value.splice(index, 1)
  toast.info('已移除')
}

const clearAll = () => {
  if (images.value.length === 0) {
    toast.warning('没有图片')
    return
  }
  images.value.forEach(img => URL.revokeObjectURL(img.preview))
  images.value = []
  toast.success('已清空')
}

const downloadImage = (img: ImageItem) => {
  if (!img.compressedBlob) return
  
  const ext = outputFormat.value === 'original' 
    ? img.name.split('.').pop()
    : outputFormat.value.split('/')[1]
  const fileName = img.name.replace(/\.[^.]+$/, `_compressed.${ext}`)
  
  const url = URL.createObjectURL(img.compressedBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
  
  toast.success('已下载')
}

const compressImage = async (img: ImageItem) => {
  const options: any = {
    maxSizeMB: 10,
    useWebWorker: true,
    initialQuality: quality.value / 100
  }

  if (outputFormat.value !== 'original') {
    options.fileType = outputFormat.value
  }

  const compressed = await imageCompression(img.file, options)
  
  img.compressed = true
  img.compressedBlob = compressed
  img.compressedSize = compressed.size
  img.reduction = Math.round((1 - compressed.size / img.size) * 100)

  if (autoDownload.value) {
    downloadImage(img)
  }
}

const compressAll = async () => {
  if (images.value.length === 0) {
    toast.warning('请先添加图片')
    return
  }

  compressing.value = true
  
  try {
    for (const img of images.value) {
      await compressImage(img)
    }

    toast.success('压缩完成！')
  } catch (error) {
    toast.error('压缩失败: ' + (error as Error).message)
  } finally {
    compressing.value = false
  }
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}
</script>

<template>
  <Toaster position="top-center" :duration="1500" rich-colors />
  <div class="flex-1 flex flex-col min-h-0">
    <!-- 工具栏 -->
    <div
      class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 flex-shrink-0"
    >
      <Button size="sm" @click="triggerFileInput">
        <Plus class="w-4 h-4 mr-2" />
        添加图片
      </Button>

      <Button size="sm" variant="secondary" @click="compressAll" :disabled="compressing || images.length === 0">
        <Download class="w-4 h-4 mr-2" />
        {{ compressing ? '压缩中...' : '压缩全部' }}
      </Button>

      <Button size="sm" variant="ghost" @click="clearAll">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        清空
      </Button>

      <div class="h-8 w-px bg-gray-300 mx-2"></div>

      <!-- 自动下载选项 -->
      <button
        @click="autoDownload = !autoDownload"
        class="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div
          class="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
          :class="autoDownload ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'"
        >
          <Check v-if="autoDownload" class="w-3 h-3 text-white" />
        </div>
        <span class="text-sm text-gray-600 dark:text-gray-400">自动下载</span>
      </button>

      <div class="h-8 w-px bg-gray-300 mx-2"></div>

      <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
        <Settings class="w-4 h-4 flex-shrink-0" />
        <span class="whitespace-nowrap">质量: {{ quality }}%</span>
        <input
          v-model.number="quality"
          type="range"
          min="10"
          max="100"
          class="w-32 slider-custom flex-shrink-0"
        />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">格式:</span>
        <select
          v-model="outputFormat"
          class="h-8 px-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="original">原格式</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
        </select>
      </div>

      <div class="ml-auto text-sm text-gray-600 dark:text-gray-400">
        {{ images.length }} 张图片
      </div>

      <!-- 帮助提示 -->
      <div class="relative group">
        <button class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <HelpCircle class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        
        <!-- Tooltip -->
        <div class="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div class="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p class="font-semibold text-gray-900 dark:text-gray-100 mb-2">使用说明</p>
            <ul class="list-disc list-inside space-y-1">
              <li>支持 JPG、PNG、WebP 格式（暂不支持 GIF 动图）</li>
              <li>调整质量和格式参数后点击"压缩全部"</li>
              <li>勾选"自动下载"会在压缩完成后自动下载</li>
              <li>所有处理均在浏览器本地完成，不会上传到服务器</li>
            </ul>
          </div>
          <!-- 小三角 -->
          <div class="absolute -top-2 right-3 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45"></div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 overflow-auto min-h-0">
      <!-- 空状态 - 上传区域 -->
      <div
        v-if="images.length === 0"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @click="triggerFileInput"
        class="h-full flex items-center justify-center p-8"
      >
        <div class="text-center cursor-pointer">
          <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ImagePlus class="w-12 h-12 text-gray-400 dark:text-gray-600" />
          </div>
          <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">拖拽图片到这里或点击上传</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">支持 JPG、PNG、WebP 格式，可批量上传</p>
        </div>
      </div>

      <!-- 图片网格 -->
      <div v-else class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="(img, index) in images"
            :key="index"
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <!-- 图片预览 -->
            <div class="aspect-video bg-gray-100 dark:bg-gray-900 relative group">
              <img :src="img.preview" class="w-full h-full object-contain" />
              <button
                @click="removeImage(index)"
                class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- 图片信息 -->
            <div class="p-3 space-y-2">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" :title="img.name">
                {{ img.name }}
              </p>
              <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{{ formatSize(img.size) }}</span>
                <span>{{ img.width }} × {{ img.height }}</span>
              </div>

              <!-- 压缩结果 -->
              <div v-if="img.compressed" class="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-green-600 dark:text-green-400">
                    压缩后: {{ formatSize(img.compressedSize!) }}
                  </span>
                  <span class="text-green-600 dark:text-green-400 font-medium">
                    -{{ img.reduction }}%
                  </span>
                </div>
                <Button size="sm" class="w-full" @click="downloadImage(img)">
                  <Download class="w-3 h-3 mr-1" />
                  下载
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>
