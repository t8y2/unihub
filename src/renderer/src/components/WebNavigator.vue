<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface Website {
  id: string
  name: string
  url: string
  icon?: string
  category?: string
  addedAt: number
  faviconDataUrl?: string // 缓存的 favicon data URL
}

const websites = ref<Website[]>([])
const showAddDialog = ref(false)
const editingWebsite = ref<Website | null>(null)
const isEditMode = ref(false) // 编辑模式
const isLoading = ref(false) // 加载状态
const showDeleteDialog = ref(false) // 删除确认对话框
const deletingWebsite = ref<Website | null>(null) // 待删除的网站

const newWebsite = ref({
  name: '',
  url: '',
  icon: '',
  category: ''
})

const searchQuery = ref('')
const selectedCategory = ref<string>('all')

// 加载网站列表
const loadWebsites = async (): Promise<void> => {
  try {
    // 内置插件使用 localStorage 而不是 unihub.db
    const data = localStorage.getItem('web-navigator-sites')
    if (data) {
      websites.value = JSON.parse(data) as Website[]
    }
  } catch (error) {
    console.error('加载网站列表失败:', error)
  }
}

// 保存网站列表
const saveWebsites = async (): Promise<void> => {
  try {
    // 内置插件使用 localStorage
    localStorage.setItem('web-navigator-sites', JSON.stringify(websites.value))
  } catch (error) {
    console.error('保存网站列表失败:', error)
  }
}

// 打开网站
const openWebsite = async (url: string): Promise<void> => {
  try {
    await window.unihub.system.openExternal(url)
  } catch (error) {
    console.error('打开网站失败:', error)
    alert('打开网站失败')
  }
}

// 添加或更新网站
const saveWebsite = async (): Promise<void> => {
  if (!newWebsite.value.url.trim()) {
    alert('请填写网站地址')
    return
  }

  isLoading.value = true

  try {
    // 确保 URL 格式正确
    let url = newWebsite.value.url.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    // 如果没有名称，尝试获取网站标题
    let name = newWebsite.value.name.trim()
    if (!name) {
      name = await fetchWebsiteTitle(url)
    }

    if (editingWebsite.value) {
      // 更新现有网站
      const index = websites.value.findIndex((w) => w.id === editingWebsite.value!.id)
      if (index !== -1) {
        websites.value[index] = {
          ...editingWebsite.value,
          name: name,
          url: url,
          icon: newWebsite.value.icon.trim() || undefined,
          category: newWebsite.value.category.trim() || undefined
        }
      }
    } else {
      // 添加新网站
      const website: Website = {
        id: Date.now().toString(),
        name: name,
        url: url,
        icon: newWebsite.value.icon.trim() || undefined,
        category: newWebsite.value.category.trim() || undefined,
        addedAt: Date.now()
      }
      websites.value.unshift(website)
    }

    await saveWebsites()
    closeDialog()

    // 如果是新添加的网站且没有自定义图标，尝试获取 favicon
    if (!editingWebsite.value && !newWebsite.value.icon.trim()) {
      const addedWebsite = websites.value[0]
      if (addedWebsite) {
        fetchFavicon(addedWebsite)
      }
    }
  } finally {
    isLoading.value = false
  }
}

// 打开删除确认对话框
const confirmDelete = (website: Website): void => {
  deletingWebsite.value = website
  showDeleteDialog.value = true
}

// 删除网站
const deleteWebsite = async (): Promise<void> => {
  if (!deletingWebsite.value) return

  websites.value = websites.value.filter((w) => w.id !== deletingWebsite.value!.id)
  await saveWebsites()

  showDeleteDialog.value = false
  deletingWebsite.value = null
}

// 打开添加对话框
const openAddDialog = (): void => {
  editingWebsite.value = null
  newWebsite.value = {
    name: '',
    url: '',
    icon: '',
    category: ''
  }
  showAddDialog.value = true
}

// 打开编辑对话框
const openEditDialog = (website: Website): void => {
  editingWebsite.value = website
  newWebsite.value = {
    name: website.name,
    url: website.url,
    icon: website.icon || '',
    category: website.category || ''
  }
  showAddDialog.value = true
}

// 关闭对话框
const closeDialog = (): void => {
  showAddDialog.value = false
  editingWebsite.value = null
  newWebsite.value = {
    name: '',
    url: '',
    icon: '',
    category: ''
  }
}

