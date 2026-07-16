import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  className?: string
  block?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
}

/**
 * Button - 通用按钮组件
 * 支持 primary / secondary / success / danger 四种变体
 */
export default function Button({
  children,
  variant = 'primary',
  className = '',
  block = false,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${variantClasses[variant]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
