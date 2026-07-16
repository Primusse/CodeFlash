import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  maxWidthClass?: string
}

/**
 * Modal - 通用弹窗组件
 * 带背景遮罩、点击外部关闭、ESC 关闭
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
}: ModalProps) {
  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-16 px-4 pb-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className={`relative w-full ${maxWidthClass} bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-lg text-gray-800 truncate pr-2">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-gray-100 shrink-0 flex gap-2 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
