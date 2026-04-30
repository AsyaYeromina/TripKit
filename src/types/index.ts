export type TripType = 'leisure' | 'business' | 'adventure';

export interface Trip {
  id: string;
  city: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
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
  currentTime: string;
  region: string;
  subregion: string;
  borders: string[];
  flag: string;
}

export interface QualityScores {
  safety: number;
  costOfLiving: number;
}

export interface BudgetTierEstimate {
  daily: number;
  total: number;
}

export interface BudgetTiers {
  budget: BudgetTierEstimate;
  moderate: BudgetTierEstimate;
  expensive: BudgetTierEstimate;
}

export interface TripData {
  weather: WeatherDay[];
  intel: DestinationIntel;
  scores: QualityScores;
  budgetEstimate: BudgetTiers;
  packingSuggestions: string[];
}
