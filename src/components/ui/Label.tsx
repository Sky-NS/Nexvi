import { LabelHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-xs font-semibold uppercase tracking-wider text-ink-faint leading-none peer-disabled:opacity-70', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';