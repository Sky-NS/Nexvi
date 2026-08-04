import { useNavigate } from 'react-router-dom';
import { useTripStore } from '@/store/tripStore';
import { TripCard } from '@/components/TripCard';
import { Button } from '@/components/ui/Button';
import { Plus, Settings, Plane } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { trips, deleteTrip, setCurrentTrip } = useTripStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold">Nexvi</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}><Settings className="w-4 h-4" /></Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-xl border border-dashed">
          <h2 className="text-xl font-semibold mb-2">Пока нет поездок</h2>
          <p className="text-sm text-gray-500 mb-6">Опишите направление и стиль поездки — маршрут по дням соберёт ИИ.</p>
          <Button onClick={() => navigate('/wizard')}><Plus className="w-4 h-4 mr-2" /> Создать поездку</Button>
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
          <Button variant="outline" onClick={() => navigate('/wizard')}><Plus className="w-4 h-4 mr-2" /> Новая поездка</Button>
        </>
      )}
    </div>
  );
}
