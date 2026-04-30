import { useEffect, useState } from 'react';
import { REST_COUNTRIES_URL } from '@/config/constants';
import type { DestinationIntel } from '@/types';

interface CountryState {
  data: DestinationIntel | null;
  isLoading: boolean;
  error: string | null;
}

interface CountryRequestState extends CountryState {
  requestKey: string;
}

interface RestCountryCurrency {
  name?: unknown;
  symbol?: unknown;
}

interface RestCountryResponse {
  currencies?: unknown;
  languages?: unknown;
  timezones?: unknown;
  region?: unknown;
  subregion?: unknown;
  borders?: unknown;
  flag?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function parseCountryResponse(value: unknown): RestCountryResponse {
  const country = Array.isArray(value) ? value[0] : value;

  if (!isRecord(country)) {
    return {};
  }

  return {
    currencies: country.currencies,
    languages: country.languages,
    timezones: country.timezones,
    region: country.region,
    subregion: country.subregion,
    borders: country.borders,
    flag: country.flag,
  };
}

function getCurrency(currencies: unknown): Pick<DestinationIntel, 'currency' | 'currencySymbol'> {
  if (!isRecord(currencies)) {
    throw new Error('Country currency data returned in an unexpected format.');
  }

  const firstCurrency = Object.values(currencies).find(isRecord) as RestCountryCurrency | undefined;

  if (!firstCurrency || typeof firstCurrency.name !== 'string') {
    throw new Error('Country currency data returned in an unexpected format.');
  }

  return {
    currency: firstCurrency.name,
    currencySymbol: typeof firstCurrency.symbol === 'string' ? firstCurrency.symbol : firstCurrency.name,
  };
}

function getLanguage(languages: unknown): string {
  if (!isRecord(languages)) {
    throw new Error('Country language data returned in an unexpected format.');
  }

  const language = Object.values(languages).find((value) => typeof value === 'string');

  if (typeof language !== 'string') {
    throw new Error('Country language data returned in an unexpected format.');
  }

  return language;
}

function getTimezone(timezones: unknown): string {
  if (!Array.isArray(timezones)) {
    throw new Error('Country timezone data returned in an unexpected format.');
  }

  const timezone = timezones.find((value) => typeof value === 'string');

  if (typeof timezone !== 'string') {
    throw new Error('Country timezone data returned in an unexpected format.');
  }

  return timezone;
}

function getRegion(region: unknown): string {
  return typeof region === 'string' ? region : '';
}

function getSubregion(subregion: unknown): string {
  return typeof subregion === 'string' ? subregion : '';
}

function getBorders(borders: unknown): string[] {
  if (typeof borders === 'undefined') {
    return [];
  }

  if (!Array.isArray(borders)) {
    throw new Error('Country border data returned in an unexpected format.');
  }

  return borders.filter((border): border is string => typeof border === 'string');
}

function getFlag(flag: unknown): string {
  return typeof flag === 'string' ? flag : '';
}

function getCurrentTimeForUtcOffset(timezone: string): string {
  const match = /^UTC(?:(?<sign>[+-])(?<hours>\d{2})(?::?(?<minutes>\d{2}))?)?$/.exec(timezone);

  if (!match?.groups) {
    return 'Local time unavailable';
  }

  const sign = match.groups.sign === '-' ? -1 : 1;
  const hours = Number(match.groups.hours ?? 0);
  const minutes = Number(match.groups.minutes ?? 0);
  const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;
  const localDate = new Date(Date.now() + offsetMs);

  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }).format(localDate);
}

function getCurrentTimeForIanaTimezone(timezone: string): string | null {
  try {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return null;
  }
}

function getOffsetLabelForIanaTimezone(timezone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    return parts.find((part) => part.type === 'timeZoneName')?.value ?? null;
  } catch {
    return null;
  }
}

function mapCountryIntel(country: RestCountryResponse, ianaTimezone?: string): DestinationIntel {
  const currency = getCurrency(country.currencies);
  const fallbackTimezone = getTimezone(country.timezones);
  const currentTime = ianaTimezone ? getCurrentTimeForIanaTimezone(ianaTimezone) : null;
  const currentOffset = ianaTimezone ? getOffsetLabelForIanaTimezone(ianaTimezone) : null;
  const timezone = ianaTimezone
    ? `${ianaTimezone}${currentOffset ? ` (${currentOffset})` : ''}`
    : fallbackTimezone;

  return {
    ...currency,
    language: getLanguage(country.languages),
    timezone,
    currentTime: currentTime ?? getCurrentTimeForUtcOffset(fallbackTimezone),
    region: getRegion(country.region),
    subregion: getSubregion(country.subregion),
    borders: getBorders(country.borders),
    flag: getFlag(country.flag),
  };
}

export function useCountry(countryCode: string, ianaTimezone?: string): CountryState {
  const normalizedCountryCode = countryCode.trim().toUpperCase();
  const requestKey = `${normalizedCountryCode}:${ianaTimezone ?? ''}`;
  const [state, setState] = useState<CountryRequestState>({
    requestKey: '',
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!normalizedCountryCode) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      fields: 'currencies,languages,timezones,region,subregion,borders,flag',
    });

    fetch(`${REST_COUNTRIES_URL}/alpha/${encodeURIComponent(normalizedCountryCode)}?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = parseCountryResponse(await response.json());

        if (!response.ok) {
          throw new Error('Could not load destination details.');
        }

        return mapCountryIntel(body, ianaTimezone);
      })
      .then((country) => {
        setState({ requestKey, data: country, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setState({
          requestKey,
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Could not load destination details.',
        });
      });

    return () => {
      controller.abort();
    };
  }, [ianaTimezone, normalizedCountryCode, requestKey]);

  if (!normalizedCountryCode) {
    return { data: null, isLoading: false, error: 'Destination details are unavailable.' };
  }

  if (state.requestKey !== requestKey) {
    return { data: null, isLoading: true, error: null };
  }

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
  };
}
