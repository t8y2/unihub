import { ref, onMounted, toRaw } from 'vue'

export interface ClipboardItem {
  id: string
  content: string
  type: 'text' | 'url' | 'code' | 'image'
  timestamp: number
}

const DB_NAME = 'clipboard-history'
const STORE_NAME = 'items'
// 收藏独立存储，避免删除历史时误删收藏
const FAVORITES_STORE = 'favorites'
const DB_VERSION = 2

class ClipboardDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('content', 'content', { unique: false })
        }

        if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
          const store = db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('content', 'content', { unique: false })
        }
      }
    })
  }

  async getAll(): Promise<ClipboardItem[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllFavorites(): Promise<ClipboardItem[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(FAVORITES_STORE, 'readonly')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async add(item: ClipboardItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(item)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async upsertFavorite(item: ClipboardItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(FAVORITES_STORE, 'readwrite')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.put(item)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async update(item: ClipboardItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(item)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteFavorite(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(FAVORITES_STORE, 'readwrite')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getFavorite(id: string): Promise<ClipboardItem | undefined> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(FAVORITES_STORE, 'readonly')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async findByContent(content: string): Promise<ClipboardItem | undefined> {
    const items = await this.getAll()
    return items.find((item) => item.content === content)
  }

  async findFavoriteByContent(content: string): Promise<ClipboardItem | undefined> {
    const items = await this.getAllFavorites()
    return items.find((item) => item.content === content)
  }

  async clearItems(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async limitItems(maxCount: number): Promise<void> {
    const items = await this.getAll()
    const sorted = items.sort((a, b) => b.timestamp - a.timestamp)

    if (sorted.length > maxCount) {
      const toDelete = sorted.slice(maxCount)
      for (const item of toDelete) {
        await this.delete(item.id)
      }
    }
  }
}

export function useClipboardDB() {
  const db = new ClipboardDB()
  const items = ref<ClipboardItem[]>([])
  const favorites = ref<ClipboardItem[]>([])
  const isLoading = ref(true)

  const loadItems = async () => {
    try {
      items.value = await db.getAll()
      items.value.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const loadFavorites = async () => {
    try {
      favorites.value = await db.getAllFavorites()
      favorites.value.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('加载收藏失败:', error)
    }
  }

  // IndexedDB 不能持久化响应式对象，需转换为纯数据
  const normalizeItem = (item: ClipboardItem): ClipboardItem => {
    const raw = toRaw(item) as ClipboardItem
    return {
      id: raw.id,
      content: raw.content,
      type: raw.type,
      timestamp: raw.timestamp
    }
  }

  const addItem = async (item: ClipboardItem) => {
    try {
      const existing = await db.findByContent(item.content)
      if (existing) {
        existing.timestamp = Date.now()
        await db.update(existing)
        // 若该条已收藏，则同步更新时间
        const favorite = await db.getFavorite(existing.id)
        if (favorite) {
          await db.upsertFavorite({ ...favorite, ...existing })
          await loadFavorites()
        }
        await loadItems()
        return
      }

      const favoriteByContent = await db.findFavoriteByContent(item.content)
      if (favoriteByContent) {
        // 新增历史时复用已有收藏的 id，保证两边关联
        const itemToAdd = { ...item, id: favoriteByContent.id }
        await db.add(itemToAdd)
        await db.upsertFavorite({ ...favoriteByContent, ...itemToAdd })
        await db.limitItems(100)
        await loadItems()
        await loadFavorites()
        return
      }

      await db.add(item)
      await db.limitItems(100)
      await loadItems()
    } catch (error) {
      console.error('添加数据失败:', error)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await db.delete(id)
      await loadItems()
    } catch (error) {
      console.error('删除数据失败:', error)
    }
  }

  const clearUnpinned = async () => {
    try {
      await db.clearItems()
      await loadItems()
    } catch (error) {
      console.error('清空数据失败:', error)
    }
  }

  const toggleFavorite = async (item: ClipboardItem) => {
    try {
      const cleanItem = normalizeItem(item)
      const favorite = await db.getFavorite(cleanItem.id)
      if (favorite) {
        await db.deleteFavorite(cleanItem.id)
      } else {
        await db.upsertFavorite(cleanItem)
      }
      await loadFavorites()
    } catch (error) {
      console.error('更新收藏失败:', error)
    }
  }

  const removeFavorite = async (id: string) => {
    try {
      await db.deleteFavorite(id)
      await loadFavorites()
    } catch (error) {
      console.error('取消收藏失败:', error)
    }
  }

  // 旧版固定数据迁移到收藏表
  const migratePinnedToFavorites = async () => {
    if (favorites.value.length > 0) return

    const legacyFavorites = items.value.filter(
      (item) => (item as ClipboardItem & { pinned?: boolean }).pinned
    )
    if (legacyFavorites.length === 0) return

    try {
      for (const item of legacyFavorites) {
        await db.upsertFavorite(normalizeItem(item))
      }
      await loadFavorites()
    } catch (error) {
      console.error('迁移收藏失败:', error)
    }
  }

  onMounted(async () => {
    try {
      await db.init()
      await loadItems()
      await loadFavorites()
      await migratePinnedToFavorites()
    } catch (error) {
      console.error('初始化数据库失败:', error)
    } finally {
      isLoading.value = false
    }
  })

  return {
    items,
    favorites,
    isLoading,
    addItem,
    deleteItem,
    clearUnpinned,
    toggleFavorite,
    removeFavorite,
    loadItems,
    loadFavorites
  }
}
