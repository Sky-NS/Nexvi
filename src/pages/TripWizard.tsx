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
import { DateRangePicker } from '@/components/DateRangePicker';
import { useTranslation } from '@/i18n/LanguageContext';
import { LANGUAGE_NAMES } from '@/i18n/translations';
import { getCurrencySymbol } from '@/lib/currencies';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, User, Heart, Users, PartyPopper, Footprints, Bus, Car, KeyRound } from 'lucide-react';

export default function TripWizard() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { addTrip, setCurrentTrip } = useTripStore();
  const { apiKey, provider, preferredCurrency } = useSettingsStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PACE = [
    { value: 'relaxed' as const, label: t('wizard.pace.relaxed'), desc: t('wizard.pace.relaxedDesc') },
    { value: 'moderate' as const, label: t('wizard.pace.moderate'), desc: t('wizard.pace.moderateDesc') },
    { value: 'packed' as const, label: t('wizard.pace.packed'), desc: t('wizard.pace.packedDesc') },
  ];

  const TYPES = [
    { key: 'beach' as const, label: t('wizard.type.beach') }, { key: 'culture' as const, label: t('wizard.type.culture') },
    { key: 'adventure' as const, label: t('wizard.type.adventure') }, { key: 'food' as const, label: t('wizard.type.food') },
    { key: 'nightlife' as const, label: t('wizard.type.nightlife') }, { key: 'shopping' as const, label: t('wizard.type.shopping') },
    { key: 'relaxation' as const, label: t('wizard.type.relaxation') }, { key: 'nature' as const, label: t('wizard.type.nature') },
  ];

  const INTERESTS = [
    t('wizard.interest.history'), t('wizard.interest.art'), t('wizard.interest.tech'), t('wizard.interest.sports'),
    t('wizard.interest.photography'), t('wizard.interest.music'), t('wizard.interest.architecture'), t('wizard.interest.nature'),
  ];

  const TRAVEL_GROUPS = [
    { value: 'solo' as const, label: t('wizard.group.solo'), icon: User, defaultTravelers: 1 },
    { value: 'couple' as const, label: t('wizard.group.couple'), icon: Heart, defaultTravelers: 2 },
    { value: 'family' as const, label: t('wizard.group.family'), icon: Users, defaultTravelers: 4 },
    { value: 'group' as const, label: t('wizard.group.group'), icon: PartyPopper, defaultTravelers: 6 },
  ];

  const TRANSPORT = [
    { value: 'walking' as const, label: t('wizard.transport.walking'), icon: Footprints },
    { value: 'public' as const, label: t('wizard.transport.public'), icon: Bus },
    { value: 'car' as const, label: t('wizard.transport.car'), icon: Car },
    { value: 'rental' as const, label: t('wizard.transport.rental'), icon: KeyRound },
  ];

  const [params, setParams] = useState<Omit<GenerationParams, 'preferredCurrency' | 'languageName'>>({
    destination: '', startDate: '', endDate: '', travelers: 1, budget: undefined,
    preferences: {
      beach: false, culture: false, adventure: false, food: false, nightlife: false,
      shopping: false, relaxation: false, nature: false,
      pace: 'moderate', interests: [],
      travelGroup: 'solo', transportation: 'public', wishes: '',
    },
  });

  const up = <K extends keyof TripPreferences>(k: K, v: TripPreferences[K]) =>
    setParams((p) => ({ ...p, preferences: { ...p.preferences, [k]: v } }));

  const setGroup = (group: TripPreferences['travelGroup']) => {
    const def = TRAVEL_GROUPS.find((g) => g.value === group)?.defaultTravelers || 1;
    setParams((p) => ({
      ...p,
      travelers: def,
      preferences: { ...p.preferences, travelGroup: group },
    }));
  };

  const v1 = () => {
    if (!params.destination.trim()) return t('wizard.error.destination');
    if (!params.startDate || !params.endDate) return t('wizard.error.dates');
    if (new Date(params.startDate) > new Date(params.endDate)) return t('wizard.error.dateOrder');
    return '';
  };
  const v2 = () => {
    if (!TYPES.some((ty) => params.preferences[ty.key as keyof TripPreferences])) return t('wizard.error.vacationType');
    return '';
  };

  const generate = async () => {
    if (!apiKey) { setError(t('wizard.error.noApiKey')); return; }
    setLoading(true); setError('');
    try {
      const fullParams: GenerationParams = { ...params, preferredCurrency, languageName: LANGUAGE_NAMES[language] || 'English' };
      const plan = await generateTripPlan(fullParams, apiKey, provider);
      const currencySymbol = getCurrencySymbol(preferredCurrency);
      const trip: Trip = {
        id: uuidv4(), destination: plan.destination || params.destination, startDate: params.startDate, endDate: params.endDate,
        travelers: params.travelers, budget: params.budget as any, currency: currencySymbol, preferences: params.preferences,
        days: plan.days?.map((d: any, i: number) => ({
          dayNumber: d.dayNumber || i + 1, date: d.date || format(parseISO(params.startDate), 'yyyy-MM-dd'),
          title: d.title || t('wizard.dayFallback', { n: i + 1 }), icon: d.icon || '📍',
          route: Array.isArray(d.route) ? d.route.map((r: any) => ({
            id: uuidv4(), from: r.from || '', to: r.to || '', mode: r.mode || '',
            cost: typeof r.cost === 'number' ? r.cost : undefined,
          })) : [],
          activities: d.activities?.map((a: any) => ({
            id: uuidv4(), title: a.title || t('wizard.activityFallback'),
            description: a.description || '', location: a.location || '', notes: a.notes || '',
            cost: typeof a.cost === 'number' ? a.cost : undefined, hours: a.hours || '',
            icon: a.icon || '📍', booked: false, bookingNote: '',
          })) || [],
        })) || [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      addTrip(trip); setCurrentTrip(trip); navigate(`/trip/${trip.id}`);
    } catch (e: any) { setError(e.message || t('wizard.error.generic')); } finally { setLoading(false); }
  };

  const showTravelersInput = params.preferences.travelGroup === 'family' || params.preferences.travelGroup === 'group';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
        <h1 className="text-2xl font-bold">{t('wizard.title')}</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold mb-2">{t('wizard.step1.heading')}</h2>

            <div><Label>{t('wizard.destination')}</Label>
              <Input placeholder={t('wizard.destinationPlaceholder')} value={params.destination} onChange={(e) => setParams({ ...params, destination: e.target.value })} />
            </div>

            <div>
              <Label className="mb-2 block">{t('wizard.dates')}</Label>
              <DateRangePicker startDate={params.startDate} endDate={params.endDate} onChange={(s, en) => setParams({ ...params, startDate: s, endDate: en })} />
            </div>

            <div>
              <Label className="mb-2 block">{t('wizard.who')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {TRAVEL_GROUPS.map((g) => {
                  const Icon = g.icon;
                  return (
                    <Button key={g.value} variant={params.preferences.travelGroup === g.value ? 'default' : 'outline'}
                      className="flex items-center gap-2 h-auto py-3 justify-start min-w-0"
                      onClick={() => setGroup(g.value)}>
                      <Icon className="w-4 h-4 shrink-0" /><span className="truncate min-w-0">{g.label}</span>
                    </Button>
                  );
                })}
              </div>
              {showTravelersInput && (
                <div className="mt-2">
                  <Label className="text-xs text-gray-500">{t('wizard.exactTravelers')}</Label>
                  <Input type="number" min={1} value={params.travelers}
                    onChange={(e) => setParams({ ...params, travelers: parseInt(e.target.value) || 1 })} />
                </div>
              )}
              {!showTravelersInput && (
                <p className="text-xs text-gray-500 mt-1">
                  {params.preferences.travelGroup === 'solo' ? t('wizard.travelers1') : t('wizard.travelers2')}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2 block">{t('wizard.transport')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {TRANSPORT.map((tr) => {
                  const Icon = tr.icon;
                  return (
                    <Button key={tr.value} variant={params.preferences.transportation === tr.value ? 'default' : 'outline'}
                      className="flex items-center gap-2 h-auto py-3 justify-start min-w-0"
                      onClick={() => up('transportation', tr.value)}>
                      <Icon className="w-4 h-4 shrink-0" /><span className="text-sm truncate min-w-0">{tr.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">{t('wizard.wishes')}</Label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder={t('wizard.wishesPlaceholder')}
                value={params.preferences.wishes || ''}
                onChange={(e) => up('wishes', e.target.value)}
              />
            </div>

            <div>
              <Label>{t('wizard.budget')}</Label>
              <select className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={params.budget || ''} onChange={(e) => setParams({ ...params, budget: e.target.value || undefined })}>
                <option value="">{t('common.notSpecified')}</option>
                <option value="economy">{t('wizard.budget.economy')}</option>
                <option value="comfort">{t('wizard.budget.comfort')}</option>
                <option value="premium">{t('wizard.budget.premium')}</option>
              </select>
            </div>

            <Button className="w-full mt-2" onClick={() => { const err = v1(); if (err) setError(err); else { setError(''); setStep(2); } }}>
              {t('common.next')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold mb-2">{t('wizard.step2.heading')}</h2>

            <div><Label className="mb-2 block">{t('wizard.vacationType')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <Checkbox checked={params.preferences[opt.key]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => up(opt.key, e.target.checked)} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div><Label className="mb-2 block">{t('wizard.pace')}</Label>
              <div className="flex gap-2">
                {PACE.map((opt) => (
                  <Button key={opt.value} variant={params.preferences.pace === opt.value ? 'default' : 'outline'}
                    className="flex-1 flex flex-col items-center h-auto py-2 px-1"
                    onClick={() => up('pace', opt.value)}>
                    <span className="text-sm">{opt.label}</span>
                    <span className="text-[10px] opacity-70">{opt.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div><Label className="mb-2 block">{t('wizard.interests')}</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <Button key={i} variant={params.preferences.interests.includes(i) ? 'default' : 'outline'} size="sm"
                    onClick={() => {
                      const arr = params.preferences.interests.includes(i)
                        ? params.preferences.interests.filter((x) => x !== i)
                        : [...params.preferences.interests, i];
                      up('interests', arr);
                    }}>{i}</Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button variant="outline" className="w-full sm:flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}</Button>
              <Button className="w-full sm:flex-1" onClick={() => { const err = v2(); if (err) setError(err); else { setError(''); generate(); } }} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" />}
                <span className="truncate">{loading ? t('wizard.generating') : t('wizard.generate')}</span>
              </Button>
            </div>
          </div>
        )}

        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
      </div>
    </div>
  );
}
