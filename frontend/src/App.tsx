import { useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import Stats from './pages/Stats'
import WrongQuestions from './pages/WrongQuestions'
import Import from './pages/Import'
import Manage from './pages/Manage'
import Notes from './pages/Notes'
import Auth, { isAuthenticated } from './pages/Auth'

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/notes', label: '笔记', icon: '📒' },
  { path: '/stats', label: '统计', icon: '📊' },
  { path: '/wrong', label: '错题本', icon: '📝' },
  { path: '/import', label: '导入', icon: '📥' },
  { path: '/manage', label: '管理', icon: '📋' },
]

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(isAuthenticated())

  if (!authed) {
    return <Auth onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      {/* ========== Desktop Header ========== */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-primary-600 shrink-0"
          >
            <span className="text-xl">⚡</span>
            <span className="hidden sm:inline">CodeFlash</span>
          </Link>

          {/* Desktop nav (md+) */}
          <nav className="hidden md:flex gap-0.5">
            {navItems.map((item) => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile nav (top, compact) */}
          <nav className="flex md:hidden gap-0">
            {navItems.slice(0, 4).map((item) => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-1.5 py-1 rounded-md text-sm transition-all duration-200 ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {item.icon}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* ========== Main Content ========== */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 md:py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/wrong" element={<WrongQuestions />} />
          <Route path="/import" element={<Import />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </main>

      {/* ========== Mobile Bottom Tab Bar ========== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 safe-bottom">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-200 active:scale-90 ${
                  active ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                <span className={`text-xl transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ========== Desktop Footer ========== */}
      <footer className="hidden md:block text-center text-gray-400 text-xs py-4 border-t border-gray-100">
        CodeFlash - 编程知识刷题工具 · 前后端分离 · Go + React
      </footer>
    </div>
  )
}

export default App
