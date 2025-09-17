import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.ComponentProps<'input'> {
  variant?: 'default' | 'glass' | 'bordered'
  inputSize?: 'sm' | 'default' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', inputSize = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-background border border-input',
      glass: 'glass-effect border border-border/50',
      bordered: 'bg-background border-2 border-primary/20 focus:border-primary/50',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      default: 'h-11 px-4',
      lg: 'h-13 px-6 text-lg',
    }

    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-xl text-base transition-all-smooth',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'shadow-modern focus:shadow-modern-xl',
          variants[variant],
          sizes[inputSize],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }