import type { BudgetTierEstimate, BudgetTiers, QualityScores } from '@/types';

interface MockTripData {
  scores: QualityScores;
  budgetEstimate: BudgetTiers;
}

interface CountrySafetyContext {
  region?: string;
  subregion?: string;
  borders?: string[];
}

const FALLBACK_COST_MULTIPLIER = 0.75;
const FALLBACK_SAFETY_SCORE = 50;
const RUSSIA_BORDER_SAFETY_PENALTY = 30;

const countryCostIndex: Record<string, number> = {
  CH: 1.45,
  BM: 1.42,
  IS: 1.25,
  NO: 1.18,
  DK: 1.12,
  SG: 1.1,
  US: 1,
  AU: 0.98,
  IE: 0.96,
  NL: 0.92,
  IL: 0.91,
  CA: 0.89,
  GB: 0.88,
  DE: 0.87,
  FR: 0.84,
  AT: 0.83,
  KR: 0.81,
  IT: 0.76,
  JP: 0.72,
  ES: 0.72,
  CZ: 0.68,
  PT: 0.65,
  GR: 0.64,
  EE: 0.62,
  PL: 0.58,
  HU: 0.55,
  MX: 0.52,
  BR: 0.48,
  CN: 0.45,
  AR: 0.44,
  TH: 0.42,
  MY: 0.4,
  TR: 0.38,
  ZA: 0.37,
  PH: 0.35,
  VN: 0.34,
  CO: 0.33,
  ID: 0.32,
  UA: 0.3,
  EG: 0.28,
  IN: 0.26,
  PK: 0.22,
  NG: 0.21,
  BD: 0.2,
};

const countrySafetyScores: Record<string, number> = {
  CH: 91,
  BM: 82,
  IS: 94,
  NO: 90,
  DK: 92,
  SG: 95,
  US: 70,
  AU: 88,
  IE: 86,
  NL: 87,
  IL: 67,
  CA: 87,
  GB: 82,
  DE: 84,
  FR: 78,
  AT: 89,
  KR: 83,
  IT: 77,
  JP: 94,
  ES: 83,
  CZ: 86,
  PT: 88,
  GR: 76,
  EE: 84,
  PL: 83,
  HU: 78,
  MX: 56,
  BR: 52,
  CN: 78,
  AR: 62,
  TH: 69,
  MY: 73,
  TR: 61,
  ZA: 45,
  PH: 55,
  VN: 74,
  CO: 53,
  ID: 67,
  UA: 42,
  EG: 58,
  IN: 57,
  PK: 41,
  NG: 38,
  BD: 48,
};

const regionalSafety: {
  regions: Record<string, number>;
  subregions: Record<string, number>;
} = {
  regions: {
    Europe: 82,
    Oceania: 85,
    Asia: 68,
    Americas: 55,
    Africa: 42,
    Antarctic: 99,
  },
  subregions: {
    'Northern Europe': 92,
    'Western Europe': 85,
    'Central Europe': 84,
    'Southern Europe': 78,
    'South-Eastern Asia': 65,
    'Eastern Asia': 84,
    'Southern Asia': 45,
    'Northern America': 75,
    'South America': 48,
    'Central America': 42,
    'Northern Africa': 45,
    'Sub-Saharan Africa': 35,
    'Australia and New Zealand': 88,
    Polynesia: 70,
  },
};

function normalizeCountryCode(countryCode: string) {
  return countryCode.trim().toUpperCase();
}

function getCostMultiplier(countryCode: string) {
  return countryCostIndex[normalizeCountryCode(countryCode)] ?? FALLBACK_COST_MULTIPLIER;
}

function getBaseSafetyScore(countryCode: string, safetyContext?: CountrySafetyContext) {
  const normalizedCountryCode = normalizeCountryCode(countryCode);

  if (countrySafetyScores[normalizedCountryCode]) {
    return countrySafetyScores[normalizedCountryCode];
  }

  if (safetyContext?.subregion && regionalSafety.subregions[safetyContext.subregion]) {
    return regionalSafety.subregions[safetyContext.subregion];
  }

  if (safetyContext?.region && regionalSafety.regions[safetyContext.region]) {
    return regionalSafety.regions[safetyContext.region];
  }

  return FALLBACK_SAFETY_SCORE;
}

function getSafetyScore(countryCode: string, safetyContext?: CountrySafetyContext) {
  const baseSafetyScore = getBaseSafetyScore(countryCode, safetyContext);
  const bordersRussia = safetyContext?.borders?.includes('RUS') ?? false;

  if (!bordersRussia) {
    return baseSafetyScore;
  }

  return Math.max(0, baseSafetyScore - RUSSIA_BORDER_SAFETY_PENALTY);
}

function calculateTier(dailyBaseCost: number, multiplier: number, days: number): BudgetTierEstimate {
  const daily = Math.round(dailyBaseCost * multiplier);

  return {
    daily,
    total: daily * days,
  };
}

function calculateTripTiers(countryCode: string, days: number): BudgetTiers {
  const multiplier = getCostMultiplier(countryCode);

  return {
    budget: calculateTier(50, multiplier, days),
    moderate: calculateTier(120, multiplier, days),
    expensive: calculateTier(300, multiplier, days),
  };
}

export async function fetchTripData(
  _destination: string,
  countryCode: string,
  startDate: Date,
  endDate: Date,
  safetyContext?: CountrySafetyContext
): Promise<MockTripData> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const days = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  const scores: QualityScores = {
    safety: getSafetyScore(countryCode, safetyContext),
    costOfLiving: Math.min(100, Math.round(getCostMultiplier(countryCode) * 100)),
  };

  return {
    scores,
    budgetEstimate: calculateTripTiers(countryCode, days),
  };
}
