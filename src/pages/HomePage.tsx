import { useNavigate } from 'react-router-dom';
import { useTripStore } from '@/store/tripStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Plus, Settings, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/TripCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { trips, deleteTrip, setCurrentTrip } = useTripStore();
  const { apiKey } = useSettingsStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Nexvi</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/settings')}><Settings className="w-4 h-4 mr-2" /> Настройки</Button>
          <Button onClick={() => { setCurrentTrip(null); navigate('/wizard'); }}><Plus className="w-4 h-4 mr-2" /> Создать поездку</Button>
        </div>
      </header>

      {!apiKey && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          ⚠️ Для генерации планов добавьте API-ключ в <button onClick={() => navigate('/settings')} className="underline font-medium">настройках</button>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Пока нет поездок</h2>
          <p className="text-gray-400 mb-6">Создайте первый план путешествия</p>
          <Button onClick={() => navigate('/wizard')}><Plus className="w-4 h-4 mr-2" /> Создать поездку</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onEdit={() => navigate(`/trip/${trip.id}`)} onDelete={() => deleteTrip(trip.id)} />
          ))}
        </div>
      )}
    </div>
  );
}