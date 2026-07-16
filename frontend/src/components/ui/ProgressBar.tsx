interface LoadingStateProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * LoadingState - 加载中状态
 */
export default function LoadingState({ text = '加载中...', size = 'md' }: LoadingStateProps) {
  const sizeClass = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }[size]

  return (
    <div className="text-center py-12 md:py-16">
      <div className={`animate-spin ${sizeClass} mb-3 inline-block`}>⏳</div>
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}
