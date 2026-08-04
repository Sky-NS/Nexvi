import { useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '@/store/tripStore';
import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { DayCard } from '@/components/DayCard';
import { DayNavGrid } from '@/components/DayNavGrid';
import { BudgetSummary } from '@/components/BudgetSummary';
import { ExportPdfButton } from '@/components/ExportPdfButton';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { DayPlan, Activity, RouteLeg } from '@/types/trip';

export default function TripEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, updateTrip } = useTripStore();
  const trip = useMemo(() => trips.find((t) => t.id === id), [trips, id]);
  const [localTrip, setLocalTrip] = useState(() => trip);
  const [saved, setSaved] = useState(false);

  if (!trip || !localTrip) return <div className="max-w-4xl mx-auto px-4 py-8 text-center"><h1 className="text-2xl font-bold mb-4">Поездка не найдена</h1><Button onClick={() => navigate('/')}>На главную</Button></div>;

  const currency = localTrip.currency || '';

  const updDay = (i: number, u: (d: DayPlan) => DayPlan) => setLocalTrip((p) => { if (!p) return p; const d = [...p.days]; d[i] = u(d[i]); return { ...p, days: d, updatedAt: new Date().toISOString() }; });
  const addDay = () => setLocalTrip((p) => { if (!p) return p; const last = p.days[p.days.length - 1]; const nd = last ? format(new Date(new Date(last.date).getTime() + 86400000), 'yyyy-MM-dd') : p.startDate; return { ...p, days: [...p.days, { dayNumber: p.days.length + 1, date: nd, title: `День ${p.days.length + 1}`, route: [], activities: [] }], updatedAt: new Date().toISOString() }; });
  const rmDay = (i: number) => setLocalTrip((p) => { if (!p) return p; const d = p.days.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, dayNumber: idx + 1 })); return { ...p, days: d, updatedAt: new Date().toISOString() }; });
  const mvDay = (i: number, dir: -1 | 1) => { const ni = i + dir; if (ni < 0 || ni >= localTrip.days.length) return; setLocalTrip((p) => { if (!p) return p; const d = [...p.days]; [d[i], d[ni]] = [d[ni], d[i]]; return { ...p, days: d.map((x, idx) => ({ ...x, dayNumber: idx + 1 })), updatedAt: new Date().toISOString() }; }); };

  const addAct = (i: number) => updDay(i, (d) => ({ ...d, activities: [...d.activities, { id: uuidv4(), time: '09:00', title: 'Новая активность', description: '', location: '', notes: '', booked: false, bookingNote: '' }] }));
  const updAct = (di: number, ai: number, u: (a: Activity) => Activity) => updDay(di, (d) => { const a = [...d.activities]; a[ai] = u(a[ai]); return { ...d, activities: a }; });
  const rmAct = (di: number, ai: number) => updDay(di, (d) => ({ ...d, activities: d.activities.filter((_, i) => i !== ai) }));
  const mvAct = (di: number, ai: number, dir: -1 | 1) => { const d = localTrip.days[di]; const ni = ai + dir; if (ni < 0 || ni >= d.activities.length) return; updDay(di, (x) => { const a = [...x.activities]; [a[ai], a[ni]] = [a[ni], a[ai]]; return { ...x, activities: a }; }); };

  const addRoute = (i: number) => updDay(i, (d) => ({ ...d, route: [...(d.route || []), { id: uuidv4(), from: '', to: '', mode: '', cost: undefined }] }));
  const updRoute = (di: number, ri: number, u: (r: RouteLeg) => RouteLeg) => updDay(di, (d) => { const r = [...(d.route || [])]; r[ri] = u(r[ri]); return { ...d, route: r }; });
  const rmRoute = (di: number, ri: number) => updDay(di, (d) => ({ ...d, route: (d.route || []).filter((_, i) => i !== ri) }));

  const save = () => { updateTrip(localTrip); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{localTrip.destination}</h1>
            <p className="text-sm text-gray-500">{format(parseISO(localTrip.startDate), 'd MMMM', { locale: ru })} — {format(parseISO(localTrip.endDate), 'd MMMM yyyy', { locale: ru })} · {localTrip.travelers} чел.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportPdfButton trip={localTrip} />
          <Button onClick={save} variant={saved ? 'outline' : 'default'}><Save className="w-4 h-4 mr-2" />{saved ? 'Сохранено!' : 'Сохранить'}</Button>
        </div>
      </div>

      <DayNavGrid days={localTrip.days} />

      <div className="space-y-4">
        {localTrip.days.map((day, i) => (
          <DayCard key={day.dayNumber} day={day} dayIndex={i} totalDays={localTrip.days.length} currency={currency}
            onUpdateDay={(u) => updDay(i, u)} onRemoveDay={() => rmDay(i)} onMoveDay={(d) => mvDay(i, d)}
            onAddActivity={() => addAct(i)} onUpdateActivity={(ai, u) => updAct(i, ai, u)} onRemoveActivity={(ai) => rmAct(i, ai)} onMoveActivity={(ai, d) => mvAct(i, ai, d)}
            onAddRoute={() => addRoute(i)} onUpdateRoute={(ri, u) => updRoute(i, ri, u)} onRemoveRoute={(ri) => rmRoute(i, ri)} />
        ))}
        <Button variant="outline" className="w-full" onClick={addDay}><Plus className="w-4 h-4 mr-2" /> Добавить день</Button>
      </div>

      <BudgetSummary trip={localTrip} />
    </div>
  );
}
