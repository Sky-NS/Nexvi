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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
      {days.map((day) => (
        <button
          key={day.dayNumber}
          type="button"
          onClick={() => jumpTo(day.dayNumber)}
          aria-label={t('day.label', { n: day.dayNumber, title: day.title || '—' })}
          className="text-left bg-white border rounded-lg p-3 hover:border-gray-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-lg leading-none shrink-0" aria-hidden>{day.icon || '📍'}</span>
            <span className="text-xs text-gray-400">{format(parseISO(day.date), 'd MMM', { locale })}</span>
          </div>
          <div className="text-sm font-medium line-clamp-1 mt-1 text-left">{day.title || '—'}</div>
        </button>
      ))}
    </div>
  );
}
