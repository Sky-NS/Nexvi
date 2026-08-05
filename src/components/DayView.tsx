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
    <div id={`day-${day.dayNumber}`} className="nx-fade-in scroll-mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-brand-soft flex items-center justify-center shrink-0">
          <span className="font-mono font-bold text-brand text-base">{String(day.dayNumber).padStart(2, '0')}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-medium text-ink-faint uppercase tracking-wider">
            {format(parseISO(day.date), 'd MMMM', { locale })}
          </p>
          <h3 className="font-bold text-lg text-ink leading-snug truncate">
            <span aria-hidden>{day.icon || '📍'}</span> {day.title || '—'}
          </h3>
        </div>
      </div>

      {day.route && day.route.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 ml-0.5">
          {day.route.map((leg) => (
            <span key={leg.id} className="inline-flex items-center gap-1 text-xs bg-border-soft text-ink-soft rounded-full px-2.5 py-1">
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
        <div className="flex items-center justify-between text-sm mt-3 px-1">
          <span className="text-ink-faint">{t('day.total')}</span>
          <span className="font-mono font-semibold text-ink">{currency}{dayTotal}</span>
        </div>
      )}
    </div>
  );
}
