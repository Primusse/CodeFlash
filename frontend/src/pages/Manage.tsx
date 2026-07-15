import { useEffect, useState } from 'react'
import type { Question, CategoryMeta } from '../types'

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
}

const DIFFICULTIES = ['easy', 'medium', 'hard']
const TYPES = ['choice', 'fill']
const AVAILABLE_ICONS = [
  '☕', '🐹', '🤖', '🐳', '🐍', '💻', '🎯', '🔧',
  '⚙️', '🚀', '💡', '📦', '🗄️', '🌐', '🔒', '🛡️',
  '📊', '🎨', '🧩', '🔬', '📱', '🖥️', '🗃️', '⚛️',
  '🦀', '🐘', '🍃', '🔥', '☁️', '🏗️', '📝', '🧪',
  '⭐', '🎮', '🧠', '💾', '🔗', '📡', '🛠️', '🌀',
  '📋', '✅', '🎵', '🧰', '🪄', '🎪', '🔮', '💎',
]

export default function Manage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [deleting, setDeleting] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Question | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // Category meta editing
  const [editingMetaKey, setEditingMetaKey] = useState<string | null>(null)
  const [metaForm, setMetaForm] = useState<CategoryMeta | null>(null)
  const [savingMeta, setSavingMeta] = useState(false)
  const [categoryMetas, setCategoryMetas] = useState<CategoryMeta[]>([])
  const [showIconPicker, setShowIconPicker] = useState(false)

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

  const fetchCategoryMetas = () => {
    fetch('/api/category-metas')
      .then((r) => r.json())
      .then((data) => setCategoryMetas(data.category_metas || []))
      .catch(() => {})
  }

  useEffect(() => {
    fetchQuestions()
    fetchCategoryMetas()
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

  // ── Question editing ──
  const startEdit = (q: Question) => {
    setEditingId(q.id)
    setEditForm({ ...q })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEdit = async () => {
    if (!editForm || !editingId) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(editingId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: editForm.question,
          subcategory: editForm.subcategory,
          difficulty: editForm.difficulty,
          type: editForm.type,
          options: editForm.options,
          answer: editForm.answer,
          explanation: editForm.explanation,
          category: editForm.category,
        }),
      })
      if (!res.ok) {
        const e = await res.json()
        setError(e.error || '更新失败')
        return
      }
      const data = await res.json()
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? data.question : q)))
      cancelEdit()
      setError('')
    } catch {
      setError('网络错误')
    } finally {
      setSavingEdit(false)
    }
  }

  // ── Category meta editing ──
  const startMetaEdit = (catKey: string) => {
    const existing = categoryMetas.find((m) => m.key === catKey)
    setEditingMetaKey(catKey)
    setMetaForm(existing || { key: catKey, name: catKey, icon: '📦' })
    setShowIconPicker(false)
  }

  const cancelMetaEdit = () => {
    setEditingMetaKey(null)
    setMetaForm(null)
    setShowIconPicker(false)
  }

  const saveMeta = async () => {
    if (!metaForm || !editingMetaKey) return
    setSavingMeta(true)
    try {
      const res = await fetch(`/api/category-metas/${encodeURIComponent(editingMetaKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: metaForm.name, icon: metaForm.icon }),
      })
      if (!res.ok) {
        const e = await res.json()
        setError(e.error || '更新失败')
        return
      }
      const data = await res.json()
      setCategoryMetas((prev) => {
        const idx = prev.findIndex((m) => m.key === editingMetaKey)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = data.category_meta
          return copy
        }
        return [...prev, data.category_meta]
      })
      cancelMetaEdit()
      setError('')
    } catch {
      setError('网络错误')
    } finally {
      setSavingMeta(false)
    }
  }

  const getMetaForCategory = (key: string): CategoryMeta => {
    const db = categoryMetas.find((m) => m.key === key)
    if (db) return db
    // Fallback defaults
    const defaults: Record<string, CategoryMeta> = {
      java: { key: 'java', name: 'Java 后端开发', icon: '☕' },
      golang: { key: 'golang', name: 'Go 后端开发', icon: '🐹' },
      agent: { key: 'agent', name: 'AI Agent 开发', icon: '🤖' },
      docker: { key: 'docker', name: 'Docker 容器技术', icon: '🐳' },
    }
    return defaults[key] || { key, name: key, icon: '📦' }
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
          查看、编辑和删除题目，共 {questions.length} 题
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
        {cats.map((cat) => {
          const meta = getMetaForCategory(cat)
          return (
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
              {meta.icon} {meta.name} ({grouped[cat].length})
            </button>
          )
        })}
      </div>

      {error && <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="text-center text-gray-400 py-8">加载中...</div>
      ) : (
        <div className="space-y-3">
          {cats.map((cat) => {
            const list = grouped[cat]
            const isExpanded = expandedCat === cat
            const meta = getMetaForCategory(cat)
            const isEditingMeta = editingMetaKey === cat

            return (
              <div key={cat} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Category header */}
                <div className="w-full flex items-center justify-between px-4 py-3 bg-gray-50">
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : cat)}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    <span className="text-lg">{meta.icon}</span>
                    <span>{meta.name}</span>
                    <span className="text-gray-400 font-normal">({list.length} 题)</span>
                    <span className="text-gray-400 text-sm ml-1">{isExpanded ? '▲' : '▼'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startMetaEdit(cat)
                    }}
                    className="text-xs text-gray-400 hover:text-primary-600 transition-colors px-2 py-1 rounded hover:bg-gray-200"
                    title="编辑分类名称和图标"
                  >
                    ✏️ 编辑分类
                  </button>
                </div>

                {/* Category meta edit form */}
                {isEditingMeta && metaForm && (
                  <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 space-y-3">
                    <div className="flex items-center gap-3">
                      {/* Icon picker */}
                      <div className="relative">
                        <button
                          onClick={() => setShowIconPicker(!showIconPicker)}
                          className="w-12 h-12 text-2xl flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:border-primary-400 transition-colors"
                        >
                          {metaForm.icon}
                        </button>
                        {showIconPicker && (
                          <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-72">
                            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                              {AVAILABLE_ICONS.map((icon) => (
                                <button
                                  key={icon}
                                  onClick={() => {
                                    setMetaForm({ ...metaForm, icon })
                                    setShowIconPicker(false)
                                  }}
                                  className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors ${
                                    metaForm.icon === icon ? 'bg-primary-100 ring-2 ring-primary-400' : ''
                                  }`}
                                >
                                  {icon}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={metaForm.name}
                          onChange={(e) => setMetaForm({ ...metaForm, name: e.target.value })}
                          placeholder="分类名称"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <button
                        onClick={saveMeta}
                        disabled={savingMeta}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        {savingMeta ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={cancelMetaEdit}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {list.map((q) => {
                      const isEditing = editingId === q.id
                      return (
                        <div key={q.id} className="px-4 py-3">
                          {isEditing && editForm ? (
                            /* ── Edit form ── */
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono text-gray-400">{q.id}</span>
                                <select
                                  value={editForm.difficulty}
                                  onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                                  className="text-xs px-2 py-1 rounded border border-gray-200"
                                >
                                  {DIFFICULTIES.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={editForm.subcategory}
                                  onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                                  placeholder="子分类"
                                  className="text-xs px-2 py-1 rounded border border-gray-200 w-24"
                                />
                                <select
                                  value={editForm.type}
                                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                  className="text-xs px-2 py-1 rounded border border-gray-200"
                                >
                                  {TYPES.map((t) => (
                                    <option key={t} value={t}>{t === 'choice' ? '选择题' : '填空题'}</option>
                                  ))}
                                </select>
                              </div>
                              <input
                                type="text"
                                value={editForm.question}
                                onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                                placeholder="题目内容"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                autoFocus
                              />
                              {editForm.type === 'choice' && (
                                <input
                                  type="text"
                                  value={editForm.options}
                                  onChange={(e) => setEditForm({ ...editForm, options: e.target.value })}
                                  placeholder='选项 JSON, 例如: ["A. 选项1", "B. 选项2"]'
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                                />
                              )}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editForm.answer}
                                  onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                                  placeholder="答案"
                                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                                <input
                                  type="text"
                                  value={editForm.explanation}
                                  onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                                  placeholder="解析（可选）"
                                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button onClick={cancelEdit} className="btn-secondary text-xs">取消</button>
                                <button onClick={saveEdit} disabled={savingEdit} className="btn-primary text-xs">
                                  {savingEdit ? '保存中...' : '保存'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ── Display mode ── */
                            <div className="flex items-start justify-between gap-3">
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
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => startEdit(q)}
                                  className="px-3 py-1 text-xs text-primary-500 hover:text-white hover:bg-primary-500 rounded-lg border border-primary-200 hover:border-primary-500 transition-colors"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => handleDelete(q.id)}
                                  disabled={deleting === q.id}
                                  className="px-3 py-1 text-xs text-red-500 hover:text-white hover:bg-red-500 rounded-lg border border-red-200 hover:border-red-500 transition-colors"
                                >
                                  {deleting === q.id ? '删除中...' : '删除'}
                                </button>
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
          })}
          {cats.length === 0 && (
            <div className="text-center text-gray-400 py-8">暂无题目</div>
          )}
        </div>
      )}
    </div>
  )
}
