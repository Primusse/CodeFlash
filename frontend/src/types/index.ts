export interface CategoryInfo {
  category: string
  name: string
  icon: string
  total_count: number
  choice_count: number
  fill_count: number
  answered_count: number
  correct_count: number
}

export interface CategoryMeta {
  key: string
  name: string
  icon: string
}

export interface QuestionUpdate {
  question?: string
  subcategory?: string
  difficulty?: string
  type?: string
  options?: string
  answer?: string
  explanation?: string
  category?: string
}

export interface SafeQuestion {
  id: string
  category: string
  subcategory: string
  type: 'choice' | 'fill'
  difficulty: string
  question: string
  options: string
}

export interface QuizResult {
  correct: boolean
  answer: string
  explain: string
}

export interface BatchResult {
  question_id: string
  correct: boolean
  your_answer: string
  answer: string
  explanation: string
}

export interface QuizBatchResponse {
  results: BatchResult[]
  correct: number
  total: number
  accuracy: number
}

export interface CategoryStats {
  category: string
  total: number
  correct: number
  wrong: number
  progress_pct: number
}

export interface StatsResponse {
  total_answered: number
  total_correct: number
  accuracy: number
  categories: CategoryStats[]
}

export interface Question {
  id: string
  category: string
  subcategory: string
  type: string
  difficulty: string
  question: string
  options: string
  answer: string
  explanation: string
}

export interface Note {
  id: string
  title: string
  tags: string
  content: string
  created_at: number
  updated_at: number
}

export interface WrongQuestion {
  id: string
  category: string
  subcategory: string
  type: string
  difficulty: string
  question: string
  options: string
  answer: string
  explanation: string
}
