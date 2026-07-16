interface ProgressBarProps {
  value: number // 0-100
  colorClass?: string
  heightClass?: string
  showLabel?: boolean
}

/**
 * ProgressBar - 进度条组件
 */
export default function ProgressBar({
  value,
  colorClass = 'bg-primary-500',
  heightClass = 'h-2',
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value))

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-gray-100 rounded-full ${heightClass}`}>
        <div
          className={`${colorClass} ${heightClass} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-500 w-10 text-right">{pct}%</span>
      )}
    </div>
  )
}
