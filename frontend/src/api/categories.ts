import { fetchJSON } from './client'
import type { CategoryInfo } from '../types'

/** 获取所有分类及统计信息 */
export function getCategories(): Promise<CategoryInfo[]> {
  return fetchJSON<{ categories: CategoryInfo[] }>('/categories').then((r) => r.categories)
}
