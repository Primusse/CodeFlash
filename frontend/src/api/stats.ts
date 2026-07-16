import { fetchJSON, withQuery } from './client'
import type { StatsResponse, CategoryStats, WrongQuestion } from '../types'

/** 获取全局统计数据 */
export function getStats(): Promise<StatsResponse> {
  return fetchJSON('/stats')
}

/** 获取各分类答题进度 */
export function getProgress(): Promise<CategoryStats[]> {
  return fetchJSON<{ categories: CategoryStats[] }>('/progress').then((r) => r.categories)
}

/** 获取错题列表 */
export function getWrongQuestions(category?: string): Promise<WrongQuestion[]> {
  const url = withQuery('/wrong-questions', { category })
  return fetchJSON<{ questions: WrongQuestion[] }>(url).then((r) => r.questions)
}

/** 重置答题进度 */
export function resetProgress(category?: string): Promise<boolean> {
  const url = withQuery('/progress', { category })
  return fetchJSON(url, { method: 'DELETE' }).then(() => true)
}
