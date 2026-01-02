/**
 * GitHub Gist 操作封装
 */

const GIST_ID = process.env.GIST_ID!
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const GIST_FILENAME = 'unihub-plugin-stats.json'

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
        Authorization: `token ${GITHUB_TOKEN}`,
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

    if (!gist.files[GIST_FILENAME]) {
      throw new Error('Stats file not found in gist')
    }

    const content = gist.files[GIST_FILENAME].content
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
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'UniHub-Stats-API'
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
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
