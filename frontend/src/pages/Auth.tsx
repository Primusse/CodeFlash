import { useState } from 'react'

const AUTH_KEY = '123123'
const TOKEN_KEY = 'codeflash_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export default function Auth({ onSuccess }: { onSuccess: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  const handleSubmit = () => {
    if (input.trim() === AUTH_KEY) {
      setToken(input.trim())
      setError('')
      onSuccess()
    } else {
      setError('密钥错误，请重试')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mesh">
      <div className={`w-full max-w-sm ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-lg shadow-primary-100 mb-4">
            <span className="text-3xl md:text-4xl">⚡</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">CodeFlash</h1>
          <p className="text-sm text-gray-400 mt-2">编程知识刷题工具</p>
        </div>

        {/* Input card */}
        <div className="card text-center space-y-4 shadow-lg shadow-gray-200/50">
          <p className="text-sm font-medium text-gray-500">请输入访问密钥</p>

          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="请输入密钥"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       placeholder:text-gray-300 transition-all duration-200"
            autoFocus
          />

          {error && (
            <p className="text-red-500 text-sm animate-[fadeIn_0.3s_ease-out]">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="btn-primary w-full py-3 text-base font-semibold"
          >
            验证进入
          </button>
        </div>
      </div>

      {/* Inline keyframes for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
