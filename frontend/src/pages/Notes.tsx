import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import type { Note } from '../types'

function genId(): string {
  return 'note-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

const emptyNote = (): Note => ({
  id: genId(),
  title: '',
  tags: '',
  content: '',
  created_at: Date.now(),
  updated_at: Date.now(),
})

export default function Notes() {
  const { loading, getNotes, createNote, updateNote, deleteNote } = useApi()
  const [notes, setNotes] = useState<Note[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Viewing state - read-only note detail modal
  const [viewing, setViewing] = useState<Note | null>(null)

  // Editing state - edit form modal
  const [editing, setEditing] = useState<Note | null>(null)

  const fetchNotes = () => {
    getNotes().then((data) => {
      if (data) setNotes(data)
    })
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!editing) return
    if (!editing.title.trim()) {
      setError('标题不能为空')
      return
    }
    setSaving(true)
    setError('')

    const now = Date.now()
    const note: Note = { ...editing, updated_at: now }

    if (notes.find((n) => n.id === note.id)) {
      const result = await updateNote(note.id, note)
      if (result) {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? result : n)))
        setEditing(null)
      }
    } else {
      const result = await createNote(note)
      if (result) {
        setNotes((prev) => [result, ...prev])
        setEditing(null)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条笔记吗？')) return
    const ok = await deleteNote(id)
    if (ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (viewing?.id === id) setViewing(null)
      if (editing?.id === id) setEditing(null)
    }
  }

  const handleNew = () => {
    setEditing(emptyNote())
    setError('')
  }

  const handleView = (note: Note) => {
    setViewing(note)
  }

  const handleEdit = (note: Note) => {
    setEditing({ ...note })
    setError('')
  }

  const parseTags = (tags: string): string[] =>
    tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean)

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return d.toLocaleDateString('zh-CN')
  }

  const formatFullDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleString('zh-CN')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">📒 笔记</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">共 {notes.length} 条笔记</p>
        </div>
        <button onClick={handleNew} className="btn-primary text-sm md:text-base">
          + 新建笔记
        </button>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">
          <div className="animate-pulse text-2xl mb-2">⏳</div>
          <p className="text-sm">加载中...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center text-gray-400 py-16 md:py-20">
          <div className="text-4xl md:text-5xl mb-3">📝</div>
          <p className="text-sm md:text-base">还没有笔记，点击上方按钮创建第一条吧</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {notes.map((note) => {
            const tags = parseTags(note.tags)
            return (
              <div
                key={note.id}
                className="card group transition-all duration-200 hover:ring-1 hover:ring-primary-200"
              >
                <div className="flex items-start justify-between gap-2 md:gap-3">
                  {/* Clickable content area → view mode */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleView(note)}
                  >
                    <h3 className="font-semibold text-gray-800 mb-1 truncate text-sm md:text-base">
                      {note.title || '无标题'}
                    </h3>
                    {tags.length > 0 && (
                      <div className="flex gap-1 mb-1.5 flex-wrap">
                        {tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {note.content && (
                      <p className="text-sm text-gray-500 line-clamp-2 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{formatDate(note.updated_at)}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="shrink-0 flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(note)
                      }}
                      className="px-3 py-1.5 text-xs text-primary-500 hover:text-white hover:bg-primary-500 rounded-lg border border-primary-200 hover:border-primary-500 transition-all duration-200 active:scale-95"
                    >
                      编辑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(note.id)
                      }}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-white hover:bg-red-500 rounded-lg border border-red-200 hover:border-red-500 transition-all duration-200 active:scale-95"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          VIEW MODAL — Read-only note detail
          ═══════════════════════════════════════════════ */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-20 px-4 pb-8"
          onClick={() => setViewing(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-lg text-gray-800 truncate pr-2">
                {viewing.title || '无标题'}
              </h2>
              <button
                onClick={() => setViewing(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Tags */}
            {(() => {
              const tags = parseTags(viewing.tags)
              if (tags.length === 0) return null
              return (
                <div className="flex gap-1.5 px-5 py-3 flex-wrap border-b border-gray-50 shrink-0">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs bg-primary-50 text-primary-600 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )
            })()}

            {/* Content — scrollable read-only area */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
                {viewing.content || (
                  <span className="text-gray-300 italic">暂无内容</span>
                )}
              </div>
            </div>

            {/* Footer with timestamps & actions */}
            <div className="px-5 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                <p>创建于 {formatFullDate(viewing.created_at)}</p>
                <p>更新于 {formatFullDate(viewing.updated_at)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const note = viewing
                    setViewing(null)
                    setTimeout(() => handleEdit(note), 100)
                  }}
                  className="btn-primary text-sm"
                >
                  ✏️ 编辑
                </button>
                <button
                  onClick={() => setViewing(null)}
                  className="btn-secondary text-sm"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          EDIT MODAL — Create / Edit note form
          ═══════════════════════════════════════════════ */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-16 px-4 pb-8"
          onClick={() => setEditing(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-lg text-gray-800">
                {notes.find((n) => n.id === editing.id) ? '编辑笔记' : '新建笔记'}
              </h2>
              <button
                onClick={() => { setEditing(null); setError('') }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">标题</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="输入笔记标题"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  autoFocus
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  标签（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={editing.tags}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
                  placeholder="例如: Go, 并发, 笔记"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
                {editing.tags && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {parseTags(editing.tags).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs bg-primary-50 text-primary-600 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">内容</label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder="输入笔记内容..."
                  rows={8}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y text-base"
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-5 py-3 border-t border-gray-100 shrink-0 flex gap-2 justify-end">
              <button
                onClick={() => { setEditing(null); setError('') }}
                className="btn-secondary text-sm"
              >
                取消
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