// 获取所有分类
const categories = ref<string[]>([])
const updateCategories = (): void => {
  const cats = new Set<string>()
  websites.value.forEach((w) => {
    if (w.category) cats.add(w.category)
  })
  categories.value = Array.from(cats).sort()
}

// 过滤网站
const filteredWebsites = ref<Website[]>([])
const filterWebsites = (): void => {
  let result = websites.value

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    result = result.filter((w) => w.category === selectedCategory.value)
  }

  // 按搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (w) =>
        w.name.toLowerCase().includes(query) ||
        w.url.toLowerCase().includes(query) ||
        (w.category && w.category.toLowerCase().includes(query))
    )
  }

  filteredWebsites.value = result
}

// 获取网站标题
const fetchWebsiteTitle = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    const html = await response.text()

    // 提取 title 标签内容
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim()
      // 截取前3个字符
      return title.substring(0, 3)
    }
  } catch (error) {
    console.error('获取网站标题失败:', error)
  }

  // 如果获取失败，使用域名前3个字符
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace('www.', '')
    return hostname.substring(0, 3).toUpperCase()
  } catch {
    return url.substring(0, 3).toUpperCase()
  }
}

// 获取网站名称（如果没有名称，显示域名前3个字符）
const getWebsiteName = (website: Website): string => {
  if (website.name) return website.name

  try {
    const url = new URL(website.url)
    const hostname = url.hostname.replace('www.', '')
    return hostname.substring(0, 3).toUpperCase()
  } catch {
    return website.url.substring(0, 3).toUpperCase()
  }
}

// 获取网站图标
const getWebsiteIcon = (website: Website): string => {
  // 优先使用用户提供的图标
  if (website.icon) return website.icon
  // 其次使用缓存的 favicon
  if (website.faviconDataUrl) return website.faviconDataUrl
  // 最后尝试从 Google 获取
  try {
    const url = new URL(website.url)
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`
  } catch {
    return ''
  }
}

// 获取并缓存 favicon
const fetchFavicon = async (website: Website): Promise<void> => {
  if (website.icon || website.faviconDataUrl) return

  try {
    const url = new URL(website.url)
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`

    // 直接使用 fetch（会通过 Electron 的网络层）
    const response = await fetch(faviconUrl)

    if (response.ok) {
      const blob = await response.blob()

      // 转换为 data URL
      const reader = new FileReader()
      reader.onloadend = async () => {
        const dataUrl = reader.result as string

        // 更新网站数据
        const index = websites.value.findIndex((w) => w.id === website.id)
        if (index !== -1) {
          websites.value[index].faviconDataUrl = dataUrl
          await saveWebsites()
        }
      }
      reader.readAsDataURL(blob)
    }
  } catch (error) {
    console.error('获取 favicon 失败:', error)
  }
}

// 根据网站名称生成一致的渐变色
const getGradientColor = (name: string): string => {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-yellow-500 to-orange-600',
    'from-purple-500 to-pink-600',
    'from-teal-500 to-green-600',
    'from-red-500 to-pink-600',
    'from-cyan-500 to-blue-600'
  ]

  // 使用名称的字符码生成一致的索引
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

// 批量获取 favicon
const fetchAllFavicons = async (): Promise<void> => {
  const promises = websites.value
    .filter((w) => !w.icon && !w.faviconDataUrl)
    .map((w) => fetchFavicon(w))

  await Promise.allSettled(promises)
}

// 监听数据变化
const updateData = (): void => {
  updateCategories()
  filterWebsites()
}

onMounted(async () => {
  await loadWebsites()
  updateData()
  // 异步获取所有 favicon
  fetchAllFavicons()

  // 监听 ESC 键退出编辑模式
  window.addEventListener('keydown', handleKeyDown)
})

// 清理事件监听
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape' && isEditMode.value) {
    isEditMode.value = false
  }
}

// 监听变化
const handleWebsitesChange = (): void => {
  updateData()
}

