import { useState, useCallback } from 'react'
import type {
  CategoryInfo,
  CategoryMeta,
  SafeQuestion,
  QuizBatchResponse,
  StatsResponse,
  WrongQuestion,
  Note,
  QuestionUpdate,
  Question,
} from '../types'

const BASE = '/api'

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      return result
    } catch (e: any) {
      setError(e.message || 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getCategories = () =>
    call(async () => {
      const data = await fetchJSON<{ categories: CategoryInfo[] }>(`${BASE}/categories`)
      return data.categories
    })

  const startQuiz = (category: string, count: number, type: string) =>
    call(async () => {
      const data = await fetchJSON<{ questions: SafeQuestion[]; total: number }>(
        `${BASE}/quiz/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, count, type }),
        }
      )
      return data
    })

  const submitBatch = (answers: { question_id: string; answer: string }[]) =>
    call(async () => {
      const data = await fetchJSON<QuizBatchResponse>(
        `${BASE}/quiz/submit-batch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        }
      )
      return data
    })

  const getStats = () =>
    call(async () => {
      const data = await fetchJSON<StatsResponse>(`${BASE}/stats`)
      return data
    })

  const getWrongQuestions = (category?: string) =>
    call(async () => {
      const params = category ? `?category=${category}` : ''
      const data = await fetchJSON<{ questions: WrongQuestion[] }>(
        `${BASE}/wrong-questions${params}`
      )
      return data.questions
    })

  const resetProgress = (category?: string) =>
    call(async () => {
      const params = category ? `?category=${category}` : ''
      await fetchJSON(`${BASE}/progress${params}`, { method: 'DELETE' })
      return true
    })

  const getNotes = () =>
    call(async () => {
      const data = await fetchJSON<{ notes: Note[] }>(`${BASE}/notes`)
      return data.notes
    })

  const createNote = (note: Note) =>
    call(async () => {
      const data = await fetchJSON<{ note: Note }>(`${BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      return data.note
    })

  const updateNote = (id: string, note: Partial<Note>) =>
    call(async () => {
      const data = await fetchJSON<{ note: Note }>(`${BASE}/notes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      return data.note
    })

  const deleteNote = (id: string) =>
    call(async () => {
      await fetchJSON(`${BASE}/notes/${encodeURIComponent(id)}`, { method: 'DELETE' })
      return true
    })

  const updateQuestion = (id: string, update: QuestionUpdate) =>
    call(async () => {
      const data = await fetchJSON<{ question: Question }>(
        `${BASE}/questions/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        }
      )
      return data.question
    })

  const getCategoryMetas = () =>
    call(async () => {
      const data = await fetchJSON<{ category_metas: CategoryMeta[] }>(`${BASE}/category-metas`)
      return data.category_metas
    })

  const updateCategoryMeta = (key: string, meta: { name: string; icon: string }) =>
    call(async () => {
      const data = await fetchJSON<{ category_meta: CategoryMeta }>(
        `${BASE}/category-metas/${encodeURIComponent(key)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meta),
        }
      )
      return data.category_meta
    })

  const getIcons = () =>
    call(async () => {
      const data = await fetchJSON<{ icons: string[] }>(`${BASE}/icons`)
      return data.icons
    })

  return {
    loading,
    error,
    setError,
    getCategories,
    startQuiz,
    submitBatch,
    getStats,
    getWrongQuestions,
    resetProgress,
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    updateQuestion,
    getCategoryMetas,
    updateCategoryMeta,
    getIcons,
  }
}
