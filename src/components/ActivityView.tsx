import { Activity } from '@/types/trip';
import { MapPin, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  activity: Activity;
  currency: string;
}

export function ActivityView({ activity, currency }: Props) {
  const mapsHref = activity.location ? `https://www.google.com/maps/search/${encodeURIComponent(activity.location)}` : undefined;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
      {activity.photo && (
        <img src={activity.photo} alt={activity.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl leading-none shrink-0" aria-hidden>{activity.icon || '📍'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {activity.time && <span className="tabular-nums text-sm font-semibold text-gray-500">{activity.time}</span>}
              {activity.booked && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Забронировано
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 leading-snug mt-0.5">{activity.title}</h4>
            {activity.description && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{activity.description}</p>}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
              {activity.location && (
                <a href={mapsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-gray-700">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {activity.location}
                </a>
              )}
              {activity.hours && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" /> {activity.hours}
                </span>
              )}
              {typeof activity.cost === 'number' && activity.cost > 0 && (
                <span className="font-medium text-gray-700">{currency}{activity.cost}</span>
              )}
              {activity.cost === 0 && <span className="font-medium text-green-600">Бесплатно</span>}
            </div>

            {activity.bookingNote && (
              <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-md px-2 py-1 inline-block">{activity.bookingNote}</p>
            )}
            {activity.notes && <p className="text-xs text-gray-400 mt-1.5 italic">{activity.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
