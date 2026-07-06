import { useLocation, useNavigate } from 'react-router-dom'
import type { BatchResult, SafeQuestion } from '../types'

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as {
    results: BatchResult[]
    correct: number
    total: number
    accuracy: number
    questions: SafeQuestion[]
    answers: Record<string, string>
  } | null

  if (!state) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">没有答题数据</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          返回首页
        </button>
      </div>
    )
  }

  const { results, correct, total, accuracy, questions, answers } = state

  const getEmoji = () => {
    if (accuracy >= 90) return '🎉'
    if (accuracy >= 70) return '👍'
    if (accuracy >= 50) return '💪'
    return '📚'
  }

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className="card text-center">
        <div className="text-6xl mb-3">{getEmoji()}</div>
        <div className="text-3xl font-bold text-gray-800 mb-2">
          {correct} / {total}
        </div>
        <div
          className={`text-2xl font-bold ${
            accuracy >= 70 ? 'text-emerald-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'
          }`}
        >
          {accuracy.toFixed(1)}%
        </div>
        <p className="text-gray-400 mt-1 text-sm">
          {accuracy >= 90
            ? '太厉害了！你掌握得很好！'
            : accuracy >= 70
            ? '不错！继续保持！'
            : accuracy >= 50
            ? '还需努力，多复习错题！'
            : '基础比较薄弱，建议系统学习后再来刷题！'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/')} className="btn-primary flex-1">
          🏠 返回首页
        </button>
        <button onClick={() => navigate('/wrong')} className="btn-secondary flex-1">
          📝 查看错题本
        </button>
      </div>

      {/* Detailed results */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">答题详情</h2>
        {results.map((r, idx) => {
          const q = questions.find((q) => q.id === r.question_id)
          return (
            <div
              key={r.question_id}
              className={`card mb-3 border-l-4 ${
                r.correct ? 'border-l-emerald-500' : 'border-l-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`text-lg font-bold mt-1 ${
                    r.correct ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {r.correct ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium mb-2">
                    {idx + 1}. {q?.question || r.question_id}
                  </p>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-400">你的答案：</span>
                      <span className={r.correct ? 'text-emerald-600' : 'text-red-600'}>
                        {r.your_answer || '(未作答)'}
                      </span>
                    </div>
                    {!r.correct && (
                      <div>
                        <span className="text-gray-400">正确答案：</span>
                        <span className="text-emerald-600">{r.answer}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">解析：</span>
                      <span className="text-gray-600">{r.explanation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
