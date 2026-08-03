import { Trip } from '@/types/trip';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Users, MapPin, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { trip: Trip; onEdit: () => void; onDelete: () => void; }

export function TripCard({ trip, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg line-clamp-1">{trip.destination}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}><Edit3 className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{format(parseISO(trip.startDate), 'd MMM', { locale: ru })} — {format(parseISO(trip.endDate), 'd MMM yyyy', { locale: ru })}</span>
        </div>
        <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{trip.travelers} чел.</span></div>
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{trip.days.length} дней · {trip.days.reduce((a, d) => a + d.activities.length, 0)} активностей</span></div>
      </div>
    </div>
  );
}