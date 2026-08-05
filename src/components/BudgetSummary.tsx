import { Trip } from '@/types/trip';
import { useTranslation } from '@/i18n/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Props { trip: Trip; }

export function BudgetSummary({ trip }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const rows = trip.days.map((day) => {
    const routeCost = (day.route || []).reduce((s, r) => s + (r.cost || 0), 0);
    const actCost = day.activities.reduce((s, a) => s + (a.cost || 0), 0);
    return { day, total: routeCost + actCost };
  });
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const currency = trip.currency || '';

  if (grandTotal === 0) return null;

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border mt-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-3 p-4 md:p-6 text-left"
      >
        <span className="font-bold text-lg text-ink">{t('budget.heading')}</span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="font-mono font-semibold text-brand">{currency}{grandTotal}</span>
          <ChevronDown className={`w-4 h-4 text-ink-faint transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {expanded && (
        <div className="nx-fade-in px-4 md:px-6 pb-4 md:pb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-faint text-[11px] font-semibold uppercase tracking-wider border-b border-border-soft">
                <th className="pb-2 font-medium">{t('budget.day')}</th>
                <th className="pb-2 font-medium">{t('budget.dayTitle')}</th>
                <th className="pb-2 font-medium text-right">{t('budget.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ day, total }) => (
                <tr key={day.dayNumber} className="border-b border-border-soft last:border-0">
                  <td className="py-2 whitespace-nowrap">{t('day.numberLabel', { n: day.dayNumber })}</td>
                  <td className="py-2 text-ink-soft truncate max-w-0">{day.title || '—'}</td>
                  <td className="py-2 text-right font-mono">{currency}{total}</td>
                </tr>
              ))}
              <tr className="font-bold text-ink">
                <td className="py-2" colSpan={2}>{t('budget.total')}</td>
                <td className="py-2 text-right font-mono text-brand">{currency}{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
