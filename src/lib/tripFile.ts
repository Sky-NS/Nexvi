import { v4 as uuidv4 } from 'uuid';
import { Trip } from '@/types/trip';

const FILE_APP_ID = 'voyafio';
const FILE_VERSION = 1;

function sanitizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      // \p{L}/\p{N} are Unicode-aware, so Cyrillic and other non-Latin
      // destination names still produce a readable filename instead of
      // being stripped down to nothing.
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'trip'
  );
}

// Downloads the trip as a small JSON file the user can send however they
// like (messenger, email, AirDrop, ...) — no account or server involved.
export function exportTripToFile(trip: Trip) {
  const envelope = {
    app: FILE_APP_ID,
    fileVersion: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    trip,
  };
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(trip.destination)}-${trip.startDate || 'plan'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function looksLikeTrip(t: unknown): t is Trip {
  if (!t || typeof t !== 'object') return false;
  const c = t as Record<string, unknown>;
  return (
    typeof c.destination === 'string' &&
    typeof c.startDate === 'string' &&
    typeof c.endDate === 'string' &&
    Array.isArray(c.days) &&
    typeof c.preferences === 'object' && c.preferences !== null
  );
}

export type ImportResult = { trip: Trip } | { error: 'invalid_json' | 'invalid_shape' };

// Accepts either the full envelope this app writes, or a bare Trip object
// (in case someone hand-edits or re-exports one) — either way, the result
// gets a fresh id/timestamps, since it's a new entry in the importer's own
// list, not a synced copy of the sender's.
export function parseTripFile(content: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return { error: 'invalid_json' };
  }

  const candidate = (data && typeof data === 'object' && 'trip' in (data as object))
    ? (data as { trip: unknown }).trip
    : data;

  if (!looksLikeTrip(candidate)) return { error: 'invalid_shape' };

  const now = new Date().toISOString();
  return {
    trip: {
      ...candidate,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    },
  };
}
