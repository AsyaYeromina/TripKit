import { useEffect, useState } from 'react';
import { differenceInDays, format, parseISO } from 'date-fns';
import {
  Backpack,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCopy,
  Cloud,
  CloudRain,
  CloudSun,
  CarFront,
  Link2,
  Luggage,
  CalendarClock,
  PlugZap,
  Sun,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCountry } from '@/features/brief/hooks/useCountry';
import { useWeather } from '@/features/brief/hooks/useWeather';
import { getCountryEssentials } from '@/features/brief/utils/countryEssentials';
import { getPackingPlan, type LuggageType } from '@/features/brief/utils/packingLogic';
import { cn } from '@/lib/utils';
import { fetchTripData } from '@/testing/mockData';
import type { QualityScores, Trip, TripType, WeatherDay } from '@/types';
import { getFlagEmoji } from '@/utils/flagEmoji';

const tripTypeBadgeColors: Record<TripType, string> = {
  leisure: 'bg-violet-100 text-violet-700',
  business: 'bg-blue-100 text-blue-700',
  adventure: 'bg-orange-100 text-orange-700',
};

const WeatherIcon = ({ icon }: { icon: WeatherDay['icon'] }) => {
  switch (icon) {
    case 'sun':
      return <Sun className="h-5 w-5 text-amber-500" />;
    case 'cloud':
      return <Cloud className="h-5 w-5 text-slate-400" />;
    case 'rain':
      return <CloudRain className="h-5 w-5 text-blue-500" />;
    case 'partly-cloudy':
      return <CloudSun className="h-5 w-5 text-amber-400" />;
  }
};

function getScoreColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getScoreColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function formatTripType(type: TripType) {
  return type[0].toUpperCase() + type.slice(1)
}

function LuggageIcon({ type }: { type: LuggageType }) {
  if (type === 'backpack') {
    return <Backpack className="h-5 w-5 text-primary" />;
  }

  if (type === 'small-suitcase') {
    return <Luggage className="h-5 w-5 text-primary" />;
  }

  return <BriefcaseBusiness className="h-5 w-5 text-primary" />;
}

