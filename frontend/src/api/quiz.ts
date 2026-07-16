import { fetchJSON } from './client'
import type { SafeQuestion, QuizBatchResponse } from '../types'

export interface StartQuizParams {
  category: string
  count: number
  type: string
}

/** 开始一组答题 */
export function startQuiz(params: StartQuizParams): Promise<{ questions: SafeQuestion[]; total: number }> {
  return fetchJSON('/quiz/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
}

export interface AnswerItem {
  question_id: string
  answer: string
}

/** 批量提交答案 */
export function submitBatch(answers: AnswerItem[]): Promise<QuizBatchResponse> {
  return fetchJSON('/quiz/submit-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
}
