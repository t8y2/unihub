<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useToast } from '@/composables/useToast'
import Toast from '@/components/Toast.vue'
import DateTimePicker from '@/components/DateTimePicker.vue'
import {
  Plus,
  Check,
  Trash2,
  Star,
  Calendar,
  List,
  CheckCircle2,
  Flag,
  Search,
  X
} from 'lucide-vue-next'

const { success, warning, info } = useToast()

// 类型定义
interface Todo {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  dueDate?: string
  createdAt: string
  notes?: string
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

// 默认分类
const defaultCategories: Category[] = [
  { id: 'all', name: '全部', color: '#007AFF', icon: 'list' },
  { id: 'today', name: '今天', color: '#FF9500', icon: 'calendar' },
  { id: 'important', name: '重要', color: '#FF3B30', icon: 'star' },
  { id: 'completed', name: '已完成', color: '#34C759', icon: 'check-circle' }
]

// 状态管理
const todos = useStorage<Todo[]>('todolist-todos', [])
const categories = useStorage<Category[]>('todolist-categories', defaultCategories)
const currentCategory = ref('all')
const searchQuery = ref('')
const newTodoTitle = ref('')
const newTodoPriority = ref<'low' | 'medium' | 'high'>('medium')
const newTodoDueDate = ref('')
const showCompleted = ref(true)

// 计算属性
const filteredTodos = computed(() => {
  let filtered = todos.value

  // 按分类筛选
  if (currentCategory.value === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    filtered = filtered.filter((todo) => todo.dueDate === todayStr)
  } else if (currentCategory.value === 'important') {
    filtered = filtered.filter((todo) => todo.priority === 'high')
  } else if (currentCategory.value === 'completed') {
    filtered = filtered.filter((todo) => todo.completed)
  }

  // 搜索筛选
  if (searchQuery.value) {
    filtered = filtered.filter((todo) =>
      todo.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 是否显示已完成
  if (!showCompleted.value && currentCategory.value !== 'completed') {
    filtered = filtered.filter((todo) => !todo.completed)
  }

  // 排序：未完成在前，按优先级和创建时间
  return filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter((t) => t.completed).length
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  const todayCount = todos.value.filter((t) => t.dueDate === todayStr).length
  const important = todos.value.filter((t) => t.priority === 'high').length
  return { total, completed, today: todayCount, important }
})

const currentCategoryInfo = computed(() => {
  return categories.value.find((c) => c.id === currentCategory.value) || categories.value[0]
})

// 方法
const addTodo = (): void => {
  if (!newTodoTitle.value.trim()) {
    warning('请输入待办事项')
    return
  }

  const todo: Todo = {
    id: Date.now().toString(),
    title: newTodoTitle.value.trim(),
    completed: false,
    priority: newTodoPriority.value,
    category: currentCategory.value === 'all' ? 'personal' : currentCategory.value,
    createdAt: new Date().toISOString(),
    dueDate: newTodoDueDate.value
  }

  todos.value.unshift(todo)
  newTodoTitle.value = ''
  newTodoPriority.value = 'medium'
  newTodoDueDate.value = ''
}

const toggleTodo = (id: string): void => {
  const todo = todos.value.find((t) => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    if (todo.completed) {
      success('已完成！')
    }
  }
}

const deleteTodo = (id: string): void => {
  const index = todos.value.findIndex((t) => t.id === id)
  if (index !== -1) {
    todos.value.splice(index, 1)
    success('已删除')
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const setPriority = (id: string, priority: 'low' | 'medium' | 'high'): void => {
  const todo = todos.value.find((t) => t.id === id)
  if (todo) {
    todo.priority = priority
  }
}

const clearCompleted = (): void => {
  const count = todos.value.filter((t) => t.completed).length
  if (count === 0) {
    info('没有已完成的待办事项')
    return
  }
  todos.value = todos.value.filter((t) => !t.completed)
  success(`已清除 ${count} 个已完成事项`)
}

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'low':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}

const getPriorityBg = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-50 dark:bg-red-950/30'
    case 'medium':
      return 'bg-yellow-50 dark:bg-yellow-950/30'
    case 'low':
      return 'bg-blue-50 dark:bg-blue-950/30'
    default:
      return 'bg-gray-50 dark:bg-gray-950/30'
  }
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return ''
  const [datePart, timePart] = dateStr.split('T')
  const date = new Date(datePart)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateToCheck = new Date(date)
  dateToCheck.setHours(0, 0, 0, 0)

  let dateText = ''
  if (dateToCheck.getTime() === today.getTime()) dateText = '今天'
  else if (dateToCheck.getTime() === tomorrow.getTime()) dateText = '明天'
  else {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (dateToCheck.getTime() === yesterday.getTime()) dateText = '昨天'
    else dateText = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return timePart ? `${dateText} ${timePart}` : dateText
}
</script>

<template>
  <Toast />

  <div class="flex h-full bg-background">
    <!-- 侧边栏 -->
    <div class="w-52 bg-card border-r border-border flex flex-col flex-shrink-0">
      <!-- 侧边栏头部 -->
      <div class="h-14 px-4 border-b border-border flex items-center flex-shrink-0">
        <h1 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 :size="20" class="text-primary" />
          待办清单
        </h1>
      </div>

      <!-- 分类列表 -->
      <div class="flex-1 overflow-y-auto p-3">
        <div class="space-y-0.5">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="[
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm',
              currentCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-accent text-foreground'
            ]"
            @click="currentCategory = category.id"
          >
            <component
              :is="
                category.icon === 'list'
                  ? List
                  : category.icon === 'calendar'
                    ? Calendar
                    : category.icon === 'star'
                      ? Star
                      : CheckCircle2
              "
              :size="16"
            />
            <span class="flex-1 text-left font-medium">{{ category.name }}</span>
            <span
              class="text-xs font-semibold tabular-nums min-w-[20px] text-right"
              :class="
                currentCategory === category.id
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground'
              "
            >
              {{
                category.id === 'all'
                  ? stats.total
                  : category.id === 'today'
                    ? stats.today
                    : category.id === 'important'
                      ? stats.important
                      : stats.completed
              }}
            </span>
          </button>
        </div>
      </div>

      <!-- 侧边栏底部 -->
      <div class="p-3 border-t border-border">
        <button
          class="w-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          @click="clearCompleted"
        >
          清除已完成
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 头部工具栏 -->
      <div class="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <h2 class="text-base font-semibold text-foreground">
          {{ currentCategoryInfo.name }}
        </h2>

        <div class="flex-1"></div>

        <!-- 搜索框 -->
        <div class="relative w-56">
          <Search
            :size="14"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索待办..."
            class="w-full h-8 pl-8 pr-8 bg-input border-0 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            @click="searchQuery = ''"
          >
            <X :size="14" />
          </button>
        </div>

        <!-- 显示已完成切换 -->
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input
            v-model="showCompleted"
            type="checkbox"
            class="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary"
          />
          <span class="text-xs text-muted-foreground">显示已完成</span>
        </label>
      </div>

      <!-- 添加待办 -->
      <div class="bg-card border-b border-border p-4 flex-shrink-0">
        <div class="flex gap-2 mb-2">
          <input
            v-model="newTodoTitle"
            type="text"
            placeholder="添加新的待办事项..."
            class="flex-1 h-9 px-3 bg-input border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            @keyup.enter="addTodo"
          />

          <button
            class="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
            @click="addTodo"
          >
            <Plus :size="16" />
            添加
          </button>
        </div>

        <div class="flex gap-2 items-center">
          <!-- 日期时间选择 -->
          <DateTimePicker v-model="newTodoDueDate" />

          <!-- 优先级选择 -->
          <div class="flex items-center gap-1.5">
            <Flag :size="14" class="text-muted-foreground" />
            <div class="flex gap-0.5 bg-input rounded-md p-0.5">
              <button
                :class="[
                  'px-2 py-1 rounded text-xs transition-colors',
                  newTodoPriority === 'low'
                    ? 'bg-blue-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
                title="低优先级"
                @click="newTodoPriority = 'low'"
              >
                低
              </button>
              <button
                :class="[
                  'px-2 py-1 rounded text-xs transition-colors',
                  newTodoPriority === 'medium'
                    ? 'bg-yellow-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
                title="中优先级"
                @click="newTodoPriority = 'medium'"
              >
                中
              </button>
              <button
                :class="[
                  'px-2 py-1 rounded text-xs transition-colors',
                  newTodoPriority === 'high'
                    ? 'bg-red-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
                title="高优先级"
                @click="newTodoPriority = 'high'"
              >
                高
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 待办列表 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="filteredTodos.length === 0" class="text-center py-12">
          <CheckCircle2 :size="48" class="mx-auto text-muted-foreground/30 mb-3" />
          <p class="text-sm text-muted-foreground">
            {{ searchQuery ? '没有找到匹配的待办事项' : '暂无待办事项' }}
          </p>
        </div>

        <div v-else class="space-y-1.5">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            :class="[
              'group bg-card border border-border rounded-lg p-3 transition-all duration-200 hover:shadow-sm',
              todo.completed && 'opacity-60'
            ]"
          >
            <div class="flex items-start gap-2.5">
              <!-- 复选框 -->
              <button
                :class="[
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center mt-0.5',
                  todo.completed
                    ? 'bg-primary border-primary'
                    : 'border-border hover:border-primary'
                ]"
                @click="toggleTodo(todo.id)"
              >
                <Check v-if="todo.completed" :size="12" class="text-primary-foreground checkmark" />
              </button>

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start gap-2">
                  <h3
                    :class="[
                      'flex-1 text-sm font-medium',
                      todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    ]"
                  >
                    {{ todo.title }}
                  </h3>

                  <!-- 优先级标记 -->
                  <div
                    :class="[
                      'flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium',
                      getPriorityBg(todo.priority),
                      getPriorityColor(todo.priority)
                    ]"
                  >
                    {{ todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低' }}
                  </div>
                </div>

                <!-- 元信息 -->
                <div
                  v-if="todo.dueDate"
                  class="flex items-center gap-1 mt-1 text-xs text-muted-foreground"
                >
                  <Calendar :size="12" />
                  <span>{{ formatDate(todo.dueDate) }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div
                class="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  class="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="删除"
                  @click="deleteTodo(todo.id)"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
