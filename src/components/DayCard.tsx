import { DayPlan, Activity, RouteLeg } from '@/types/trip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ActivityItem } from './ActivityItem';
import { RouteCard } from './RouteCard';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  day: DayPlan; dayIndex: number; totalDays: number; currency: string;
  onUpdateDay: (u: (d: DayPlan) => DayPlan) => void;
  onRemoveDay: () => void; onMoveDay: (dir: -1 | 1) => void;
  onAddActivity: () => void;
  onUpdateActivity: (i: number, u: (a: Activity) => Activity) => void;
  onRemoveActivity: (i: number) => void;
  onMoveActivity: (i: number, dir: -1 | 1) => void;
  onAddRoute: () => void;
  onUpdateRoute: (i: number, u: (r: RouteLeg) => RouteLeg) => void;
  onRemoveRoute: (i: number) => void;
}

export function DayCard(props: Props) {
  const { day, dayIndex, totalDays, currency, onUpdateDay, onRemoveDay, onMoveDay, onAddActivity, onUpdateActivity, onRemoveActivity, onMoveActivity, onAddRoute, onUpdateRoute, onRemoveRoute } = props;

  const dayTotal = (day.route || []).reduce((s, r) => s + (r.cost || 0), 0) + day.activities.reduce((s, a) => s + (a.cost || 0), 0);

  return (
    <div id={`day-${day.dayNumber}`} className="bg-white rounded-xl shadow-sm border p-4 md:p-6 scroll-mt-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500">День {day.dayNumber}</Label>
            <div className="flex items-center gap-2">
              <Input
                value={day.icon || ''}
                onChange={(e) => onUpdateDay((d) => ({ ...d, icon: e.target.value }))}
                placeholder="📍"
                className="w-11 h-9 text-center text-base shrink-0 px-0"
              />
              <Input value={day.title} onChange={(e) => onUpdateDay((d) => ({ ...d, title: e.target.value }))} className="font-semibold text-lg border-0 px-0 focus-visible:ring-0 flex-1 min-w-0" placeholder="Заголовок дня" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Дата</Label>
            <Input type="date" value={day.date} onChange={(e) => onUpdateDay((d) => ({ ...d, date: e.target.value }))} className="border-0 px-0 focus-visible:ring-0" />
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="icon" disabled={dayIndex === 0} onClick={() => onMoveDay(-1)}><ChevronUp className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" disabled={dayIndex === totalDays - 1} onClick={() => onMoveDay(1)}><ChevronDown className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={onRemoveDay}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <RouteCard route={day.route || []} currency={currency} onAdd={onAddRoute} onUpdate={onUpdateRoute} onRemove={onRemoveRoute} />

      <div className="space-y-2">
        {day.activities.map((a, i) => (
          <ActivityItem key={a.id} activity={a} actIndex={i} totalActivities={day.activities.length} currency={currency}
            onUpdate={(u) => onUpdateActivity(i, u)} onRemove={() => onRemoveActivity(i)} onMove={(d) => onMoveActivity(i, d)} />
        ))}
        <Button variant="ghost" className="w-full text-gray-500" onClick={onAddActivity}><Plus className="w-4 h-4 mr-2" /> Добавить активность</Button>
      </div>

      {dayTotal > 0 && (
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm">
          <span className="text-gray-500">Итого за день</span>
          <span className="font-semibold">{currency}{dayTotal}</span>
        </div>
      )}
    </div>
  );
}
