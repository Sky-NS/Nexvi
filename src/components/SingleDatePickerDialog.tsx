import { useMemo, useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, addMonths, subMonths, format, parseISO,
} from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface Props {
  value: string; // 'yyyy-MM-dd'
  onChange: (date: string) => void;
  onClose: () => void;
}

const WEEKDAY_KEYS = ['daterange.mon', 'daterange.tue', 'daterange.wed', 'daterange.thu', 'daterange.fri', 'daterange.sat', 'daterange.sun'];

export function SingleDatePickerDialog({ value, onChange, onClose }: Props) {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value ? parseISO(value) : new Date()));

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [viewMonth]);

  const handlePick = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-overlay/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl shadow-pop p-4 max-w-sm w-full nx-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2 px-1">
          <button type="button" onClick={() => setViewMonth((m) => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-border-soft hover:text-brand transition-colors" aria-label="Prev month">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-sm font-semibold capitalize">{format(viewMonth, 'LLLL yyyy', { locale })}</span>
          <button type="button" onClick={() => setViewMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-border-soft hover:text-brand transition-colors" aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAY_KEYS.map((k) => (
            <div key={k} className="text-center text-[11px] font-mono font-semibold text-ink-faint py-1">{t(k)}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day) => {
              const iso = format(day, 'yyyy-MM-dd');
              const inMonth = isSameMonth(day, viewMonth);
              const isSelected = iso === value;
              const isToday = iso === format(new Date(), 'yyyy-MM-dd');
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handlePick(day)}
                  className={cn(
                    'h-10 text-sm font-mono my-0.5 rounded-full transition-colors',
                    !inMonth && 'text-ink-faint',
                    !isSelected && 'hover:bg-border-soft',
                    isSelected && 'bg-brand text-white font-semibold',
                    isToday && !isSelected && 'font-bold text-ink',
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
