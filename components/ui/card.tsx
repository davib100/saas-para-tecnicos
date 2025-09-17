import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'glass' | 'gradient' | 'bordered'
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    const variants = {
      default: 'bg-card text-card-foreground border shadow-modern',
      glass: 'glass-effect text-card-foreground shadow-modern-xl',
      gradient: 'gradient-secondary text-card-foreground border-0 shadow-modern-xl',
      bordered: 'bg-card text-card-foreground border-2 border-primary/20 shadow-modern',
    }

    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          'flex flex-col gap-6 rounded-2xl py-6 transition-all-smooth',
          variants[variant],
          hover && 'hover-lift-gentle cursor-pointer',
          className,
        )}
        {...props}
      />
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn(
          '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
          className,
        )}
        {...props}
      />
    )
  }
)

const CardTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-title"
        className={cn('leading-tight font-semibold text-lg', className)}
        {...props}
      />
    )
  }
)

const CardDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-description"
        className={cn('text-muted-foreground text-sm leading-relaxed', className)}
        {...props}
      />
    )
  }
)

const CardAction = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-action"
        className={cn(
          'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
          className,
        )}
        {...props}
      />
    )
  }
)

const CardContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-content"
        className={cn('px-6', className)}
        {...props}
      />
    )
  }
)

const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn('flex items-center px-6 pt-4 [.border-t]:pt-6', className)}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardAction.displayName = "CardAction"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}