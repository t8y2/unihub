/**
 * GitHub Gist 操作封装
 * 支持插件统计数据和插件列表的存储
 */

const GIST_ID = process.env.GIST_ID!
const GIST_TOKEN = process.env.GIST_TOKEN!
const STATS_FILENAME = 'unihub-plugin-stats.json'
const PLUGINS_FILENAME = 'unihub-plugins.json'

export interface PluginStats {
  downloads: number
  ratings: { userId: string; rating: number; timestamp: string }[]
  averageRating: number
  lastUpdated: string
}

export interface StatsData {
  [pluginId: string]: PluginStats
}

/**
 * 从 GitHub Gist 获取统计数据
 */
export async function getStats(): Promise<StatsData> {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `token ${GIST_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'UniHub-Stats-API'
      },
      // 添加缓存控制
      next: { revalidate: 60 } as Record<string, unknown>
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const gist = await response.json()

    if (!gist.files[STATS_FILENAME]) {
      throw new Error('Stats file not found in gist')
    }

    const content = gist.files[STATS_FILENAME].content
    return JSON.parse(content)
  } catch (error) {
    console.error('Error fetching stats from gist:', error)
    // 返回空对象而不是抛出错误
    return {}
  }
}

/**
 * 更新 GitHub Gist 统计数据
 */
export async function updateStats(stats: StatsData): Promise<void> {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${GIST_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'UniHub-Stats-API'
      },
      body: JSON.stringify({
        files: {
          [STATS_FILENAME]: {
            content: JSON.stringify(stats, null, 2)
          }
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to update gist: ${response.status}`)
    }
  } catch (error) {
    console.error('Error updating stats in gist:', error)
    throw error
  }
}

/**
 * 从 GitHub Gist 获取插件列表
 */
export async function getPluginsList(): Promise<unknown> {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `token ${GIST_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'UniHub-Stats-API'
      },
      next: { revalidate: 60 } as Record<string, unknown>
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const gist = await response.json()

    if (!gist.files[PLUGINS_FILENAME]) {
      throw new Error('Plugins file not found in gist')
    }

    const content = gist.files[PLUGINS_FILENAME].content
    return JSON.parse(content)
  } catch (error) {
    console.error('Error fetching plugins from gist:', error)
    throw error
  }
}

/**
 * 初始化插件统计（如果不存在）
 */
export function initPluginStats(pluginId: string, stats: StatsData): void {
  if (!stats[pluginId]) {
    stats[pluginId] = {
      downloads: 0,
      ratings: [],
      averageRating: 0,
      lastUpdated: new Date().toISOString()
    }
  }
}
