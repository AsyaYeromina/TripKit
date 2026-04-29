import type { DestinationIntel, QualityScores, TripData, TripType } from '@/types';

type MockTripData = Omit<TripData, 'weather' | 'packingSuggestions'>;

// Simulate fetching trip data with random delay
export async function fetchTripData(
  _destination: string,
  countryCode: string,
  startDate: Date,
  endDate: Date,
  tripType: TripType
): Promise<MockTripData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Generate intel based on country
  const intel = getIntelForCountry(countryCode);

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

  return {
    intel,
    scores,
    budgetEstimate,
  };
}

function getIntelForCountry(countryCode: string): DestinationIntel {
  const countryIntel: Record<string, DestinationIntel> = {
    PT: { currency: 'Euro', currencySymbol: '€', language: 'Portuguese', timezone: 'WET (UTC+0)', emergencyNumber: '112' },
    JP: { currency: 'Yen', currencySymbol: '¥', language: 'Japanese', timezone: 'JST (UTC+9)', emergencyNumber: '110' },
    US: { currency: 'Dollar', currencySymbol: '$', language: 'English', timezone: 'Multiple', emergencyNumber: '911' },
    FR: { currency: 'Euro', currencySymbol: '€', language: 'French', timezone: 'CET (UTC+1)', emergencyNumber: '112' },
    IT: { currency: 'Euro', currencySymbol: '€', language: 'Italian', timezone: 'CET (UTC+1)', emergencyNumber: '112' },
    ES: { currency: 'Euro', currencySymbol: '€', language: 'Spanish', timezone: 'CET (UTC+1)', emergencyNumber: '112' },
    DE: { currency: 'Euro', currencySymbol: '€', language: 'German', timezone: 'CET (UTC+1)', emergencyNumber: '112' },
    GB: { currency: 'Pound', currencySymbol: '£', language: 'English', timezone: 'GMT (UTC+0)', emergencyNumber: '999' },
    TH: { currency: 'Baht', currencySymbol: '฿', language: 'Thai', timezone: 'ICT (UTC+7)', emergencyNumber: '191' },
    AU: { currency: 'Dollar', currencySymbol: 'A$', language: 'English', timezone: 'AEST (UTC+10)', emergencyNumber: '000' },
  };

  return countryIntel[countryCode.toUpperCase()] || {
    currency: 'Local Currency',
    currencySymbol: '$',
    language: 'Local Language',
    timezone: 'Local Time',
    emergencyNumber: '112',
  };
}
