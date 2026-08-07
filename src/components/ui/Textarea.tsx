import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible line cap before it stops growing and scrolls internally instead. */
  maxLines?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLines = 5, value, style, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);

    const setRefs = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    };

    // Re-measure on every value change: reset to 'auto' first so it can
    // shrink back down too (e.g. after deleting text), not just grow.
    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [value]);

    return (
      <textarea
        ref={setRefs}
        value={value}
        rows={1}
        className={cn(
          'flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:opacity-50 resize-none overflow-y-auto',
          className
        )}
        style={{ maxHeight: `calc(${maxLines} * 1.5em + 1rem)`, ...style }}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
