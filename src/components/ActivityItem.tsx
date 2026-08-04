import { Activity } from '@/types/trip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ChevronUp, ChevronDown, Trash2, GripVertical, MapPin, CheckCircle2, ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
  activity: Activity; actIndex: number; totalActivities: number; currency: string;
  onUpdate: (u: (a: Activity) => Activity) => void;
  onRemove: () => void; onMove: (dir: -1 | 1) => void;
}

const MAX_PHOTO_WIDTH = 800;

function readAndCompressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image load failed'));
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_WIDTH / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('no canvas context')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ActivityItem({ activity, actIndex, totalActivities, currency, onUpdate, onRemove, onMove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapsHref = activity.location ? `https://www.google.com/maps/search/${encodeURIComponent(activity.location)}` : undefined;

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await readAndCompressImage(file);
      onUpdate((a) => ({ ...a, photo: dataUrl }));
    } catch {
      // photo is optional — a failed read shouldn't interrupt editing
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <div className={`group border rounded-lg p-3 transition-colors ${activity.booked ? 'border-green-200 bg-green-50/40' : 'hover:border-gray-300'}`}>
      <div className="flex items-center gap-2">
        <Input
          value={activity.icon || ''}
          onChange={(e) => onUpdate((a) => ({ ...a, icon: e.target.value }))}
          placeholder="🍜"
          className="w-11 h-9 text-center text-base shrink-0 px-0"
        />
        <Input type="time" value={activity.time} onChange={(e) => onUpdate((a) => ({ ...a, time: e.target.value }))} className="w-24 text-sm shrink-0" />
        <Input value={activity.title} onChange={(e) => onUpdate((a) => ({ ...a, title: e.target.value }))} placeholder="Название активности" className="flex-1 min-w-0 text-sm font-medium" />
        {activity.booked && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" disabled={actIndex === 0} onClick={() => onMove(-1)}><ChevronUp className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" disabled={actIndex === totalActivities - 1} onClick={() => onMove(1)}><ChevronDown className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={onRemove}><Trash2 className="w-3 h-3" /></Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="shrink-0"><GripVertical className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} /></Button>
      </div>

      {/* Touch screens have no hover state, so give mobile a dedicated always-visible row */}
      <div className="flex sm:hidden items-center justify-end gap-1 mt-1">
        <Button variant="ghost" size="icon" disabled={actIndex === 0} onClick={() => onMove(-1)}><ChevronUp className="w-3 h-3" /></Button>
        <Button variant="ghost" size="icon" disabled={actIndex === totalActivities - 1} onClick={() => onMove(1)}><ChevronDown className="w-3 h-3" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={onRemove}><Trash2 className="w-3 h-3" /></Button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          {activity.photo ? (
            <div className="relative">
              <img src={activity.photo} alt="" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => onUpdate((a) => ({ ...a, photo: undefined }))}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1"
                aria-label="Удалить фото"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoBusy}
              className="w-full h-20 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 flex items-center justify-center gap-2 text-sm hover:border-gray-300"
            >
              <ImagePlus className="w-4 h-4" /> {photoBusy ? 'Загрузка…' : 'Добавить фото'}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input value={activity.location} onChange={(e) => onUpdate((a) => ({ ...a, location: e.target.value }))} placeholder="Локация" className="text-sm" />
            <Input value={activity.description} onChange={(e) => onUpdate((a) => ({ ...a, description: e.target.value }))} placeholder="Описание" className="text-sm" />
            <Input value={activity.notes} onChange={(e) => onUpdate((a) => ({ ...a, notes: e.target.value }))} placeholder="Заметки" className="text-sm md:col-span-2" />
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 shrink-0">{currency || '#'}</span>
              <Input type="number" value={activity.cost ?? ''} onChange={(e) => onUpdate((a) => ({ ...a, cost: e.target.value === '' ? undefined : Number(e.target.value) }))} placeholder="0" className="text-sm" />
            </div>
            <Input value={activity.hours || ''} onChange={(e) => onUpdate((a) => ({ ...a, hours: e.target.value }))} placeholder="Часы работы" className="text-sm" />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <Checkbox checked={!!activity.booked} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate((a) => ({ ...a, booked: e.target.checked }))} />
              Забронировано
            </label>
            {mapsHref && (
              <a href={mapsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                <MapPin className="w-3.5 h-3.5" /> Открыть карту
              </a>
            )}
          </div>
          {activity.booked && (
            <Input value={activity.bookingNote || ''} onChange={(e) => onUpdate((a) => ({ ...a, bookingNote: e.target.value }))} placeholder="Номер брони, место, вагон..." className="text-sm" />
          )}
        </div>
      )}
    </div>
  );
}
