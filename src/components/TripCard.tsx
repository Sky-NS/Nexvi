import { Trip } from '@/types/trip';
import { useTranslation } from '@/i18n/LanguageContext';
import { format, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Calendar, Users, MapPin, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { trip: Trip; onEdit: () => void; onDelete: () => void; }

export function TripCard({ trip, onEdit, onDelete }: Props) {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg line-clamp-1">{trip.destination || t('tripCard.untitled')}</h3>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={onEdit}><Edit3 className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
        </div>
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
