import { DayPlan } from '@/types/trip';
import { format, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useTranslation } from '@/i18n/LanguageContext';

interface Props { days: DayPlan[]; }

export function DayNavGrid({ days }: Props) {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;

  if (days.length < 2) return null;

  // Plain DOM scroll instead of an <a href="#day-N"> anchor: this app uses
  // HashRouter, so a real hash link would rewrite the route (everything
  // after '#' is the current route) instead of just scrolling the page.
  const jumpTo = (dayNumber: number) => {
    document.getElementById(`day-${dayNumber}`)?.scrollIntoView({ block: 'start' });
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {days.map((day) => (
        <button
          key={day.dayNumber}
          type="button"
          onClick={() => jumpTo(day.dayNumber)}
          aria-label={t('day.label', { n: day.dayNumber, title: day.title || '—' })}
          className="flex flex-col justify-center text-left bg-surface border border-border rounded-xl p-3 min-h-[112px] w-[calc((100%_-_16px)/3)] hover:border-brand hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-2xl leading-none shrink-0" aria-hidden>{day.icon || '📍'}</span>
            <span className="text-xs font-mono text-ink-faint">{format(parseISO(day.date), 'd MMM', { locale })}</span>
          </div>
          <div className="text-sm font-semibold text-ink mt-2 text-left line-clamp-3">{day.title || '—'}</div>
        </button>
      ))}
    </div>
  );
}
