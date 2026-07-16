import { fetchJSON, withQuery } from './client'
import type { Question, QuestionUpdate, CategoryMeta } from '../types'

/** 获取题目列表 */
export function listQuestions(category?: string): Promise<{ questions: Question[]; total: number }> {
  const url = withQuery('/questions', { category })
  return fetchJSON(url)
}

/** 更新题目 */
export function updateQuestion(id: string, update: QuestionUpdate): Promise<Question> {
  return fetchJSON<{ question: Question }>(`/questions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  }).then((r) => r.question)
}

/** 删除题目 */
export function deleteQuestion(id: string): Promise<boolean> {
  return fetchJSON(`/questions/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(() => true)
}

/** 批量导入题目 */
export function importQuestions(questions: Question[], defaultCategory?: string): Promise<{ imported: number; skipped: number; total: number }> {
  const url = withQuery('/questions/import', { category: defaultCategory })
  return fetchJSON(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questions),
  })
}

/** 获取所有分类元数据 */
export function getCategoryMetas(): Promise<CategoryMeta[]> {
  return fetchJSON<{ category_metas: CategoryMeta[] }>('/category-metas').then((r) => r.category_metas)
}

/** 更新分类元数据 */
export function updateCategoryMeta(key: string, meta: { name: string; icon: string }): Promise<CategoryMeta> {
  return fetchJSON<{ category_meta: CategoryMeta }>(`/category-metas/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  }).then((r) => r.category_meta)
}

/** 获取可用图标列表 */
export function getIcons(): Promise<string[]> {
  return fetchJSON<{ icons: string[] }>('/icons').then((r) => r.icons)
}
