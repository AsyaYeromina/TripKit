import { Providers } from '@/app/providers'
import { TripCard } from '@/features/brief/components/TripCard'
import { MobileHeader } from '@/features/trips/components/MobileHeader'
import { NewTripForm } from '@/features/trips/components/NewTripForm'
import { Sidebar } from '@/features/trips/components/Sidebar'
import { useTrips } from '@/features/trips/hooks/useTrips'
import { WelcomeScreen } from '@/features/welcome/components/WelcomeScreen'

export function App() {
  const { trips, selectedTripId, showNewTripForm } = useTrips()
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId)

  const mainContent = (() => {
    if (showNewTripForm) {
      return <NewTripForm />
    }

    if (selectedTrip) {
      return <TripCard trip={selectedTrip} />
    }

    return <WelcomeScreen />
  })()

  return (
    <Providers>
      <div className="flex h-screen flex-col">
        <MobileHeader />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden w-[260px] flex-shrink-0 border-r border-sidebar-border md:block">
            <Sidebar />
          </aside>
          <main className="flex-1 overflow-hidden bg-background">{mainContent}</main>
        </div>
      </div>
    </Providers>
  )
}
