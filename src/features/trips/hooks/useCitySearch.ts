import { useEffect, useState } from 'react';
import { OPEN_METEO_GEOCODING_URL } from '@/config/constants';

export interface CitySearchResult {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  admin1: string | null;
  latitude: number;
  longitude: number;
}

interface CitySearchState {
  data: CitySearchResult[];
  isLoading: boolean;
  error: string | null;
}

interface CitySearchRequestState extends CitySearchState {
  query: string;
}

interface OpenMeteoGeocodingResult {
  id: number;
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
  error?: boolean;
  reason?: string;
}

const DEBOUNCE_DELAY_MS = 400;
const MAX_RESULTS = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isOpenMeteoGeocodingResult(value: unknown): value is OpenMeteoGeocodingResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.country === 'string' &&
    typeof value.country_code === 'string' &&
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number' &&
    (typeof value.admin1 === 'string' || typeof value.admin1 === 'undefined')
  );
}

function parseOpenMeteoResponse(value: unknown): OpenMeteoGeocodingResponse {
  if (!isRecord(value)) {
    return {};
  }

  const results = Array.isArray(value.results)
    ? value.results.filter(isOpenMeteoGeocodingResult)
    : undefined;

  return {
    results,
    error: typeof value.error === 'boolean' ? value.error : undefined,
    reason: typeof value.reason === 'string' ? value.reason : undefined,
  };
}

function toCitySearchResult(result: OpenMeteoGeocodingResult): CitySearchResult {
  return {
    id: result.id,
    name: result.name,
    country: result.country,
    countryCode: result.country_code,
    admin1: result.admin1?.trim() || null,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export function useCitySearch(input: string): CitySearchState {
  const query = input.trim();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [state, setState] = useState<CitySearchRequestState>({
    query: '',
    data: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      name: debouncedQuery,
      count: String(MAX_RESULTS),
      language: 'en',
      format: 'json',
    });

    fetch(`${OPEN_METEO_GEOCODING_URL}?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = parseOpenMeteoResponse(await response.json());

        if (!response.ok || body.error) {
          throw new Error(body.reason || 'Could not load city suggestions.');
        }

        return body.results?.map(toCitySearchResult) ?? [];
      })
      .then((results) => {
        setState({
          query: debouncedQuery,
          data: results,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setState({
          query: debouncedQuery,
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Could not load city suggestions.',
        });
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  if (query.length < 2) {
    return { data: [], isLoading: false, error: null };
  }

  if (debouncedQuery !== query || state.query !== debouncedQuery) {
    return { data: [], isLoading: true, error: null };
  }

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
  };
}
