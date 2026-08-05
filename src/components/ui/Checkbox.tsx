import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn('h-4 w-4 rounded border-ink-faint text-brand focus:ring-2 focus:ring-brand/30 accent-brand', className)}
      {...props}
    />
  )
);
Checkbox.displayName = 'Checkbox';
