import { useEffect, useState, useCallback } from 'react'
import type { WrongQuestion, CategoryInfo } from '../types'

export default function WrongQuestions() {
  const [questions, setQuestions] = useState<WrongQuestion[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [filter, setFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories)
      })
      .catch(() => {})
  }, [])

  // Fetch wrong questions
  const fetchQuestions = useCallback((category?: string) => {
    const params = category ? `?category=${encodeURIComponent(category)}` : ''
    fetch(`/api/wrong-questions${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || [])
      })
      .catch(() => setQuestions([]))
  }, [])

  useEffect(() => {
    fetchQuestions(filter || undefined)
  }, [filter, fetchQuestions])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">📝 错题本</h1>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === ''
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setFilter(cat.category)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat.category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name || cat.category}
          </button>
        ))}
      </div>

      {/* Questions */}
      {questions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-gray-400 text-lg">
            {filter ? '该分类暂无错题！' : '还没有错题，继续保持！'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const isExpanded = expandedId === q.id
            return (
              <div key={q.id} className="card">
                <div
                  className="cursor-pointer"
                  onClick={() => toggleExpand(q.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      错题
                    </span>
                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded font-medium">
                      {q.category}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {q.subcategory}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        q.type === 'choice'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}
                    >
                      {q.type === 'choice' ? '选择' : '填空'}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">{q.question}</p>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                    {q.type === 'choice' && q.options && (
                      <div>
                        <span className="text-gray-400">选项：</span>
                        <span className="text-gray-600">
                          {(() => {
                            try {
                              return (JSON.parse(q.options) as string[]).join(' | ')
                            } catch {
                              return q.options
                            }
                          })()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">正确答案：</span>
                      <span className="text-emerald-600 font-medium">{q.answer}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">解析：</span>
                      <span className="text-gray-600">{q.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
