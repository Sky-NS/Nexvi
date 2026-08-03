import { Activity } from '@/types/trip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChevronUp, ChevronDown, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface Props {
  activity: Activity; actIndex: number; totalActivities: number;
  onUpdate: (u: (a: Activity) => Activity) => void;
  onRemove: () => void; onMove: (dir: -1 | 1) => void;
}

export function ActivityItem({ activity, actIndex, totalActivities, onUpdate, onRemove, onMove }: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="group border rounded-lg p-3 hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-2">
        <Input type="time" value={activity.time} onChange={(e) => onUpdate((a) => ({ ...a, time: e.target.value }))} className="w-24 text-sm" />
        <Input value={activity.title} onChange={(e) => onUpdate((a) => ({ ...a, title: e.target.value }))} placeholder="Название активности" className="flex-1 text-sm font-medium" />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" disabled={actIndex === 0} onClick={() => onMove(-1)}><ChevronUp className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" disabled={actIndex === totalActivities - 1} onClick={() => onMove(1)}><ChevronDown className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={onRemove}><Trash2 className="w-3 h-3" /></Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}><GripVertical className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} /></Button>
      </div>
      {expanded && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pl-28">
          <Input value={activity.location} onChange={(e) => onUpdate((a) => ({ ...a, location: e.target.value }))} placeholder="Локация" className="text-sm" />
          <Input value={activity.description} onChange={(e) => onUpdate((a) => ({ ...a, description: e.target.value }))} placeholder="Описание" className="text-sm" />
          <Input value={activity.notes} onChange={(e) => onUpdate((a) => ({ ...a, notes: e.target.value }))} placeholder="Заметки" className="text-sm md:col-span-2" />
        </div>
      )}
    </div>
  );
}