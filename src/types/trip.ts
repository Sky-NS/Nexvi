export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  notes: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  title: string;
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
  transportation: 'walking' | 'public' | 'car';
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget?: 'economy' | 'comfort' | 'premium';
  preferences: TripPreferences;
  days: DayPlan[];
  createdAt: string;
  updatedAt: string;
}