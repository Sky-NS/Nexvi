import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-brand text-white hover:bg-brand-dark': variant === 'default',
          'border border-border bg-surface hover:bg-bg hover:border-ink-faint text-ink': variant === 'outline',
          'hover:bg-border-soft text-ink': variant === 'ghost',
          'bg-danger text-white hover:bg-danger/90': variant === 'destructive',
          'h-10 px-4 py-2': size === 'default',
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 w-10 p-0': size === 'icon',
        },
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
