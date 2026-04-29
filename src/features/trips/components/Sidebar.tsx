import { differenceInDays, format, parseISO } from 'date-fns';
import { Plane, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTrips } from '@/features/trips/hooks/useTrips';
import { cn } from '@/lib/utils';
import type { Trip, TripType } from '@/types';
import { getFlagEmoji } from '@/utils/flagEmoji';

const tripTypeColors: Record<TripType, string> = {
  leisure: 'bg-violet-500/20 text-violet-300',
  business: 'bg-blue-500/20 text-blue-300',
  adventure: 'bg-orange-500/20 text-orange-300',
};

function formatTripType(type: TripType) {
  return type[0].toUpperCase() + type.slice(1)
}

function TripListItem({ trip, isSelected }: { trip: Trip; isSelected: boolean }) {
  const { selectTrip, removeTrip } = useTrips();
  const startDate = parseISO(trip.startDate)
  const endDate = parseISO(trip.endDate)
  const duration = differenceInDays(endDate, startDate) + 1;
  const dateRange = `${format(startDate, 'MMM d')}–${format(endDate, 'd')}`;

  return (
    <div
      onClick={() => selectTrip(trip.id)}
      className={cn(
        'group relative cursor-pointer rounded-lg p-3 transition-all hover:bg-sidebar-accent',
        isSelected && 'bg-sidebar-accent ring-2 ring-primary'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFlagEmoji(trip.countryCode)}</span>
            <span className="font-semibold text-sidebar-foreground truncate">
              {trip.city}
            </span>
          </div>
          <p className="text-sm text-sidebar-foreground/60 mt-1">
            {dateRange} · {duration} {duration === 1 ? 'day' : 'days'}
          </p>
          <span
            className={cn(
              'inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium',
              tripTypeColors[trip.type]
            )}
          >
            {formatTripType(trip.type)}
          </span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your trip to {trip.city}. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => removeTrip(trip.id)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { trips, selectedTripId, setShowNewTripForm } = useTrips();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <Plane className="h-5 w-5 text-primary" />
        <span className="font-semibold text-lg">TripKit</span>
      </div>

      {/* Trip List */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
            My Trips
          </h2>
        </div>
        <ScrollArea className="h-[calc(100%-3rem)] px-2">
          <div className="flex flex-col gap-1 pb-4">
            {trips.length === 0 ? (
              <p className="px-2 py-4 text-sm text-sidebar-foreground/50 text-center">
                No trips yet. Start planning!
              </p>
            ) : (
              trips.map((trip) => (
                <TripListItem key={trip.id} trip={trip} isSelected={trip.id === selectedTripId} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* New Trip Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={() => setShowNewTripForm(true)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Trip
        </Button>
      </div>
    </div>
  );
}