// 使用 watch 替代直接监听
import { watch } from 'vue'
watch([websites, searchQuery, selectedCategory], () => {
  handleWebsitesChange()
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-800">
    <!-- 顶部工具栏 -->
    <div
      class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-3 flex-shrink-0"
    >
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">网站导航</h2>

      <div class="flex-1 max-w-md">
        <Input v-model="searchQuery" placeholder="搜索网站..." class="h-9" />
      </div>

      <Button @click="openAddDialog">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        添加网站
      </Button>

      <Button
        variant="ghost"
        size="icon"
        :class="{ 'bg-blue-100 dark:bg-blue-900': isEditMode }"
        @click="isEditMode = !isEditMode"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </Button>
    </div>

    <!-- 分类筛选 -->
    <div
      v-if="categories.length > 0"
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0"
    >
      <Button
        size="sm"
        :variant="selectedCategory === 'all' ? 'default' : 'ghost'"
        @click="selectedCategory = 'all'"
      >
        全部
      </Button>
      <Button
        v-for="cat in categories"
        :key="cat"
        size="sm"
        :variant="selectedCategory === cat ? 'default' : 'ghost'"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </Button>
    </div>

    <!-- 网站列表 -->
    <div class="flex-1 overflow-auto p-6">
      <div v-if="filteredWebsites.length === 0" class="text-center py-12">
        <svg
          class="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          {{ searchQuery ? '没有找到匹配的网站' : '还没有添加任何网站' }}
        </p>
        <Button v-if="!searchQuery" @click="openAddDialog">添加第一个网站</Button>
      </div>

      <div
        v-else
        class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-3"
      >
        <div
          v-for="website in filteredWebsites"
          :key="website.id"
          class="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer aspect-square flex flex-col"
          @click="!isEditMode && openWebsite(website.url)"
        >
          <!-- 编辑模式下的操作按钮 -->
          <div
            v-if="isEditMode"
            class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center gap-2 z-10"
          >
            <Button
              size="icon"
              variant="default"
              class="h-8 w-8"
              @click.stop="openEditDialog(website)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Button>
            <Button
              size="icon"
              variant="destructive"
              class="h-8 w-8"
              @click.stop="confirmDelete(website)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          </div>

          <!-- 网站内容 -->
          <div class="flex-1 flex flex-col items-center justify-center text-center p-3">
            <!-- 网站图标 -->
            <div
              class="w-12 h-12 mb-2 rounded-lg flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0"
              :class="
                getWebsiteIcon(website)
                  ? 'bg-white dark:bg-gray-700'
                  : `bg-gradient-to-br ${getGradientColor(website.name)}`
              "
            >
              <img
                v-if="getWebsiteIcon(website)"
                :src="getWebsiteIcon(website)"
                :alt="website.name"
                class="w-full h-full object-cover"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <div v-else class="text-white text-lg font-bold">
                {{ website.name.charAt(0).toUpperCase() }}
              </div>
            </div>

            <!-- 网站名称 -->
            <h3 class="font-medium text-xs text-gray-900 dark:text-gray-100 line-clamp-2 w-full">
              {{ getWebsiteName(website) }}
            </h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <Dialog :open="showAddDialog" @update:open="(val) => !val && closeDialog()">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingWebsite ? '编辑网站' : '添加网站' }}</DialogTitle>
          <DialogDescription>
            {{ editingWebsite ? '修改网站信息' : '添加一个常用网站到导航' }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div>
            <Label class="mb-2">网站名称（可选）</Label>
            <Input
              v-model="newWebsite.name"
              placeholder="留空将自动截取网站标题前3个字符"
              @keyup.enter="saveWebsite"
            />
          </div>

          <div>
            <Label class="mb-2">网站地址 *</Label>
            <Input
              v-model="newWebsite.url"
              placeholder="例如：github.com"
              @keyup.enter="saveWebsite"
            />
          </div>

          <div>
            <Label class="mb-2">图标地址（可选）</Label>
            <Input
              v-model="newWebsite.icon"
              placeholder="支持 https:// 或 data:image/ 格式"
              @keyup.enter="saveWebsite"
            />
            <p class="text-xs text-gray-500 mt-1">留空将显示网站名称首字母</p>
          </div>

          <div>
            <Label class="mb-2">分类（可选）</Label>
            <Input
              v-model="newWebsite.category"
              placeholder="例如：开发工具"
              @keyup.enter="saveWebsite"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" :disabled="isLoading" @click="closeDialog">取消</Button>
          <Button :disabled="isLoading" @click="saveWebsite">
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isLoading ? '处理中...' : editingWebsite ? '保存' : '添加' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog :open="showDeleteDialog" @update:open="(val) => !val && (showDeleteDialog = false)">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription v-if="deletingWebsite">
            确定要删除网站 "{{ deletingWebsite.name || getWebsiteName(deletingWebsite) }}"
            吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" @click="showDeleteDialog = false">取消</Button>
          <Button variant="destructive" @click="deleteWebsite">删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
