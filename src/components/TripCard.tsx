import { Trip } from '@/types/trip';
import { useTranslation } from '@/i18n/LanguageContext';
import { format, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Calendar, Users, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface Props { trip: Trip; onEdit: () => void; onDelete: () => void; }

export function TripCard({ trip, onEdit, onDelete }: Props) {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onEdit(); }}
      className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow cursor-pointer text-left"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg line-clamp-1">{trip.destination || t('tripCard.untitled')}</h3>

        {confirming ? (
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs px-2.5 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              {t('common.delete')}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-xs px-2.5 py-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 shrink-0"
            onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
            aria-label={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{format(parseISO(trip.startDate), 'd MMM', { locale })} — {format(parseISO(trip.endDate), 'd MMM yyyy', { locale })}</span>
        </div>
        <div className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /><span>{trip.travelers} {t('common.people')}</span></div>
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /><span>{trip.days.length} {t('tripCard.days')} · {trip.days.reduce((a, d) => a + d.activities.length, 0)} {t('tripCard.activities')}</span></div>
      </div>
    </div>
  );
}
