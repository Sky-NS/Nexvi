import { RouteLeg } from '@/types/trip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Route as RouteIcon } from 'lucide-react';

interface Props {
  route: RouteLeg[];
  currency: string;
  onAdd: () => void;
  onUpdate: (i: number, u: (r: RouteLeg) => RouteLeg) => void;
  onRemove: (i: number) => void;
}

export function RouteCard({ route, currency, onAdd, onUpdate, onRemove }: Props) {
  const total = route.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
        <RouteIcon className="w-3.5 h-3.5" /> МАРШРУТ ДНЯ
      </div>
      <div className="space-y-1.5">
        {route.map((leg, i) => (
          <div key={leg.id} className="flex items-center gap-1.5 group">
            <Input
              value={leg.from}
              onChange={(e) => onUpdate(i, (r) => ({ ...r, from: e.target.value }))}
              placeholder="Откуда"
              className="text-xs h-8 flex-1"
            />
            <span className="text-gray-300 text-xs shrink-0">→</span>
            <Input
              value={leg.to}
              onChange={(e) => onUpdate(i, (r) => ({ ...r, to: e.target.value }))}
              placeholder="Куда"
              className="text-xs h-8 flex-1"
            />
            <Input
              value={leg.mode}
              onChange={(e) => onUpdate(i, (r) => ({ ...r, mode: e.target.value }))}
              placeholder="Как"
              className="text-xs h-8 w-24 shrink-0"
            />
            <Input
              type="number"
              value={leg.cost ?? ''}
              onChange={(e) => onUpdate(i, (r) => ({ ...r, cost: e.target.value === '' ? undefined : Number(e.target.value) }))}
              placeholder="0"
              className="text-xs h-8 w-16 shrink-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 text-red-500 h-8 w-8 shrink-0"
              onClick={() => onRemove(i)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <Button variant="ghost" size="sm" onClick={onAdd} className="text-xs text-gray-500">
          <Plus className="w-3 h-3 mr-1" /> Добавить переход
        </Button>
        {route.length > 0 && (
          <span className="text-xs font-medium text-gray-600">Транспорт: {currency}{total}</span>
        )}
      </div>
    </div>
  );
}
