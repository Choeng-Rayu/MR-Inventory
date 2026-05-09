import { cn } from '@/utils/helpers'

interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function Card({ children, className, header, footer }: CardProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg bg-white shadow', className)}>
      {header && <div className="border-b border-gray-200 px-4 py-3">{header}</div>}
      <div className="p-4">{children}</div>
      {footer && <div className="border-t border-gray-200 px-4 py-3">{footer}</div>}
    </div>
  )
}
