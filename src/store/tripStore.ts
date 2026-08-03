import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trip } from '@/types/trip';

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  setCurrentTrip: (trip: Trip | null) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: [],
      currentTrip: null,
      addTrip: (trip) => set((s) => ({ trips: [...s.trips, trip] })),
      updateTrip: (trip) => set((s) => ({
        trips: s.trips.map((t) => (t.id === trip.id ? trip : t)),
        currentTrip: s.currentTrip?.id === trip.id ? trip : s.currentTrip,
      })),
      deleteTrip: (id) => set((s) => ({
        trips: s.trips.filter((t) => t.id !== id),
        currentTrip: s.currentTrip?.id === id ? null : s.currentTrip,
      })),
      setCurrentTrip: (trip) => set({ currentTrip: trip }),
    }),
    { name: 'nexvi-storage' }
  )
);