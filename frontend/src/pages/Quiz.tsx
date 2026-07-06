import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import type { SafeQuestion } from '../types'

export default function Quiz() {
  const location = useLocation()
  const navigate = useNavigate()
  const { startQuiz, submitBatch, loading } = useApi()

  const config = (location.state as any) || { category: 'java', count: 10, type: 'all' }

  const [questions, setQuestions] = useState<SafeQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    startQuiz(config.category, config.count, config.type).then((data) => {
      if (data) {
        setQuestions(data.questions)
        // Initialize answers for fill questions
        const init: Record<string, string> = {}
        data.questions.forEach((q) => {
          if (q.type === 'fill') init[q.id] = ''
        })
        setAnswers(init)
      }
    })
  }, [])

  const handleChoiceSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const handleFillInput = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    const answerList = questions.map((q) => ({
      question_id: q.id,
      answer: answers[q.id] || '',
    }))
    const result = await submitBatch(answerList)
    if (result) {
      navigate('/result', {
        state: {
          results: result.results,
          correct: result.correct,
          total: result.total,
          accuracy: result.accuracy,
          questions,
          answers,
        },
      })
    }
  }

  const allAnswered = questions.every((q) => answers[q.id]?.trim())

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-400">加载题目中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          {config.category === 'java' ? '☕' : config.category === 'golang' ? '🐹' : '🤖'}{' '}
          {config.category} 刷题
        </h1>
        <span className="text-sm text-gray-400">
          共 {questions.length} 题 · 已答 {Object.values(answers).filter((a) => a?.trim()).length} 题
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${(Object.values(answers).filter((a) => a?.trim()).length / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Questions */}
      {questions.map((q, idx) => (
        <div key={q.id} className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
              #{idx + 1}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {q.subcategory}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                q.difficulty === 'easy'
                  ? 'bg-green-100 text-green-600'
                  : q.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '中等' : '困难'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                q.type === 'choice' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
              }`}
            >
              {q.type === 'choice' ? '选择' : '填空'}
            </span>
          </div>

          <p className="text-gray-800 font-medium mb-4">{q.question}</p>

          {q.type === 'choice' ? (
            <div className="space-y-2">
              {(() => {
                try {
                  const opts: string[] = JSON.parse(q.options)
                  return opts.map((opt, oi) => {
                    const isSelected = answers[q.id] === opt
                    return (
                      <button
                        key={oi}
                        onClick={() => handleChoiceSelect(q.id, opt)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`inline-block w-6 h-6 rounded-full border-2 mr-3 text-center text-xs leading-5 align-middle ${isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300'}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </button>
                    )
                  })
                } catch {
                  return <p className="text-red-400 text-sm">选项解析失败</p>
                }
              })()}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => handleFillInput(q.id, e.target.value)}
                placeholder="输入你的答案..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && allAnswered) handleSubmit()
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Submit */}
      <div className="sticky bottom-4">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="btn-success w-full text-lg py-3 shadow-lg"
        >
          {loading ? '提交中...' : !allAnswered ? '请完成所有题目' : '✅ 提交答案'}
        </button>
      </div>
    </div>
  )
}
