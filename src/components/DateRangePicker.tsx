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
  startDate: string; // 'yyyy-MM-dd' or ''
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

const WEEKDAY_KEYS = ['daterange.mon', 'daterange.tue', 'daterange.wed', 'daterange.thu', 'daterange.fri', 'daterange.sat', 'daterange.sun'];

export function DateRangePicker({ startDate, endDate, onChange }: Props) {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(startDate ? parseISO(startDate) : new Date()));

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

  const handleDayClick = (day: Date) => {
    const iso = format(day, 'yyyy-MM-dd');
    if (iso < todayIso) return;
    if (!startDate || (startDate && endDate)) {
      onChange(iso, '');
    } else if (iso < startDate) {
      onChange(iso, startDate);
    } else {
      onChange(startDate, iso);
    }
  };

  const dayCount = startDate && endDate
    ? Math.round((parseISO(endDate).getTime() - parseISO(startDate).getTime()) / 86400000) + 1
    : 0;

  return (
    <div>
      <div className="text-sm font-semibold text-ink mb-2 h-5">
        {startDate && endDate
          ? t('wizard.datesSummary', { start: format(parseISO(startDate), 'd MMM', { locale }), end: format(parseISO(endDate), 'd MMM yyyy', { locale }), days: dayCount })
          : startDate
            ? format(parseISO(startDate), 'd MMMM yyyy', { locale })
            : <span className="text-ink-faint font-normal">{t('wizard.datesPlaceholder')}</span>}
      </div>

      <div className="border border-border rounded-2xl p-3 bg-surface">
        <div className="flex items-center justify-between mb-2">
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
              const isStart = iso === startDate;
              const isEnd = iso === endDate;
              const inRange = !!startDate && !!endDate && iso > startDate && iso < endDate;
              const isPast = iso < todayIso;
              const isToday = iso === todayIso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'h-9 text-sm font-mono my-0.5 rounded-full transition-colors',
                    !inMonth && 'text-ink-faint',
                    isPast && 'text-ink-faint/50 cursor-not-allowed',
                    !isPast && inMonth && !isStart && !isEnd && 'hover:bg-border-soft',
                    inRange && 'bg-border-soft',
                    (isStart || isEnd) && 'bg-brand text-white font-semibold rounded-full',
                    isToday && !isStart && !isEnd && 'font-bold text-ink',
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
