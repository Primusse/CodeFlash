import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import Stats from './pages/Stats'
import WrongQuestions from './pages/WrongQuestions'
import Import from './pages/Import'
import Manage from './pages/Manage'

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/stats', label: '统计', icon: '📊' },
  { path: '/wrong', label: '错题本', icon: '📝' },
  { path: '/import', label: '导入', icon: '📥' },
  { path: '/manage', label: '管理', icon: '📋' },
]

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary-700">
            ⚡ CodeFlash
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/wrong" element={<WrongQuestions />} />
          <Route path="/import" element={<Import />} />
          <Route path="/manage" element={<Manage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-xs py-4 border-t border-gray-100">
        CodeFlash - 编程知识刷题工具 · 前后端分离 · Go + React
      </footer>
    </div>
  )
}

export default App
