import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { useTripStore } from '@/store/tripStore';
import { useSettingsStore } from '@/store/settingsStore';
import { generateTripPlan, GenerationParams } from '@/services/ai';
import { Trip, TripPreferences } from '@/types/trip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const PACE = [
  { value: 'relaxed' as const, label: 'Расслабленный' },
  { value: 'moderate' as const, label: 'Умеренный' },
  { value: 'packed' as const, label: 'Насыщенный' },
];

const TYPES = [
  { key: 'beach' as const, label: 'Пляжный' }, { key: 'culture' as const, label: 'Культурный' },
  { key: 'adventure' as const, label: 'Активный' }, { key: 'food' as const, label: 'Гастрономический' },
  { key: 'nightlife' as const, label: 'Ночная жизнь' }, { key: 'shopping' as const, label: 'Шопинг' },
  { key: 'relaxation' as const, label: 'Релакс' }, { key: 'nature' as const, label: 'Природа' },
];

const INTERESTS = ['История', 'Искусство', 'Технологии', 'Спорт', 'Фотография', 'Музыка', 'Архитектура', 'Природа'];

export default function TripWizard() {
  const navigate = useNavigate();
  const { addTrip, setCurrentTrip } = useTripStore();
  const { apiKey, provider } = useSettingsStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [params, setParams] = useState<GenerationParams>({
    destination: '', startDate: '', endDate: '', travelers: 1, budget: undefined,
    preferences: { beach: false, culture: false, adventure: false, food: false, nightlife: false, shopping: false, relaxation: false, nature: false, pace: 'moderate', interests: [] },
  });

  const up = <K extends keyof TripPreferences>(k: K, v: TripPreferences[K]) => setParams((p) => ({ ...p, preferences: { ...p.preferences, [k]: v } }));

  const v1 = () => { if (!params.destination.trim()) return 'Укажите место назначения'; if (!params.startDate || !params.endDate) return 'Укажите даты'; if (new Date(params.startDate) > new Date(params.endDate)) return 'Дата начала позже даты окончания'; return ''; };
  const v2 = () => { if (!TYPES.some((t) => params.preferences[t.key])) return 'Выберите хотя бы один тип отдыха'; return ''; };

  const generate = async () => {
    if (!apiKey) { setError('Сначала добавьте API-ключ в настройках'); return; }
    setLoading(true); setError('');
    try {
      const plan = await generateTripPlan(params, apiKey, provider);
      const trip: Trip = {
        id: uuidv4(), destination: params.destination, startDate: params.startDate, endDate: params.endDate,
        travelers: params.travelers, budget: params.budget as any, preferences: params.preferences,
        days: plan.days?.map((d: any, i: number) => ({
          dayNumber: d.dayNumber || i + 1, date: d.date || format(parseISO(params.startDate), 'yyyy-MM-dd'),
          title: d.title || `День ${i + 1}`,
          activities: d.activities?.map((a: any) => ({ id: uuidv4(), time: a.time || '09:00', title: a.title || 'Активность', description: a.description || '', location: a.location || '', notes: a.notes || '' })) || [],
        })) || [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      addTrip(trip); setCurrentTrip(trip); navigate(`/trip/${trip.id}`);
    } catch (e: any) { setError(e.message || 'Не удалось сгенерировать план'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
        <h1 className="text-2xl font-bold">Новая поездка</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Шаг 1: Параметры поездки</h2>
            <div><Label>Место назначения</Label><Input placeholder="Япония: Токио, Киото, Осака" value={params.destination} onChange={(e) => setParams({ ...params, destination: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Дата начала</Label><Input type="date" value={params.startDate} onChange={(e) => setParams({ ...params, startDate: e.target.value })} /></div>
              <div><Label>Дата окончания</Label><Input type="date" value={params.endDate} onChange={(e) => setParams({ ...params, endDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Путешественники</Label><Input type="number" min={1} value={params.travelers} onChange={(e) => setParams({ ...params, travelers: parseInt(e.target.value) || 1 })} /></div>
              <div><Label>Бюджет</Label>
                <select className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2" value={params.budget || ''} onChange={(e) => setParams({ ...params, budget: e.target.value || undefined })}>
                  <option value="">Не указан</option><option value="economy">Эконом</option><option value="comfort">Комфорт</option><option value="premium">Премиум</option>
                </select>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => { const err = v1(); if (err) setError(err); else { setError(''); setStep(2); } }}>Далее <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Шаг 2: Стиль путешествия</h2>
            <div><Label className="mb-2 block">Тип отдыха</Label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <Checkbox checked={params.preferences[opt.key]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => up(opt.key, e.target.checked)} /><span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div><Label className="mb-2 block">Темп</Label>
              <div className="flex gap-2">
                {PACE.map((opt) => <Button key={opt.value} variant={params.preferences.pace === opt.value ? 'default' : 'outline'} className="flex-1" onClick={() => up('pace', opt.value)}>{opt.label}</Button>)}
              </div>
            </div>
            <div><Label className="mb-2 block">Интересы</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <Button key={i} variant={params.preferences.interests.includes(i) ? 'default' : 'outline'} size="sm" onClick={() => {
                    const arr = params.preferences.interests.includes(i) ? params.preferences.interests.filter((x) => x !== i) : [...params.preferences.interests, i];
                    up('interests', arr);
                  }}>{i}</Button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Назад</Button>
              <Button className="flex-1" onClick={() => { const err = v2(); if (err) setError(err); else { setError(''); generate(); } }} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{loading ? 'Генерация...' : 'Сгенерировать план'}
              </Button>
            </div>
          </div>
        )}
        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}
      </div>
    </div>
  );
}