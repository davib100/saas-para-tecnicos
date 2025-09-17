import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all-smooth disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active-scale click-ripple relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-modern hover:shadow-modern-xl hover:bg-primary/90 hover-lift-gentle',
        destructive:
          'bg-destructive text-destructive-foreground shadow-modern hover:shadow-modern-xl hover:bg-destructive/90 hover-lift-gentle',
        outline:
          'border-2 border-border bg-background shadow-modern hover:shadow-modern-xl hover:bg-accent hover:text-accent-foreground hover-lift-gentle',
        secondary:
          'bg-secondary text-secondary-foreground shadow-modern hover:shadow-modern-xl hover:bg-secondary/80 hover-lift-gentle',
        ghost:
          'hover:bg-accent hover:text-accent-foreground hover-scale-gentle',
        link: 
          'text-primary underline-offset-4 hover:underline transition-colors-smooth',
        gradient:
          'gradient-primary text-white shadow-modern hover:shadow-modern-xl hover-lift-gentle',
        glass:
          'glass-effect text-foreground shadow-modern hover:shadow-modern-xl hover-lift-gentle',
      },
      size: {
        default: 'h-11 px-6 py-2 has-[>svg]:px-4',
        sm: 'h-9 rounded-lg gap-1.5 px-4 text-sm has-[>svg]:px-3',
        lg: 'h-13 rounded-xl px-8 text-base has-[>svg]:px-6',
        xl: 'h-16 rounded-2xl px-10 text-lg has-[>svg]:px-8',
        icon: 'size-11 rounded-xl',
        'icon-sm': 'size-9 rounded-lg',
        'icon-lg': 'size-13 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="loading-spinner-modern size-4 mr-2" />
        )}
        {children}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }