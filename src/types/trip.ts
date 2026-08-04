export interface Activity {
  id: string;
  time?: string;
  title: string;
  description: string;
  location: string;
  notes: string;
  cost?: number;
  hours?: string;
  booked?: boolean;
  bookingNote?: string;
  icon?: string;
  photo?: string;
}

export interface RouteLeg {
  id: string;
  from: string;
  to: string;
  mode: string;
  cost?: number;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  title: string;
  icon?: string;
  route: RouteLeg[];
  activities: Activity[];
}

export interface TripPreferences {
  beach: boolean;
  culture: boolean;
  adventure: boolean;
  food: boolean;
  nightlife: boolean;
  shopping: boolean;
  relaxation: boolean;
  nature: boolean;
  pace: 'relaxed' | 'moderate' | 'packed';
  interests: string[];
  travelGroup: 'solo' | 'couple' | 'family' | 'group';
  transportation: 'walking' | 'public' | 'car' | 'rental';
  wishes?: string;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget?: 'economy' | 'comfort' | 'premium';
  currency?: string;
  preferences: TripPreferences;
  days: DayPlan[];
  createdAt: string;
  updatedAt: string;
}
