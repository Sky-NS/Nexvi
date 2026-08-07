import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripStore } from '@/store/tripStore';
import { useSettingsStore } from '@/store/settingsStore';
import { TripCard } from '@/components/TripCard';
import { TripLimitDialog } from '@/components/TripLimitDialog';
import { NoApiKeyDialog } from '@/components/NoApiKeyDialog';
import { VoyafioMark } from '@/components/VoyafioMark';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/LanguageContext';
import { Plus, Settings } from 'lucide-react';
import { TEST_MODE } from '@/config';

// Free-tier cap. Bump this (or wire it to a real plan lookup) once paid
// subscriptions exist.
const MAX_FREE_TRIPS = 3;

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { trips, deleteTrip, setCurrentTrip } = useTripStore();
  const { apiKey } = useSettingsStore();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showNoKeyDialog, setShowNoKeyDialog] = useState(false);

  const handleCreate = () => {
    if (!TEST_MODE && !apiKey) { setShowNoKeyDialog(true); return; }
    if (trips.length >= MAX_FREE_TRIPS) { setShowLimitDialog(true); return; }
    navigate('/wizard');
  };

  return (
    <div className="nx-fade-in max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <VoyafioMark className="w-9 h-9 text-brand shrink-0" />
          <h1 className="text-xl font-extrabold tracking-tight text-ink">{t('app.name')}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}><Settings className="w-4 h-4" /></Button>
      </div>

      <InstallPrompt />

      {trips.length === 0 ? (
        <div className="text-center py-16 px-6 bg-surface rounded-2xl border border-dashed border-border">
          <VoyafioMark className="w-14 h-14 text-brand mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">{t('home.emptyTitle')}</h2>
          <p className="text-sm text-ink-soft mb-6">{t('home.emptySubtitle')}</p>
          <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> {t('home.createTrip')}</Button>
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
          <Button variant="outline" onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> {t('home.newTrip')}</Button>
        </>
      )}

      {showLimitDialog && <TripLimitDialog max={MAX_FREE_TRIPS} onClose={() => setShowLimitDialog(false)} />}
      {showNoKeyDialog && <NoApiKeyDialog onClose={() => setShowNoKeyDialog(false)} />}
    </div>
  );
}
