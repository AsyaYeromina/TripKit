import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getCountryCode, getCountryFromCity } from '@/config/countryData';
import { useTrips } from '@/features/trips/hooks/useTrips';
import { cn } from '@/lib/utils';
import type { TripType } from '@/types';

const tripTypes: TripType[] = ['leisure', 'business', 'adventure'];

const tripTypeStyles: Record<TripType, { active: string; inactive: string }> = {
  leisure: {
    active: 'bg-violet-600 text-white border-violet-600',
    inactive: 'hover:border-violet-300 hover:text-violet-600',
  },
  business: {
    active: 'bg-blue-600 text-white border-blue-600',
    inactive: 'hover:border-blue-300 hover:text-blue-600',
  },
  adventure: {
    active: 'bg-orange-500 text-white border-orange-500',
    inactive: 'hover:border-orange-300 hover:text-orange-600',
  },
};

function formatTripType(type: TripType) {
  return type[0].toUpperCase() + type.slice(1)
}

export function NewTripForm() {
  const { addTrip, setShowNewTripForm } = useTrips();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [tripType, setTripType] = useState<TripType>('leisure');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) return;

    const country = getCountryFromCity(destination);
    const countryCode = getCountryCode(country);

    addTrip({
      id: crypto.randomUUID(),
      city: destination.trim(),
      countryCode,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      type: tripType,
      createdAt: new Date().toISOString(),
    });
  };

  const isValid = destination && startDate && endDate;

  return (
    <div className="flex items-center justify-center h-full px-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Plan a new trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Destination */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g. Lisbon, Tokyo, New York"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-2">
              <Label>Travel dates</Label>
              <div className="flex gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 h-11 justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (date && endDate && date > endDate) {
                          setEndDate(undefined);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 h-11 justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Trip Type */}
            <div className="flex flex-col gap-2">
              <Label>Trip type</Label>
              <div className="flex gap-2">
                {tripTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTripType(type)}
                    className={cn(
                      'flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all',
                      tripType === type
                        ? tripTypeStyles[type].active
                        : `border-border ${tripTypeStyles[type].inactive}`
                    )}
                  >
                    {formatTripType(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewTripForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Investigate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
