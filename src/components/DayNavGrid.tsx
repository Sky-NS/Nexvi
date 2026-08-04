import { DayPlan } from '@/types/trip';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Props { days: DayPlan[]; }

export function DayNavGrid({ days }: Props) {
  if (days.length < 2) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
      {days.map((day) => (
        <a
          key={day.dayNumber}
          href={`#day-${day.dayNumber}`}
          className="bg-white border rounded-lg p-3 hover:border-gray-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-lg leading-none shrink-0" aria-hidden>{day.icon || '📍'}</span>
            <span className="text-xs text-gray-400">{format(parseISO(day.date), 'd MMM', { locale: ru })}</span>
          </div>
          <div className="text-sm font-medium line-clamp-1 mt-0.5">День {day.dayNumber}: {day.title || '—'}</div>
        </a>
      ))}
    </div>
  );
}
