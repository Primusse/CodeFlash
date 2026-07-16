import { useState, useCallback } from 'react'
import { getCategories } from '../api/categories'
import { startQuiz, submitBatch } from '../api/quiz'
import { getStats, getWrongQuestions, resetProgress } from '../api/stats'
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes'
import { updateQuestion, getCategoryMetas, updateCategoryMeta, getIcons } from '../api/questions'
import type { QuestionUpdate } from '../types'

/**
 * useApi - 统一管理 API 调用的 loading 和 error 状态
 * 具体 API 实现位于 src/api/ 目录，按领域拆分
 */
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** 包装异步函数，自动管理 loading/error 状态 */
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

  // ── Categories ──
  const apiGetCategories = () => call(() => getCategories())

  // ── Quiz ──
  const apiStartQuiz = (category: string, count: number, type: string) =>
    call(() => startQuiz({ category, count, type }))

  const apiSubmitBatch = (answers: { question_id: string; answer: string }[]) =>
    call(() => submitBatch(answers))

  // ── Stats / Progress / Wrong Questions ──
  const apiGetStats = () => call(() => getStats())

  const apiGetWrongQuestions = (category?: string) =>
    call(() => getWrongQuestions(category))

  const apiResetProgress = (category?: string) =>
    call(() => resetProgress(category))

  // ── Notes ──
  const apiGetNotes = () => call(() => getNotes())

  const apiCreateNote = (note: Parameters<typeof createNote>[0]) =>
    call(() => createNote(note))

  const apiUpdateNote = (id: string, note: Parameters<typeof updateNote>[1]) =>
    call(() => updateNote(id, note))

  const apiDeleteNote = (id: string) => call(() => deleteNote(id))

  // ── Question Management ──
  const apiUpdateQuestion = (id: string, update: QuestionUpdate) =>
    call(() => updateQuestion(id, update))

  // ── Category Meta ──
  const apiGetCategoryMetas = () => call(() => getCategoryMetas())

  const apiUpdateCategoryMeta = (key: string, meta: { name: string; icon: string }) =>
    call(() => updateCategoryMeta(key, meta))

  const apiGetIcons = () => call(() => getIcons())

  return {
    loading,
    error,
    setError,
    // 保持与旧版一致的方法名
    getCategories: apiGetCategories,
    startQuiz: apiStartQuiz,
    submitBatch: apiSubmitBatch,
    getStats: apiGetStats,
    getWrongQuestions: apiGetWrongQuestions,
    resetProgress: apiResetProgress,
    getNotes: apiGetNotes,
    createNote: apiCreateNote,
    updateNote: apiUpdateNote,
    deleteNote: apiDeleteNote,
    updateQuestion: apiUpdateQuestion,
    getCategoryMetas: apiGetCategoryMetas,
    updateCategoryMeta: apiUpdateCategoryMeta,
    getIcons: apiGetIcons,
  }
}
