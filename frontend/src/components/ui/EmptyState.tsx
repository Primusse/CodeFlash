interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

/**
 * EmptyState - 空状态展示
 */
export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 md:py-20">
      <div className="text-4xl md:text-5xl mb-3">{icon}</div>
      <p className="text-sm md:text-base text-gray-500 font-medium">{title}</p>
      {description && <p className="text-xs md:text-sm text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
