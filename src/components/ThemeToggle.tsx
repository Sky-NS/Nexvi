import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: 'light' | 'dark';
  disabled?: boolean;
  onChange: (value: 'light' | 'dark') => void;
}

export function ThemeToggle({ value, disabled, onChange }: Props) {
  const isDark = value === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      disabled={disabled}
      onClick={() => onChange(isDark ? 'light' : 'dark')}
      className={cn(
        'relative w-16 h-8 rounded-full shrink-0 border transition-colors duration-300',
        isDark ? 'bg-brand border-brand' : 'bg-border-soft border-border',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      )}
    >
      {/* Static icon for whichever side the thumb ISN'T currently covering */}
      <span className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className={cn('w-3.5 h-3.5 text-ink-faint transition-opacity duration-200', isDark ? 'opacity-100' : 'opacity-0')} />
        <Moon className={cn('w-3.5 h-3.5 text-ink-faint transition-opacity duration-200', isDark ? 'opacity-0' : 'opacity-100')} />
      </span>
      {/* Sliding thumb, carrying the icon for the currently active side */}
      <span
        className={cn(
          'absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ease-out',
          isDark && 'translate-x-8'
        )}
      >
        {isDark ? <Moon className="w-3.5 h-3.5 text-brand" /> : <Sun className="w-3.5 h-3.5 text-amber" />}
      </span>
    </button>
  );
}
