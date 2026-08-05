import { Trip } from '@/types/trip';
import { useTranslation } from '@/i18n/LanguageContext';
import { format, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

interface Props { trip: Trip; }

export function BudgetSummary({ trip }: Props) {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;

  const rows = trip.days.map((day) => {
    const routeCost = (day.route || []).reduce((s, r) => s + (r.cost || 0), 0);
    const actCost = day.activities.reduce((s, a) => s + (a.cost || 0), 0);
    return { day, total: routeCost + actCost };
  });
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const currency = trip.currency || '';

  if (grandTotal === 0) return null;

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-4 md:p-6 mt-6">
      <h3 className="font-bold text-lg text-ink mb-4">{t('budget.heading')}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-faint text-[11px] font-semibold uppercase tracking-wider border-b border-border-soft">
            <th className="pb-2 font-medium">{t('budget.day')}</th>
            <th className="pb-2 font-medium">{t('budget.date')}</th>
            <th className="pb-2 font-medium text-right">{t('budget.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ day, total }) => (
            <tr key={day.dayNumber} className="border-b border-border-soft last:border-0">
              <td className="py-2">{t('day.numberLabel', { n: day.dayNumber })}</td>
              <td className="py-2 text-ink-soft">{format(parseISO(day.date), 'd MMM', { locale })}</td>
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
  );
}
