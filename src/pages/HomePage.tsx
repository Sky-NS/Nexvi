import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripStore } from '@/store/tripStore';
import { useSettingsStore } from '@/store/settingsStore';
import { TripCard } from '@/components/TripCard';
import { TripLimitDialog } from '@/components/TripLimitDialog';
import { NoApiKeyDialog } from '@/components/NoApiKeyDialog';
import { RoamvasMark } from '@/components/RoamvasMark';
import { RoamvasWordmark } from '@/components/RoamvasWordmark';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/LanguageContext';
import { Plus, Settings, Upload, AlertCircle } from 'lucide-react';
import { TEST_MODE } from '@/config';
import { parseTripFile } from '@/lib/tripFile';

// Free-tier cap. Bump this (or wire it to a real plan lookup) once paid
// subscriptions exist.
const MAX_FREE_TRIPS = 3;

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { trips, deleteTrip, setCurrentTrip, addTrip } = useTripStore();
  const { apiKey } = useSettingsStore();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showNoKeyDialog, setShowNoKeyDialog] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!TEST_MODE && !apiKey) { setShowNoKeyDialog(true); return; }
    if (trips.length >= MAX_FREE_TRIPS) { setShowLimitDialog(true); return; }
    navigate('/wizard');
  };

  const handleImportClick = () => {
    setImportError('');
    if (trips.length >= MAX_FREE_TRIPS) { setShowLimitDialog(true); return; }
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // so re-selecting the same file still fires onChange
    if (!file) return;

    try {
      const content = await file.text();
      const result = parseTripFile(content);
      if ('error' in result) { setImportError(t('home.importError')); return; }
      addTrip(result.trip);
      setCurrentTrip(result.trip);
      navigate(`/trip/${result.trip.id}`);
    } catch {
      setImportError(t('home.importError'));
    }
  };

  return (
    <div className="nx-fade-in max-w-4xl mx-auto px-4 py-8">
      <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileSelected} className="hidden" />

      <div className="relative mb-8 pt-1">
        <div className="flex flex-col items-center gap-3">
          <RoamvasMark className="w-16 h-16 rounded-2xl shadow-card" />
          <h1 className="sr-only">{t('app.name')}</h1>
          <RoamvasWordmark className="h-6 w-auto" />
        </div>
        <div className="absolute top-0 right-0 flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleImportClick} aria-label={t('home.importPlan')}><Upload className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}><Settings className="w-4 h-4" /></Button>
        </div>
      </div>

      {importError && (
        <div className="mb-6 p-3 bg-danger-soft text-danger rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {importError}
        </div>
      )}

      <InstallPrompt />

      {trips.length === 0 ? (
        <div className="text-center py-16 px-6 bg-surface rounded-2xl border border-dashed border-border">
          <RoamvasMark className="w-16 h-16 rounded-2xl shadow-card mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">{t('home.emptyTitle')}</h2>
          <p className="text-sm text-ink-soft mb-6">{t('home.emptySubtitle')}</p>
          <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> {t('home.createTrip')}</Button>
          <div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={handleImportClick}><Upload className="w-3.5 h-3.5 mr-1.5" />{t('home.importPlan')}</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={() => { setCurrentTrip(trip); navigate(`/trip/${trip.id}`); }}
                onDelete={() => deleteTrip(trip.id)}
              />
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> {t('home.newTrip')}</Button>
            <Button variant="ghost" onClick={handleImportClick}><Upload className="w-4 h-4 mr-2" />{t('home.importPlan')}</Button>
          </div>
        </>
      )}

      {showLimitDialog && <TripLimitDialog max={MAX_FREE_TRIPS} onClose={() => setShowLimitDialog(false)} />}
      {showNoKeyDialog && <NoApiKeyDialog onClose={() => setShowNoKeyDialog(false)} />}
    </div>
  );
}
