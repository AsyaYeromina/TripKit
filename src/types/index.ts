export type TripType = 'leisure' | 'business' | 'adventure';

export interface Trip {
  id: string;
  city: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
  type: TripType;
  createdAt: string;
}

export interface WeatherDay {
  day: string;
  icon: 'sun' | 'cloud' | 'rain' | 'partly-cloudy';
  high: number;
  low: number;
  precipitationSum: number;
  uvIndexMax: number;
}

export interface DestinationIntel {
  currency: string;
  currencySymbol: string;
  language: string;
  timezone: string;
  emergencyNumber: string;
}

export interface QualityScores {
  safety: number;
  costOfLiving: number;
  internetSpeed: number;
  nightlife: number;
}

export interface TripData {
  weather: WeatherDay[];
  intel: DestinationIntel;
  scores: QualityScores;
  budgetEstimate: number;
  packingSuggestions: string[];
}
