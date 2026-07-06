import { useState } from 'react'
import { useApi } from '../hooks/useApi'

export default function Import() {
  const { loading, error, setError } = useApi()
  const [jsonText, setJsonText] = useState('')
  const [category, setCategory] = useState('')
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null)
  const [feedback, setFeedback] = useState('')

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
      if (data.imported > 0) {
        setJsonText('')
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

      {/* Category input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          默认分类（可选，题目自带 category 字段或 ID 前缀可自动识别）
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="例如: docker"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
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
