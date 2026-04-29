export interface CountryEssentials {
  drive: 'left' | 'right';
  plug: string;
  voltage: string;
}

export const countryEssentials: Record<string, CountryEssentials> = {
  GB: { drive: 'left', plug: 'Type G', voltage: '230V' },
  IE: { drive: 'left', plug: 'Type G', voltage: '230V' },
  AU: { drive: 'left', plug: 'Type I', voltage: '230V' },
  NZ: { drive: 'left', plug: 'Type I', voltage: '230V' },
  IN: { drive: 'left', plug: 'Type D, M', voltage: '230V' },
  ZA: { drive: 'left', plug: 'Type D, M, N', voltage: '230V' },
  JP: { drive: 'left', plug: 'Type A, B', voltage: '100V' },
  HK: { drive: 'left', plug: 'Type G', voltage: '220V' },
  SG: { drive: 'left', plug: 'Type G', voltage: '230V' },
  TH: { drive: 'left', plug: 'Type A, B, C, O', voltage: '220V' },
  US: { drive: 'right', plug: 'Type A, B', voltage: '120V' },
  CA: { drive: 'right', plug: 'Type A, B', voltage: '120V' },
  MX: { drive: 'right', plug: 'Type A, B', voltage: '127V' },
  CH: { drive: 'right', plug: 'Type J', voltage: '230V' },
  IT: { drive: 'right', plug: 'Type L', voltage: '230V' },
  IL: { drive: 'right', plug: 'Type H', voltage: '230V' },
  BR: { drive: 'right', plug: 'Type N', voltage: '127/220V' },
  DK: { drive: 'right', plug: 'Type K', voltage: '230V' },
};

export function getCountryEssentials(countryCode: string): CountryEssentials | null {
  return countryEssentials[countryCode.trim().toUpperCase()] ?? null;
}
