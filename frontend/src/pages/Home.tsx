import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import type { CategoryInfo } from '../types'

const CATEGORY_META: Record<string, { icon: string; desc: string; color: string }> = {
  java: {
    icon: '☕',
    desc: 'JVM、并发、Spring、MySQL、Redis 等',
    color: 'from-orange-400 to-red-500',
  },
  golang: {
    icon: '🐹',
    desc: '语法、并发、GMP、标准库、框架等',
    color: 'from-cyan-400 to-blue-500',
  },
  agent: {
    icon: '🤖',
    desc: 'LLM、RAG、Agent、Function Calling、LangChain 等',
    color: 'from-purple-400 to-indigo-500',
  },
  docker: {
    icon: '🐳',
    desc: '镜像、容器、Dockerfile、Compose、网络等',
    color: 'from-blue-400 to-cyan-500',
  },
}

const DEFAULT_META = { icon: '📦', desc: '', color: 'from-gray-400 to-gray-500' }

export default function Home() {
  const navigate = useNavigate()
  const { getCategories, loading } = useApi()
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [selectedCategory, setSelectedCategory] = useState('java')
  const [questionCount, setQuestionCount] = useState(10)
  const [questionType, setQuestionType] = useState('all')

  useEffect(() => {
    getCategories().then((data) => {
      if (data) {
        setCategories(data)
        if (data.length > 0 && !data.find((c) => c.category === selectedCategory)) {
          setSelectedCategory(data[0].category)
        }
      }
    })
  }, [])

  const handleStart = () => {
    navigate('/quiz', {
      state: {
        category: selectedCategory,
        count: questionCount,
        type: questionType,
      },
    })
  }

  const cat = categories.find((c) => c.category === selectedCategory)
  const meta = CATEGORY_META[selectedCategory] || DEFAULT_META

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          编程知识刷题工具
        </h1>
        <p className="text-gray-500">
          选择分类，开始刷题，巩固你的后端开发和 AI Agent 知识
        </p>
      </div>

      {/* Category Selection */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">选择分类</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((info) => {
            const meta = CATEGORY_META[info.category] || DEFAULT_META
            const isSelected = selectedCategory === info.category
            return (
              <button
                key={info.category}
                onClick={() => setSelectedCategory(info.category)}
                className={`card text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-primary-500 ring-offset-2'
                    : 'hover:ring-1 hover:ring-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{meta.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{info.name || info.category}</h3>
                    <p className="text-xs text-gray-400">{meta.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                    共 {info.total_count} 题
                  </span>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">
                    已答 {info.answered_count}
                  </span>
                  {info.answered_count > 0 && (
                    <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                      正确率 {Math.round((info.correct_count / info.answered_count) * 100)}%
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Quiz Config */}
      {cat && meta && (
        <section className="card">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">开始刷题</h2>
          <div className="space-y-4">
            {/* Question count */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                题目数量
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      questionCount === n
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Question type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                题型
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'choice', label: '选择题' },
                  { value: 'fill', label: '填空题' },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setQuestionType(t.value)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      questionType === t.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={loading || !cat || cat.total_count === 0}
              className="btn-primary w-full text-lg py-3"
            >
              🚀 开始刷题
            </button>
          </div>
        </section>
      )}

      {/* Quick Stats */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">学习概览</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((c) => {
              const meta = CATEGORY_META[c.category] || DEFAULT_META
              return (
                <div key={c.category} className="card text-center">
                  <span className="text-2xl">{meta.icon}</span>
                  <div className="mt-2 font-bold text-gray-800">
                    {c.answered_count} / {c.total_count}
                  </div>
                  <div className="text-xs text-gray-400">已答 / 总题数</div>
                  <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`bg-gradient-to-r ${meta.color} h-1.5 rounded-full transition-all`}
                      style={{
                        width: `${c.total_count > 0 ? (c.answered_count / c.total_count) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
