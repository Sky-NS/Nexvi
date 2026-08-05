import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function RoundCheckbox({ checked, onChange, label }: Props) {
  const button = (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200',
        checked ? 'bg-brand border-brand' : 'bg-surface border-border'
      )}
    >
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </button>
  );

  if (!label) return button;

  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      {button}
      <span className="text-sm font-medium text-ink">{label}</span>
    </label>
  );
}
