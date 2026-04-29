import { Plane, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrips } from '@/features/trips/hooks/useTrips';

export function WelcomeScreen() {
  const { setShowNewTripForm } = useTrips();

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Plane className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">
        Your journey starts here
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 text-pretty leading-relaxed">
        Plan your first trip and get a full destination brief — weather, budget, local intel and
        more.
      </p>
      <Button
        size="lg"
        onClick={() => setShowNewTripForm(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Plus className="w-5 h-5 mr-2" />
        Plan a Trip
      </Button>
    </div>
  );
}
