import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg' | 'xl'
  variant?: 'default' | 'gradient' | 'dots'
  text?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'default', variant = 'default', text, ...props }, ref) => {
    const sizes = {
      sm: 'size-4',
      default: 'size-6',
      lg: 'size-8',
      xl: 'size-12',
    }

    const textSizes = {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    }

    if (variant === 'dots') {
      return (
        <div
          ref={ref}
          className={cn('flex flex-col items-center gap-3', className)}
          {...props}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-primary animate-bounce',
                  size === 'sm' && 'size-1.5',
                  size === 'default' && 'size-2',
                  size === 'lg' && 'size-2.5',
                  size === 'xl' && 'size-3',
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          {text && (
            <p className={cn('text-muted-foreground', textSizes[size])}>
              {text}
            </p>
          )}
        </div>
      )
    }

    if (variant === 'gradient') {
      return (
        <div
          ref={ref}
          className={cn('flex flex-col items-center gap-3', className)}
          {...props}
        >
          <div
            className={cn(
              'rounded-full border-2 border-transparent bg-gradient-to-r from-primary via-primary/50 to-transparent animate-spin',
              sizes[size],
            )}
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, var(--primary) 360deg)',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))',
            }}
          />
          {text && (
            <p className={cn('text-muted-foreground', textSizes[size])}>
              {text}
            </p>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center gap-3', className)}
        {...props}
      >
        <Loader2 className={cn('animate-spin text-primary', sizes[size])} />
        {text && (
          <p className={cn('text-muted-foreground', textSizes[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }
)

LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }