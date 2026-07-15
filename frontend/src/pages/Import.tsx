import { useEffect, useState, useRef } from 'react'
import { useApi } from '../hooks/useApi'
import type { CategoryInfo } from '../types'

const AVAILABLE_ICONS = [
  '☕', '🐹', '🤖', '🐳', '🐍', '💻', '🎯', '🔧',
  '⚙️', '🚀', '💡', '📦', '🗄️', '🌐', '🔒', '🛡️',
  '📊', '🎨', '🧩', '🔬', '📱', '🖥️', '🗃️', '⚛️',
  '🦀', '🐘', '🍃', '🔥', '☁️', '🏗️', '📝', '🧪',
  '⭐', '🎮', '🧠', '💾', '🔗', '📡', '🛠️', '🌀',
  '📋', '✅', '🎵', '🧰', '🪄', '🎪', '🔮', '💎',
]

export default function Import() {
  const { loading, error, setError, getCategories } = useApi()
  const [jsonText, setJsonText] = useState('')
  const [category, setCategory] = useState('')
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null)
  const [feedback, setFeedback] = useState('')

  // Category combobox state
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [selectedIcon, setSelectedIcon] = useState('📦')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCategories().then((data) => {
      if (data) setCategories(data)
    })
  }, [])

  // Filter categories that match the input
  const filtered = category.trim()
    ? categories.filter((c) =>
        c.category.toLowerCase().includes(category.toLowerCase()) ||
        c.name.toLowerCase().includes(category.toLowerCase())
      )
    : categories

  // When a category is selected from the dropdown
  const selectCategory = (cat: CategoryInfo) => {
    setCategory(cat.category)
    setSelectedIcon(cat.icon || '📦')
    setShowDropdown(false)
    setHighlightIdx(-1)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((prev) => (prev + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((prev) => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault()
      selectCategory(filtered[highlightIdx])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setHighlightIdx(-1)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleImport = async () => {
    setResult(null)
    setFeedback('')

    // Parse JSON first to validate
    let parsed: any[]
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      setError('JSON 格式错误，请检查')
      return
    }

    if (!Array.isArray(parsed)) {
      setError('JSON 必须是一个数组 [{...}, {...}]')
      return
    }

    const params = category ? `?category=${encodeURIComponent(category)}` : ''
    try {
      const res = await fetch(`/api/questions/import${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonText,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '导入失败')
        return
      }
      setResult(data)
      setFeedback(`✅ 成功导入 ${data.imported} 题，跳过 ${data.skipped} 题（ID 已存在）`)

      // If this is a new category, save its icon selection
      if (data.imported > 0 && category.trim()) {
        const existing = categories.find((c) => c.category === category.trim())
        if (!existing && selectedIcon !== '📦') {
          // Save category meta for the new category
          fetch(`/api/category-metas/${encodeURIComponent(category.trim())}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: category.trim(), icon: selectedIcon }),
          }).catch(() => {})
        }
      }

      if (data.imported > 0) {
        setJsonText('')
        // Refresh categories
        getCategories().then((data) => {
          if (data) setCategories(data)
        })
      }
    } catch {
      setError('网络错误，请重试')
    }
  }

  const sample = JSON.stringify([
    {
      id: 'docker-001',
      subcategory: '基础概念',
      type: 'choice',
      difficulty: 'easy',
      question: 'Docker 的核心三要素不包括以下哪个？',
      options: '["镜像 (Image)", "容器 (Container)", "仓库 (Registry)", "虚拟机 (VM)"]',
      answer: '虚拟机 (VM)',
      explanation: 'Docker 核心三要素是镜像、容器和仓库。',
    },
  ], null, 2)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📥 导入题目</h1>
        <p className="text-sm text-gray-500 mt-1">
          粘贴 JSON 数组格式的题目，系统自动识别新增题目并入库，已存在的 ID 自动跳过。
        </p>
      </div>

      {/* Category input with combobox */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          默认分类（可选，题目自带 category 字段或 ID 前缀可自动识别）
        </label>
        <div className="flex gap-2">
          {/* Icon picker button */}
          <div className="relative">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-11 h-11 text-xl flex items-center justify-center bg-white rounded-lg border border-gray-300 hover:border-primary-400 transition-colors shrink-0"
              title="选择图标"
            >
              {selectedIcon}
            </button>
            {showIconPicker && (
              <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-72">
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => {
                        setSelectedIcon(icon)
                        setShowIconPicker(false)
                      }}
                      className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors ${
                        selectedIcon === icon ? 'bg-primary-100 ring-2 ring-primary-400' : ''
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Combobox input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setShowDropdown(true)
                setHighlightIdx(-1)
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="选择或输入分类，例如: docker"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {/* Dropdown */}
            {showDropdown && filtered.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full mt-1 left-0 right-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto"
              >
                {filtered.map((cat, idx) => (
                  <button
                    key={cat.category}
                    onClick={() => selectCategory(cat)}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors ${
                      idx === highlightIdx
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{cat.icon || '📦'}</span>
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-gray-400 text-xs ml-auto">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {category.trim() && !categories.find((c) => c.category === category.trim()) && (
          <p className="text-xs text-gray-400 mt-1">
            新分类 "{category}"，导入后将自动创建，图标: {selectedIcon}
          </p>
        )}
      </div>

      {/* JSON textarea */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          题目 JSON
        </label>
        <textarea
          value={jsonText}
          onChange={(e) => { setJsonText(e.target.value); setResult(null); setFeedback('') }}
          placeholder={`粘贴 JSON 数组，格式示例：\n${sample}`}
          rows={16}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleImport}
          disabled={loading || !jsonText.trim()}
          className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '导入中...' : '导入题目'}
        </button>
        <button
          onClick={() => setJsonText(sample)}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          填入示例
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="p-4 rounded-lg bg-green-50 text-green-800 text-sm">
          {feedback}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-3 p-4 rounded-lg bg-gray-50 text-sm text-gray-600">
          <p>📊 总计: {result.total} 题</p>
          <p className="text-green-600">✅ 新增: {result.imported} 题</p>
          <p className="text-gray-400">⏭️ 跳过: {result.skipped} 题（已存在）</p>
        </div>
      )}
    </div>
  )
}
