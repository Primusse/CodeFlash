/**
 * 日期格式化工具
 */

/** 相对时间格式化（刚刚 / X分钟前 / X小时前 / X天前 / 具体日期） */
export function formatRelativeTime(timestamp: number): string {
  const d = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN')
}

/** 完整日期时间格式化 */
export function formatFullDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN')
}
