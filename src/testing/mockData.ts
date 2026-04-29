import type { DestinationIntel, QualityScores, TripData, TripType, WeatherDay } from '@/types';

// Simulate fetching trip data with random delay
export async function fetchTripData(
  _destination: string,
  country: string,
  startDate: Date,
  endDate: Date,
  tripType: TripType
): Promise<TripData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Generate weather data
  const weather: WeatherDay[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const icons: WeatherDay['icon'][] = ['sun', 'cloud', 'rain', 'partly-cloudy'];
  
  for (let i = 0; i < Math.min(days, 7); i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    weather.push({
      day: dayNames[date.getDay()],
      icon: icons[Math.floor(Math.random() * icons.length)],
      high: Math.floor(20 + Math.random() * 15),
      low: Math.floor(10 + Math.random() * 10),
    });
  }

  // Generate intel based on country
  const intel = getIntelForCountry(country);

  // Generate quality scores
  const scores: QualityScores = {
    safety: Math.floor(60 + Math.random() * 40),
    costOfLiving: Math.floor(30 + Math.random() * 60),
    internetSpeed: Math.floor(50 + Math.random() * 50),
    nightlife: Math.floor(40 + Math.random() * 55),
  };

  // Calculate budget estimate
  const costMultiplier = tripType === 'business' ? 1.5 : tripType === 'adventure' ? 1.2 : 1;
  const baseDailyCost = 60 + (100 - scores.costOfLiving) * 0.8;
  const budgetEstimate = Math.round(baseDailyCost * days * costMultiplier);

  // Generate packing suggestions
  const packingSuggestions = getPackingSuggestions(weather, tripType);

  return {
    weather,
    intel,
    scores,
    budgetEstimate,
    packingSuggestions,
  };
}

function getIntelForCountry(country: string): DestinationIntel {
  const countryIntel: Record<string, DestinationIntel> = {
    'Portugal': { currency: 'Euro', currencySymbol: '€', language: 'Portuguese', timezone: 'WET (UTC+0)', emergencyNumber: '112' },
    'Japan': { currency: 'Yen', currencySymbol: '¥', language: 'Japanese', timezone: 'JST (UTC+9)', emergencyNumber: '110' },
    'United States': { currency: 'Dollar', currencySymbol: '$', language: 'English', timezone: 'Multiple', emergencyNumber: '911' },
    'France': { currency: 'Euro', currencySymbol: '€', language: 'French', timezone: 'CET (UTC+1)', emergencyNumber: '112' },
    'Italy': { currency: 'Euro', currencySymbol: '€', language: 'Italian', timezone: 'CET (UTC+1)', emergencyNumber: '112' },
    'Spain': { currency: 'Euro', currencySymbol: '€', language: 'Spanish', timezone: 'CET (UTC+1)', emergencyNumber: '112' },
    'Germany': { currency: 'Euro', currencySymbol: '€', language: 'German', timezone: 'CET (UTC+1)', emergencyNumber: '112' },
    'United Kingdom': { currency: 'Pound', currencySymbol: '£', language: 'English', timezone: 'GMT (UTC+0)', emergencyNumber: '999' },
    'Thailand': { currency: 'Baht', currencySymbol: '฿', language: 'Thai', timezone: 'ICT (UTC+7)', emergencyNumber: '191' },
    'Australia': { currency: 'Dollar', currencySymbol: 'A$', language: 'English', timezone: 'AEST (UTC+10)', emergencyNumber: '000' },
  };

  return countryIntel[country] || {
    currency: 'Local Currency',
    currencySymbol: '$',
    language: 'Local Language',
    timezone: 'Local Time',
    emergencyNumber: '112',
  };
}

function getPackingSuggestions(weather: WeatherDay[], tripType: TripType): string[] {
  const suggestions: string[] = [];
  
  const hasRain = weather.some((w) => w.icon === 'rain');
  const hasSun = weather.some((w) => w.icon === 'sun');
  const avgHigh = weather.reduce((sum, w) => sum + w.high, 0) / weather.length;
  
  if (hasRain) suggestions.push('☂️ Bring an umbrella');
  if (hasSun && avgHigh > 25) suggestions.push('🧴 Sunscreen recommended');
  if (avgHigh < 15) suggestions.push('🧥 Pack warm layers');
  if (avgHigh > 25) suggestions.push('👕 Light clothing advised');
  
  if (tripType === 'business') suggestions.push('👔 Business attire needed');
  if (tripType === 'adventure') suggestions.push('🥾 Comfortable walking shoes');
  if (tripType === 'leisure') suggestions.push('📸 Don\'t forget your camera');
  
  return suggestions.slice(0, 4);
}
