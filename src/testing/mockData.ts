import type { QualityScores, TripType } from '@/types';

interface MockTripData {
  scores: QualityScores;
  budgetEstimate: number;
}

// Simulate fetching trip data with random delay
export async function fetchTripData(
  _destination: string,
  _countryCode: string,
  startDate: Date,
  endDate: Date,
  tripType: TripType
): Promise<MockTripData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

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
    scores,
    budgetEstimate,
  };
}
