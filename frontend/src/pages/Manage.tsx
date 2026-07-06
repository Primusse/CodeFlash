import { useEffect, useState } from 'react'
import type { Question } from '../types'

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
}

export default function Manage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [deleting, setDeleting] = useState('')

  const fetchQuestions = () => {
    setLoading(true)
    const params = selectedCat ? `?category=${encodeURIComponent(selectedCat)}` : ''
    fetch(`/api/questions${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || [])
        setError('')
      })
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchQuestions()
  }, [selectedCat])

  const handleDelete = async (id: string) => {
    if (!confirm(`确定删除题目 ${id} 吗？此操作不可撤销。`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json()
        setError(e.error || '删除失败')
        return
      }
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      setError('')
    } catch {
      setError('网络错误')
    } finally {
      setDeleting('')
    }
  }

  // Group by category
  const grouped: Record<string, Question[]> = {}
  for (const q of questions) {
    if (!grouped[q.category]) grouped[q.category] = []
    grouped[q.category].push(q)
  }
  const cats = Object.keys(grouped).sort()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 题目管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          查看和删除题目，共 {questions.length} 题
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedCat('')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedCat === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {cats.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCat(cat)
              setExpandedCat(cat)
            }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedCat === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat} ({grouped[cat].length})
          </button>
        ))}
      </div>

      {error && <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="text-center text-gray-400 py-8">加载中...</div>
      ) : (
        <div className="space-y-3">
          {cats.map((cat) => {
            const list = grouped[cat]
            const isExpanded = expandedCat === cat
            return (
              <div key={cat} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-700">
                    {cat} <span className="text-gray-400 font-normal">({list.length} 题)</span>
                  </span>
                  <span className="text-gray-400 text-sm">{isExpanded ? '收起 ▲' : '展开 ▼'}</span>
                </button>
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {list.map((q) => (
                      <div key={q.id} className="px-4 py-3 flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-400">{q.id}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[q.difficulty] || ''}`}>
                              {q.difficulty}
                            </span>
                            <span className="text-xs text-gray-400">{q.subcategory}</span>
                            <span className="text-xs text-gray-400">
                              {q.type === 'choice' ? '选择题' : '填空题'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 truncate">{q.question}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(q.id)}
                          disabled={deleting === q.id}
                          className="shrink-0 px-3 py-1 text-xs text-red-500 hover:text-white hover:bg-red-500 rounded-lg border border-red-200 hover:border-red-500 transition-colors"
                        >
                          {deleting === q.id ? '删除中...' : '删除'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {cats.length === 0 && (
            <div className="text-center text-gray-400 py-8">暂无题目</div>
          )}
        </div>
      )}
    </div>
  )
}
