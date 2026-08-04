import { Activity } from '@/types/trip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ChevronUp, ChevronDown, Trash2, GripVertical, MapPin, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  activity: Activity; actIndex: number; totalActivities: number; currency: string;
  onUpdate: (u: (a: Activity) => Activity) => void;
  onRemove: () => void; onMove: (dir: -1 | 1) => void;
}

export function ActivityItem({ activity, actIndex, totalActivities, currency, onUpdate, onRemove, onMove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const mapsHref = activity.location ? `https://www.google.com/maps/search/${encodeURIComponent(activity.location)}` : undefined;

  return (
    <div className={`group border rounded-lg p-3 transition-colors ${activity.booked ? 'border-green-200 bg-green-50/40' : 'hover:border-gray-300'}`}>
      <div className="flex items-center gap-2">
        <Input type="time" value={activity.time} onChange={(e) => onUpdate((a) => ({ ...a, time: e.target.value }))} className="w-24 text-sm" />
        <Input value={activity.title} onChange={(e) => onUpdate((a) => ({ ...a, title: e.target.value }))} placeholder="Название активности" className="flex-1 text-sm font-medium" />
        {activity.booked && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" disabled={actIndex === 0} onClick={() => onMove(-1)}><ChevronUp className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" disabled={actIndex === totalActivities - 1} onClick={() => onMove(1)}><ChevronDown className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={onRemove}><Trash2 className="w-3 h-3" /></Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}><GripVertical className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} /></Button>
      </div>
      {expanded && (
        <div className="mt-3 md:pl-28 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input value={activity.location} onChange={(e) => onUpdate((a) => ({ ...a, location: e.target.value }))} placeholder="Локация" className="text-sm" />
            <Input value={activity.description} onChange={(e) => onUpdate((a) => ({ ...a, description: e.target.value }))} placeholder="Описание" className="text-sm" />
            <Input value={activity.notes} onChange={(e) => onUpdate((a) => ({ ...a, notes: e.target.value }))} placeholder="Заметки" className="text-sm md:col-span-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 shrink-0">{currency || '#'}</span>
              <Input type="number" value={activity.cost ?? ''} onChange={(e) => onUpdate((a) => ({ ...a, cost: e.target.value === '' ? undefined : Number(e.target.value) }))} placeholder="0" className="text-sm" />
            </div>
            <Input value={activity.hours || ''} onChange={(e) => onUpdate((a) => ({ ...a, hours: e.target.value }))} placeholder="Часы работы" className="text-sm" />
            <label className="flex items-center gap-2 text-sm text-gray-600 col-span-2 md:col-span-1">
              <Checkbox checked={!!activity.booked} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate((a) => ({ ...a, booked: e.target.checked }))} />
              Забронировано
            </label>
            {mapsHref ? (
              <a href={mapsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 col-span-2 md:col-span-1">
                <MapPin className="w-3.5 h-3.5" /> Открыть карту
              </a>
            ) : <span />}
          </div>
          {activity.booked && (
            <Input value={activity.bookingNote || ''} onChange={(e) => onUpdate((a) => ({ ...a, bookingNote: e.target.value }))} placeholder="Номер брони, место, вагон..." className="text-sm" />
          )}
        </div>
      )}
    </div>
  );
}