export function TripCard({ trip }: { trip: Trip }) {
  const scoreRequestKey = [
    trip.city,
    trip.countryCode,
    trip.startDate,
    trip.endDate,
    trip.type,
  ].join(':');
  const [scoreState, setScoreState] = useState<{
    requestKey: string;
    scores: QualityScores;
    budgetEstimate: number;
  } | null>(null);

  const startDate = parseISO(trip.startDate)
  const endDate = parseISO(trip.endDate)
  const duration = differenceInDays(endDate, startDate) + 1;
  const dateRange = `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;
  const country = useCountry(trip.countryCode, trip.timezone);
  const essentials = getCountryEssentials(trip.countryCode);
  const weather = useWeather({
    latitude: trip.latitude,
    longitude: trip.longitude,
    startDate: trip.startDate,
    endDate: trip.endDate,
  });
  const packingPlan = weather.data
    ? getPackingPlan(weather.data, trip.type, duration)
    : null;

  useEffect(() => {
    let isCurrentRequest = true;
    const requestStartDate = parseISO(trip.startDate);
    const requestEndDate = parseISO(trip.endDate);

    fetchTripData(trip.city, trip.countryCode, requestStartDate, requestEndDate, trip.type).then(
      (result) => {
        if (!isCurrentRequest) {
          return;
        }

        setScoreState({
          requestKey: scoreRequestKey,
          ...result,
        });
      }
    );
    return () => {
      isCurrentRequest = false;
    };
  }, [scoreRequestKey, trip.city, trip.countryCode, trip.endDate, trip.startDate, trip.type]);

  const data = scoreState?.requestKey === scoreRequestKey ? scoreState : null;
  const loading = !data;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{getFlagEmoji(trip.countryCode)}</span>
                  <h1 className="text-3xl font-bold">{trip.city}</h1>
                </div>
                <p className="text-muted-foreground mb-3">
                  {dateRange} · {duration} {duration === 1 ? 'day' : 'days'}
                </p>
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-sm font-medium',
                    tripTypeBadgeColors[trip.type]
                  )}
                >
                  {formatTripType(trip.type)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Link2 className="h-4 w-4 mr-1.5" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <ClipboardCopy className="h-4 w-4 mr-1.5" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <CalendarDays className="h-4 w-4 mr-1.5" />
                  Calendar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Strip */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weather Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            {weather.isLoading ? (
              <div className="flex flex-col gap-4">
                <div className="flex gap-3 overflow-hidden">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-16 rounded-lg flex-shrink-0" />
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-48" />
                </div>
              </div>
            ) : weather.error ? (
              weather.errorType === 'forecast-unavailable' ? (
                <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                  <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Weather forecast is not available yet</p>
                    <p className="text-sm text-muted-foreground">
                      More weather data will be available closer to your trip dates.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{weather.error}</p>
              )
            ) : (
              <>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-3 pb-3">
                    {weather.data?.map((day, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1.5 p-3 bg-muted rounded-lg min-w-[64px]"
                      >
                        <span className="text-xs font-medium text-muted-foreground">{day.day}</span>
                        <WeatherIcon icon={day.icon} />
                        <div className="text-xs">
                          <span className="font-semibold">{day.high}°</span>
                          <span className="text-muted-foreground">/{day.low}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Packing Suggestions</h4>
                  <div className="flex flex-wrap gap-2">
                    {packingPlan?.suggestions.map((suggestion, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground"
                      >
                        {suggestion}
                      </span>
                    ))}
                  </div>
                  {packingPlan && (
                    <div className="mt-4 rounded-lg border bg-background p-4">
                      <h4 className="text-sm font-medium mb-3">Luggage Recommendation</h4>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                          <LuggageIcon type={packingPlan.luggage.type} />
                        </div>
                        <div>
                          <p className="font-medium">{packingPlan.luggage.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {packingPlan.luggage.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Destination Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Destination Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {country.isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : country.error ? (
              <p className="text-sm text-muted-foreground">{country.error}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl mb-1">💶</div>
                  <div className="text-sm text-muted-foreground">Currency</div>
                  <div className="font-semibold">
                    {country.data?.currency} ({country.data?.currencySymbol})
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl mb-1">🗣️</div>
                  <div className="text-sm text-muted-foreground">Language</div>
                  <div className="font-semibold">{country.data?.language}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl mb-1">🕐</div>
                  <div className="text-sm text-muted-foreground">Timezone</div>
                  <div className="font-semibold">{country.data?.timezone}</div>
                  <div className="text-sm text-muted-foreground">
                    Current time: {country.data?.currentTime}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <PlugZap className="h-5 w-5" />
                    <Zap className="h-5 w-5" />
                    <CarFront className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-muted-foreground">Travel Essentials</div>
                  {essentials ? (
                    <div className="mt-1 space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Plug:</span>{' '}
                        <span className="font-semibold">{essentials.plug}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Voltage:</span>{' '}
                        <span className="font-semibold">{essentials.voltage}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Driving:</span>{' '}
                        <span className="font-semibold capitalize">{essentials.drive}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Travel essentials are not available for this country yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quality Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <ScoreBar label="Safety" score={data?.scores.safety || 0} />
                <ScoreBar label="Cost of Living" score={data?.scores.costOfLiving || 0} />
                <ScoreBar label="Internet Speed" score={data?.scores.internetSpeed || 0} />
                <ScoreBar label="Nightlife" score={data?.scores.nightlife || 0} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Estimate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
            ) : (
              <>
                <p className="text-4xl font-bold text-primary">
                  ~€{data?.budgetEstimate?.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on cost of living index × {duration} days ×{' '}
                  {trip.type} multiplier
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
