import { Trip } from '@/types/trip';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Props { trip: Trip; }

export function BudgetSummary({ trip }: Props) {
  const rows = trip.days.map((day) => {
    const routeCost = (day.route || []).reduce((s, r) => s + (r.cost || 0), 0);
    const actCost = day.activities.reduce((s, a) => s + (a.cost || 0), 0);
    return { day, total: routeCost + actCost };
  });
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const currency = trip.currency || '';

  if (grandTotal === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 mt-6">
      <h3 className="font-semibold mb-3">📊 Сводка расходов</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 text-xs border-b">
            <th className="pb-2 font-medium">День</th>
            <th className="pb-2 font-medium">Дата</th>
            <th className="pb-2 font-medium text-right">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ day, total }) => (
            <tr key={day.dayNumber} className="border-b last:border-0">
              <td className="py-2">День {day.dayNumber}</td>
              <td className="py-2 text-gray-500">{format(parseISO(day.date), 'd MMM', { locale: ru })}</td>
              <td className="py-2 text-right">{currency}{total}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="py-2" colSpan={2}>Итого за поездку</td>
            <td className="py-2 text-right">{currency}{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
