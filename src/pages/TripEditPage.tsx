import { useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '@/store/tripStore';
import { useState, useMemo, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, addDays } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { DayCard } from '@/components/DayCard';
import { DayView } from '@/components/DayView';
import { DayNavGrid } from '@/components/DayNavGrid';
import { BudgetSummary } from '@/components/BudgetSummary';
import { ExportPdfButton } from '@/components/ExportPdfButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useTranslation } from '@/i18n/LanguageContext';
import { ArrowLeft, Plus, Check, Pencil, Share2 } from 'lucide-react';
import { DayPlan, Activity, RouteLeg } from '@/types/trip';
import { exportTripToFile } from '@/lib/tripFile';

export default function TripEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;
  const { trips, updateTrip } = useTripStore();
  const trip = useMemo(() => trips.find((tr) => tr.id === id), [trips, id]);
  const [localTrip, setLocalTrip] = useState(() => trip);
  const [isEditing, setIsEditing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // While editing, save quietly in the background so nothing is lost if the
  // user navigates away without tapping "Done".
  useEffect(() => {
    if (!isEditing || !localTrip) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => updateTrip(localTrip), 1200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTrip, isEditing]);

  if (!trip || !localTrip) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">{t('trip.notFound')}</h1>
      <Button onClick={() => navigate('/')}>{t('trip.goHome')}</Button>
    </div>
  );

  const currency = localTrip.currency || '';

  // Dates are meant to be sequential from the trip's start date — this keeps
  // both dayNumber and date correct after any reorder/add/remove, instead of
  // a date staying attached to whichever day's content got moved.
  const recalcDates = (days: DayPlan[]): DayPlan[] => {
    if (!localTrip.startDate) return days.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
    const start = parseISO(localTrip.startDate);
    return days.map((d, idx) => ({ ...d, dayNumber: idx + 1, date: format(addDays(start, idx), 'yyyy-MM-dd') }));
  };

  const updDay = (i: number, u: (d: DayPlan) => DayPlan) => setLocalTrip((p) => { if (!p) return p; const d = [...p.days]; d[i] = u(d[i]); return { ...p, days: d, updatedAt: new Date().toISOString() }; });
  const addDay = () => setLocalTrip((p) => { if (!p) return p; const nd: DayPlan = { dayNumber: p.days.length + 1, date: '', title: t('wizard.dayFallback', { n: p.days.length + 1 }), icon: '📍', route: [], activities: [] }; return { ...p, days: recalcDates([...p.days, nd]), updatedAt: new Date().toISOString() }; });
  const rmDay = (i: number) => setLocalTrip((p) => { if (!p) return p; return { ...p, days: recalcDates(p.days.filter((_, idx) => idx !== i)), updatedAt: new Date().toISOString() }; });
  const mvDay = (i: number, dir: -1 | 1) => { const ni = i + dir; if (ni < 0 || ni >= localTrip.days.length) return; setLocalTrip((p) => { if (!p) return p; const d = [...p.days]; [d[i], d[ni]] = [d[ni], d[i]]; return { ...p, days: recalcDates(d), updatedAt: new Date().toISOString() }; }); };

  const addAct = (i: number) => updDay(i, (d) => ({ ...d, activities: [...d.activities, { id: uuidv4(), title: t('wizard.activityFallback'), description: '', location: '', notes: '', icon: '📍', booked: false, bookingNote: '' }] }));
  const updAct = (di: number, ai: number, u: (a: Activity) => Activity) => updDay(di, (d) => { const a = [...d.activities]; a[ai] = u(a[ai]); return { ...d, activities: a }; });
  const rmAct = (di: number, ai: number) => updDay(di, (d) => ({ ...d, activities: d.activities.filter((_, i) => i !== ai) }));
  const mvAct = (di: number, ai: number, dir: -1 | 1) => { const d = localTrip.days[di]; const ni = ai + dir; if (ni < 0 || ni >= d.activities.length) return; updDay(di, (x) => { const a = [...x.activities]; [a[ai], a[ni]] = [a[ni], a[ai]]; return { ...x, activities: a }; }); };

  const addRoute = (i: number) => updDay(i, (d) => ({ ...d, route: [...(d.route || []), { id: uuidv4(), from: '', to: '', mode: '', cost: undefined }] }));
  const updRoute = (di: number, ri: number, u: (r: RouteLeg) => RouteLeg) => updDay(di, (d) => { const r = [...(d.route || [])]; r[ri] = u(r[ri]); return { ...d, route: r }; });
  const rmRoute = (di: number, ri: number) => updDay(di, (d) => ({ ...d, route: (d.route || []).filter((_, i) => i !== ri) }));

  const finishEditing = () => { updateTrip(localTrip); setIsEditing(false); };

  return (
    <div className="nx-fade-in max-w-4xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-ink truncate">{localTrip.destination}</h1>
            <p className="text-xs md:text-sm font-mono text-ink-soft mt-0.5">
              {format(parseISO(localTrip.startDate), 'd MMM', { locale })} — {format(parseISO(localTrip.endDate), 'd MMM yyyy', { locale })} · {localTrip.travelers} {t('common.people')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {!isEditing && <ExportPdfButton trip={localTrip} />}
          {!isEditing && <Button variant="outline" onClick={() => exportTripToFile(localTrip)}><Share2 className="w-4 h-4 mr-2" />{t('trip.share')}</Button>}
          {isEditing ? (
            <Button onClick={finishEditing}><Check className="w-4 h-4 mr-2" />{t('common.done')}</Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}><Pencil className="w-4 h-4 mr-2" />{t('common.edit')}</Button>
          )}
        </div>
      </div>

      <DayNavGrid days={localTrip.days} />

      {isEditing ? (
        <div className="space-y-4">
          {localTrip.days.map((day, i) => (
            <DayCard key={day.dayNumber} day={day} dayIndex={i} totalDays={localTrip.days.length} currency={currency}
              otherDates={localTrip.days.filter((_, idx) => idx !== i).map((d) => d.date).filter(Boolean)}
              onUpdateDay={(u) => updDay(i, u)} onRemoveDay={() => rmDay(i)} onMoveDay={(d) => mvDay(i, d)}
              onAddActivity={() => addAct(i)} onUpdateActivity={(ai, u) => updAct(i, ai, u)} onRemoveActivity={(ai) => rmAct(i, ai)} onMoveActivity={(ai, d) => mvAct(i, ai, d)}
              onAddRoute={() => addRoute(i)} onUpdateRoute={(ri, u) => updRoute(i, ri, u)} onRemoveRoute={(ri) => rmRoute(i, ri)} />
          ))}
          <Button variant="outline" className="w-full" onClick={addDay}><Plus className="w-4 h-4 mr-2" /> {t('trip.addDay')}</Button>
        </div>
      ) : (
        <div className="space-y-7">
          {localTrip.days.map((day) => (
            <DayView key={day.dayNumber} day={day} currency={currency} />
          ))}
        </div>
      )}

      <BudgetSummary trip={localTrip} />
      <ScrollToTopButton />
    </div>
  );
}
