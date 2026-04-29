import { useSyncExternalStore } from 'react'
import type { Trip } from '@/types'

const STORAGE_KEY = 'tripkit:trips'

interface TripsState {
  trips: Trip[]
  selectedTripId: string | null
  showNewTripForm: boolean
}

interface TripsStore extends TripsState {
  addTrip: (trip: Trip) => void
  removeTrip: (id: string) => void
  selectTrip: (id: string | null) => void
  setShowNewTripForm: (show: boolean) => void
}

const listeners = new Set<() => void>()

function readTrips(): Trip[] {
  if (typeof window === 'undefined') {
    return []
  }

  const rawTrips = window.localStorage.getItem(STORAGE_KEY)
  if (!rawTrips) {
    return []
  }

  try {
    const parsedTrips: unknown = JSON.parse(rawTrips)
    return Array.isArray(parsedTrips) ? parsedTrips.filter(isTrip) : []
  } catch {
    return []
  }
}

function readSelectedTripId(trips: Trip[]): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const selectedTripId = new URLSearchParams(window.location.search).get('tripId')
  return trips.some((trip) => trip.id === selectedTripId) ? selectedTripId : null
}

let state: TripsState = {
  trips: readTrips(),
  selectedTripId: readSelectedTripId(readTrips()),
  showNewTripForm: false,
}

function isTrip(value: unknown): value is Trip {
  if (!value || typeof value !== 'object') {
    return false
  }

  const trip = value as Partial<Record<keyof Trip, unknown>>
  return (
    typeof trip.id === 'string' &&
    typeof trip.city === 'string' &&
    typeof trip.countryCode === 'string' &&
    typeof trip.startDate === 'string' &&
    typeof trip.endDate === 'string' &&
    typeof trip.createdAt === 'string' &&
    (trip.type === 'leisure' || trip.type === 'business' || trip.type === 'adventure')
  )
}

function writeTrips(trips: Trip[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

function writeSelectedTripId(tripId: string | null) {
  const url = new URL(window.location.href)

  if (tripId) {
    url.searchParams.set('tripId', tripId)
  } else {
    url.searchParams.delete('tripId')
  }

  window.history.replaceState(null, '', url)
}

function setState(nextState: TripsState) {
  state = nextState
  writeTrips(state.trips)
  writeSelectedTripId(state.selectedTripId)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return state
}

function addTrip(trip: Trip) {
  setState({
    trips: [...state.trips, trip],
    selectedTripId: trip.id,
    showNewTripForm: false,
  })
}

function removeTrip(id: string) {
  const trips = state.trips.filter((trip) => trip.id !== id)
  setState({
    trips,
    selectedTripId: state.selectedTripId === id ? null : state.selectedTripId,
    showNewTripForm: false,
  })
}

function selectTrip(id: string | null) {
  setState({
    ...state,
    selectedTripId: id,
    showNewTripForm: false,
  })
}

function setShowNewTripForm(show: boolean) {
  setState({
    ...state,
    selectedTripId: show ? null : state.selectedTripId,
    showNewTripForm: show,
  })
}

export function useTrips(): TripsStore {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return {
    ...snapshot,
    addTrip,
    removeTrip,
    selectTrip,
    setShowNewTripForm,
  }
}
