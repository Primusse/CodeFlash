import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

/**
 * Card - 通用卡片容器
 * 复用项目已有的 .card 样式类
 */
export default function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  )
}
