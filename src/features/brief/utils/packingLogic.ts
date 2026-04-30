import type { TripType, WeatherDay } from '@/types';

const UMBRELLA_PRECIPITATION_THRESHOLD_MM = 1;
const SUNSCREEN_UV_INDEX_THRESHOLD = 3;
const WARM_CLOTHES_TEMPERATURE_C = 15;
const COLD_TEMPERATURE_C = 10;
const HAT_TEMPERATURE_C = 25;

export type LuggageType = 'backpack' | 'small-suitcase' | 'multiple-suitcases';

export interface PackingPlan {
  clothingSets: number;
  suggestions: string[];
  luggage: {
    type: LuggageType;
    title: string;
    description: string;
  };
}

function getLuggageRecommendation(
  clothingSets: number,
  maxHigh: number,
  minLow: number
): PackingPlan['luggage'] {
  if (clothingSets > 25) {
    return {
      type: 'multiple-suitcases',
      title: 'More suitcases needed',
      description: 'This trip needs more than 25 clothing sets, so plan for multiple bags.',
    };
  }

  if (clothingSets < 5 || (maxHigh > HAT_TEMPERATURE_C && clothingSets < 10)) {
    return {
      type: 'backpack',
      title: 'Backpack is enough',
      description: 'No additional airplane luggage should be needed for this packing load.',
    };
  }

  if (clothingSets > 5 || minLow < COLD_TEMPERATURE_C) {
    return {
      type: 'small-suitcase',
      title: 'Small suitcase recommended',
      description: 'Extra clothing volume or colder weather makes a small suitcase a better fit.',
    };
  }

  return {
    type: 'backpack',
    title: 'Backpack is enough',
    description: 'No additional airplane luggage should be needed for this packing load.',
  };
}

export function getPackingPlan(
  weather: WeatherDay[],
  tripType: TripType,
  duration: number
): PackingPlan {
  const suggestions: string[] = [];
  const needsUmbrella = weather.some(
    (day) => day.precipitationSum >= UMBRELLA_PRECIPITATION_THRESHOLD_MM
  );
  const needsSunscreen = weather.some(
    (day) => day.uvIndexMax >= SUNSCREEN_UV_INDEX_THRESHOLD
  );
  const maxHigh = weather.length > 0 ? Math.max(...weather.map((day) => day.high)) : 0;
  const minLow = weather.length > 0 ? Math.min(...weather.map((day) => day.low)) : 0;
  const clothingSets = Math.max(1, duration);

  suggestions.push(`${clothingSets} daily clothing ${clothingSets === 1 ? 'set' : 'sets'}`);
  suggestions.push('Pack one fresh outfit for each travel day');
  if (needsUmbrella) suggestions.push('☂️ Bring an umbrella');
  if (needsSunscreen) {
    suggestions.push('🧴 UV index is 3 or higher on some days; WHO recommends sunscreen');
  }
  if (minLow < WARM_CLOTHES_TEMPERATURE_C) {
    suggestions.push('🧥 Some days are below +15°C; add warm clothes');
  }
  if (maxHigh > HAT_TEMPERATURE_C) {
    suggestions.push('🧢 Some days are above +25°C; wear a hat');
  }

  if (tripType === 'business') suggestions.push('👔 Business attire needed');
  if (tripType === 'adventure') suggestions.push('🥾 Comfortable walking shoes');
  if (tripType === 'leisure') suggestions.push('📸 Don\'t forget your camera');

  return {
    clothingSets,
    suggestions,
    luggage: getLuggageRecommendation(clothingSets, maxHigh, minLow),
  };
}
