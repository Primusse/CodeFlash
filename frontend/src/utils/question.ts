/**
 * 题目相关工具函数
 */

/** 安全解析选项 JSON，解析失败返回空数组 */
export function parseOptions(optionsStr: string): string[] {
  try {
    const parsed = JSON.parse(optionsStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** 选项转显示字符串（用 | 分隔） */
export function optionsToString(optionsStr: string): string {
  const opts = parseOptions(optionsStr)
  return opts.length > 0 ? opts.join(' | ') : optionsStr
}

/** 难度标签显示 */
export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return difficulty
  }
}

/** 难度对应的 Tailwind 颜色类 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-600'
    case 'medium':
      return 'bg-yellow-100 text-yellow-600'
    case 'hard':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

/** 题型标签显示 */
export function getTypeLabel(type: string): string {
  return type === 'choice' ? '选择' : type === 'fill' ? '填空' : type
}

/** 题型对应的颜色类 */
export function getTypeColor(type: string): string {
  return type === 'choice' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
}
