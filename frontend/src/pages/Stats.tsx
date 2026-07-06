import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import type { StatsResponse } from '../types'

const CATEGORY_NAMES: Record<string, string> = {
  java: '☕ Java',
  golang: '🐹 Golang',
  agent: '🤖 AI Agent',
}

export default function Stats() {
  const { getStats, resetProgress } = useApi()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [resetting, setResetting] = useState(false)

  const loadStats = () => {
    getStats().then((data) => {
      if (data) setStats(data)
    })
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleReset = async (category?: string) => {
    if (!confirm(category ? `确定重置 ${CATEGORY_NAMES[category]} 的进度？` : '确定重置所有进度？此操作不可恢复！')) {
      return
    }
    setResetting(true)
    const ok = await resetProgress(category)
    if (ok) {
      loadStats()
    }
    setResetting(false)
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">📊 学习统计</h1>

      {/* Overall stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{stats.total_answered}</div>
          <div className="text-sm text-gray-400">总答题数</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-emerald-600">{stats.total_correct}</div>
          <div className="text-sm text-gray-400">总正确数</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.accuracy.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">总正确率</div>
        </div>
      </div>

      {/* Per category */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">分类统计</h2>
        {stats.categories.map((cat) => (
          <div key={cat.category} className="card mb-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">
                {CATEGORY_NAMES[cat.category] || cat.category}
              </h3>
              <button
                onClick={() => handleReset(cat.category)}
                disabled={resetting || cat.total === 0}
                className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
              >
                重置
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <div className="text-lg font-bold text-gray-700">{cat.total}</div>
                <div className="text-xs text-gray-400">答题数</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600">{cat.correct}</div>
                <div className="text-xs text-gray-400">正确</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-500">{cat.wrong}</div>
                <div className="text-xs text-gray-400">错误</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${cat.progress_pct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-500 w-10 text-right">
                {cat.progress_pct}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reset all */}
      {stats.total_answered > 0 && (
        <div className="text-center">
          <button
            onClick={() => handleReset()}
            disabled={resetting}
            className="btn-danger text-sm"
          >
            🗑 重置所有进度
          </button>
        </div>
      )}
    </div>
  )
}
