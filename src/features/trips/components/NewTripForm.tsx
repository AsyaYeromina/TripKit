import { type ChangeEvent, type FormEvent, useState } from "react";
import { format } from "date-fns";
import { ArrowRight, CalendarIcon, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useCitySearch,
  type CitySearchResult,
} from "@/features/trips/hooks/useCitySearch";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { cn } from "@/lib/utils";
import type { TripType } from "@/types";

const tripTypes: TripType[] = ["leisure", "business", "adventure"];

const tripTypeStyles: Record<TripType, { active: string; inactive: string }> = {
  leisure: {
    active: "bg-violet-600 text-white border-violet-600",
    inactive: "hover:border-violet-300 hover:text-violet-600",
  },
  business: {
    active: "bg-blue-600 text-white border-blue-600",
    inactive: "hover:border-blue-300 hover:text-blue-600",
  },
  adventure: {
    active: "bg-orange-500 text-white border-orange-500",
    inactive: "hover:border-orange-300 hover:text-orange-600",
  },
};

function formatTripType(type: TripType) {
  return type[0].toUpperCase() + type.slice(1);
}

function formatCityOption(city: CitySearchResult) {
  const region =
    city.admin1 && city.admin1 !== city.name ? `${city.admin1}, ` : "";
  return `${city.name}, ${region}${city.country}`;
}

export function NewTripForm() {
  const { addTrip, setShowNewTripForm } = useTrips();
  const [destination, setDestination] = useState("");
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(
    null,
  );
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [tripType, setTripType] = useState<TripType>("leisure");
  const citySearch = useCitySearch(destination);

  const handleDestinationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDestination(event.target.value);
    setSelectedCity(null);
    setIsDestinationOpen(true);
  };

  const handleSelectCity = (city: CitySearchResult) => {
    setDestination(formatCityOption(city));
    setSelectedCity(city);
    setIsDestinationOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !startDate || !endDate) return;

    addTrip({
      id: crypto.randomUUID(),
      city: selectedCity.name,
      countryCode: selectedCity.countryCode,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      timezone: selectedCity.timezone ?? undefined,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      type: tripType,
      createdAt: new Date().toISOString(),
    });
  };

  const shouldShowDestinationMenu =
    isDestinationOpen && destination.trim().length >= 2 && !selectedCity;
  const isValid = Boolean(selectedCity && startDate && endDate);

  return (
    <div className="flex items-center justify-center h-full px-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Plan a new trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Destination */}
            <div className="relative flex flex-col gap-2">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <Input
                  id="destination"
                  role="combobox"
                  aria-controls="destination-options"
                  aria-expanded={shouldShowDestinationMenu}
                  aria-autocomplete="list"
                  autoComplete="off"
                  placeholder="Search for a city"
                  value={destination}
                  onBlur={() => setIsDestinationOpen(false)}
                  onChange={handleDestinationChange}
                  onFocus={() => setIsDestinationOpen(true)}
                  className="h-11 pr-10"
                />
                <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {shouldShowDestinationMenu && (
                <div
                  id="destination-options"
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
                >
                  {citySearch.isLoading ? (
                    <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching cities
                    </div>
                  ) : citySearch.error ? (
                    <div className="px-3 py-3 text-sm text-destructive">
                      {citySearch.error}
                    </div>
                  ) : citySearch.data.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto p-1">
                      {citySearch.data.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectCity(city)}
                          className="flex w-full cursor-pointer items-start gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden"
                        >
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex flex-col">
                            <span className="font-medium">{city.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {city.admin1 && city.admin1 !== city.name
                                ? `${city.admin1}, `
                                : ""}
                              {city.country}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-3 text-sm text-muted-foreground">
                      No cities found
                    </div>
                  )}
                </div>
              )}
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
                        "flex-1 h-11 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "MMM d, yyyy")
                        : "Start date"}
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
                        "flex-1 h-11 justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
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
                      "flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all",
                      tripType === type
                        ? tripTypeStyles[type].active
                        : `border-border ${tripTypeStyles[type].inactive}`,
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
