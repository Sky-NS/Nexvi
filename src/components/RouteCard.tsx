import { RouteLeg } from '@/types/trip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/LanguageContext';
import { Plus, Trash2, Route as RouteIcon } from 'lucide-react';

interface Props {
  route: RouteLeg[];
  currency: string;
  onAdd: () => void;
  onUpdate: (i: number, u: (r: RouteLeg) => RouteLeg) => void;
  onRemove: (i: number) => void;
}

export function RouteCard({ route, currency, onAdd, onUpdate, onRemove }: Props) {
  const { t } = useTranslation();
  const total = route.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <div className="bg-bg rounded-xl p-3 mb-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-faint uppercase tracking-wider mb-2">
        <RouteIcon className="w-3.5 h-3.5" /> {t('route.heading')}
      </div>
      <div className="space-y-2">
        {route.map((leg, i) => (
          <div key={leg.id} className="bg-surface rounded-lg p-2 border border-border-soft shadow-card">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Input
                value={leg.from}
                onChange={(e) => onUpdate(i, (r) => ({ ...r, from: e.target.value }))}
                placeholder={t('route.from')}
                className="text-xs h-8 flex-1 min-w-0"
              />
              <span className="text-ink-faint text-xs shrink-0">→</span>
              <Input
                value={leg.to}
                onChange={(e) => onUpdate(i, (r) => ({ ...r, to: e.target.value }))}
                placeholder={t('route.to')}
                className="text-xs h-8 flex-1 min-w-0"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Input
                value={leg.mode}
                onChange={(e) => onUpdate(i, (r) => ({ ...r, mode: e.target.value }))}
                placeholder={t('route.mode')}
                className="text-xs h-8 flex-1 min-w-0"
              />
              <Input
                type="number"
                value={leg.cost ?? ''}
                onChange={(e) => onUpdate(i, (r) => ({ ...r, cost: e.target.value === '' ? undefined : Number(e.target.value) }))}
                placeholder="0"
                className="text-xs h-8 w-16 shrink-0"
              />
              <Button variant="ghost" size="icon" className="text-danger h-8 w-8 shrink-0" onClick={() => onRemove(i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <Button variant="ghost" size="sm" onClick={onAdd} className="text-xs text-ink-soft">
          <Plus className="w-3 h-3 mr-1" /> {t('route.add')}
        </Button>
        {route.length > 0 && (
          <span className="text-xs font-mono font-semibold text-ink">{t('route.total', { amount: `${currency}${total}` })}</span>
        )}
      </div>
    </div>
  );
}
