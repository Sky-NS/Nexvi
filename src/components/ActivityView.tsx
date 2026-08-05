import { Activity } from '@/types/trip';
import { useTranslation } from '@/i18n/LanguageContext';
import { MapPin, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  activity: Activity;
  currency: string;
}

export function ActivityView({ activity, currency }: Props) {
  const { t } = useTranslation();
  const mapsHref = activity.location ? `https://www.google.com/maps/search/${encodeURIComponent(activity.location)}` : undefined;

  return (
    <div className="rounded-2xl overflow-hidden border border-border-soft bg-surface shadow-card transition-shadow hover:shadow-card-hover">
      {activity.photo && (
        <img src={activity.photo} alt={activity.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl leading-none shrink-0 mt-0.5" aria-hidden>{activity.icon || '📍'}</span>
          <div className="flex-1 min-w-0">
            {activity.booked && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('activity.booked')}
              </span>
            )}
            <h4 className="font-bold text-ink leading-snug">{activity.title}</h4>
            {activity.description && <p className="text-sm text-ink-soft mt-1 leading-relaxed">{activity.description}</p>}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-ink-faint">
              {activity.location && (
                <a href={mapsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-brand transition-colors">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {activity.location}
                </a>
              )}
              {activity.hours && (
                <span className="inline-flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 shrink-0" /> {activity.hours}
                </span>
              )}
              {typeof activity.cost === 'number' && activity.cost > 0 && (
                <span className="font-mono font-semibold text-ink">{currency}{activity.cost}</span>
              )}
              {activity.cost === 0 && <span className="font-semibold text-success">{t('common.free')}</span>}
            </div>

            {activity.bookingNote && (
              <p className="text-xs text-ink-soft mt-2 bg-brand-soft rounded-lg px-2 py-1 inline-block">{activity.bookingNote}</p>
            )}
            {activity.notes && <p className="text-xs text-ink-faint mt-1.5 italic">{activity.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
