import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { OPEN_METEO_FORECAST_URL } from '@/config/constants';
import type { WeatherDay } from '@/types';

interface WeatherState {
  data: WeatherDay[] | null;
  isLoading: boolean;
  error: string | null;
  errorType: 'forecast-unavailable' | null;
}

interface WeatherRequestState extends WeatherState {
  requestKey: string;
}

interface UseWeatherInput {
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
}

interface OpenMeteoForecastResponse {
  daily?: {
    time?: unknown;
    weather_code?: unknown;
    temperature_2m_max?: unknown;
    temperature_2m_min?: unknown;
    precipitation_sum?: unknown;
    uv_index_max?: unknown;
  };
  error?: boolean;
  reason?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number');
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parseForecastResponse(value: unknown): OpenMeteoForecastResponse {
  if (!isRecord(value)) {
    return {};
  }

  return {
    daily: isRecord(value.daily) ? value.daily : undefined,
    error: typeof value.error === 'boolean' ? value.error : undefined,
    reason: typeof value.reason === 'string' ? value.reason : undefined,
  };
}

function getWeatherIcon(weatherCode: number): WeatherDay['icon'] {
  if (weatherCode === 0) {
    return 'sun';
  }

  if (weatherCode >= 1 && weatherCode <= 3) {
    return 'partly-cloudy';
  }

  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    weatherCode >= 95
  ) {
    return 'rain';
  }

  return 'cloud';
}

function mapDailyForecast(daily: NonNullable<OpenMeteoForecastResponse['daily']>): WeatherDay[] {
  const time = daily.time;
  const weatherCodes = daily.weather_code;
  const maxTemperatures = daily.temperature_2m_max;
  const minTemperatures = daily.temperature_2m_min;
  const precipitationSums = daily.precipitation_sum;
  const uvIndexMaxValues = daily.uv_index_max;

  if (
    !isStringArray(time) ||
    !isNumberArray(weatherCodes) ||
    !isNumberArray(maxTemperatures) ||
    !isNumberArray(minTemperatures) ||
    !isNumberArray(precipitationSums) ||
    !isNumberArray(uvIndexMaxValues)
  ) {
    throw new Error('Weather data returned in an unexpected format.');
  }

  const hasAlignedDailyValues = [
    weatherCodes,
    maxTemperatures,
    minTemperatures,
    precipitationSums,
    uvIndexMaxValues,
  ].every((values) => values.length === time.length);

  if (!hasAlignedDailyValues) {
    throw new Error('Weather data returned incomplete daily values.');
  }

  return time.map((date, index) => ({
    day: format(parseISO(date), 'EEE'),
    icon: getWeatherIcon(weatherCodes[index]),
    high: Math.round(maxTemperatures[index]),
    low: Math.round(minTemperatures[index]),
    precipitationSum: precipitationSums[index],
    uvIndexMax: uvIndexMaxValues[index],
  }));
}

export function useWeather({
  latitude,
  longitude,
  startDate,
  endDate,
}: UseWeatherInput): WeatherState {
  const requestKey =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? `${latitude}:${longitude}:${startDate}:${endDate}`
      : null;
  const [state, setState] = useState<WeatherRequestState>({
    requestKey: '',
    data: null,
    isLoading: false,
    error: null,
    errorType: null,
  });

  useEffect(() => {
    if (!requestKey || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      start_date: startDate,
      end_date: endDate,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max',
      timezone: 'auto',
    });

    fetch(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = parseForecastResponse(await response.json());

        if (!response.ok || body.error) {
          throw new Error(body.reason || 'Could not load weather forecast.');
        }

        if (!body.daily) {
          throw new Error('Weather forecast is unavailable for this period.');
        }

        return mapDailyForecast(body.daily);
      })
      .then((weather) => {
        setState({ requestKey, data: weather, isLoading: false, error: null, errorType: null });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setState({
          requestKey,
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Could not load weather forecast.',
          errorType:
            error instanceof Error && error.message.includes('out of allowed range')
              ? 'forecast-unavailable'
              : null,
        });
      });

    return () => {
      controller.abort();
    };
  }, [latitude, longitude, startDate, endDate, requestKey]);

  if (!requestKey) {
    return {
      data: null,
      isLoading: false,
      error: 'Weather forecast is unavailable for trips created before city coordinates were saved.',
      errorType: 'forecast-unavailable',
    };
  }

  if (state.requestKey !== requestKey) {
    return { data: null, isLoading: true, error: null, errorType: null };
  }

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    errorType: state.errorType,
  };
}
