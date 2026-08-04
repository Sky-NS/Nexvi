import { DayPlan } from '@/types/trip';
import { ActivityView } from './ActivityView';
import { useTranslation } from '@/i18n/LanguageContext';
import { format, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

interface Props {
  day: DayPlan;
  currency: string;
}

export function DayView({ day, currency }: Props) {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;
  const dayTotal = (day.route || []).reduce((s, r) => s + (r.cost || 0), 0) + day.activities.reduce((s, a) => s + (a.cost || 0), 0);

  return (
    <div id={`day-${day.dayNumber}`} className="scroll-mt-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl leading-none shrink-0" aria-hidden>{day.icon || '📍'}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {t('day.numberLabel', { n: day.dayNumber })} · {format(parseISO(day.date), 'd MMMM', { locale })}
          </p>
          <h3 className="font-bold text-lg text-gray-900 leading-snug truncate">{day.title || '—'}</h3>
        </div>
      </div>

      {day.route && day.route.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {day.route.map((leg) => (
            <span key={leg.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
              {leg.from || '?'} → {leg.to || '?'}
              {leg.mode ? ` · ${leg.mode}` : ''}
              {typeof leg.cost === 'number' && leg.cost > 0 ? ` · ${currency}${leg.cost}` : ''}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2.5">
        {day.activities.map((a) => (
          <ActivityView key={a.id} activity={a} currency={currency} />
        ))}
      </div>

      {dayTotal > 0 && (
        <div className="flex items-center justify-between text-sm mt-2.5 px-1">
          <span className="text-gray-400">{t('day.total')}</span>
          <span className="font-semibold text-gray-700">{currency}{dayTotal}</span>
        </div>
      )}
    </div>
  );
}
