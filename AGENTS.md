# Agent Context & Rules (`AGENTS.md`)

*This file defines the project context, conventions, and rules for AI agents working on this codebase. Read this file fully before making any changes.*

---

## 1. Project Context & Tech Stack

**Project:** TripKit — Travel destination briefing app
**Goal:** A fast, clean, fully client-side travel planning tool. Users enter a destination and trip details, and receive a rich brief: weather, destination intel, quality scores, and a budget estimate. No backend. No auth. No paid APIs.

**Core Stack:**
- **Framework:** React 18+ (Functional Components, Hooks only)
- **Build Tool:** Vite
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS (utility-first, no inline styles)
- **State:** localStorage only — no state manager, no Context for global state
- **Routing:** React Router v6 — trip selection reflected in URL via query params
- **Testing:** Vitest + React Testing Library

**External APIs:**
- **Open-Meteo** — weather forecast (`https://api.open-meteo.com`)
- **RestCountries** — country facts (`https://restcountries.com/v3.1`)
- **Teleport** — city quality scores (`https://api.teleport.org`)

**Hosting:** Vercel (static, no serverless functions needed)

---

## 2. Operational Commands

Always use `npm` scripts:

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Preview production build:** `npm run preview`
- **Tests:** `npm run test`

---

## 3. Architecture & Directory Structure

Feature-first structure. Most code lives inside `src/features/`. Shared primitives live in `src/components/`, `src/hooks/`, and `src/utils/`.

```
tripkit/
├── public/
│   ├── icon.svg
│   └── apple-icon.png
│
├── src/
│   ├── app/                          # Next.js App Router (keep as-is)
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Entry page → renders AppShell
│   │   └── globals.css               # Tailwind directives + global resets
│   │
│   ├── components/                   # Shared, generic, dumb UI only
│   │   ├── ui/                       # shadcn components (do not touch)
│   │   ├── icons/
│   │   │   ├── types.ts              # IconProps type
│   │   │   └── *.tsx                 # Individual icon components
│   │   ├── Skeleton.tsx              # Reusable animated skeleton block
│   │   ├── Badge.tsx                 # Trip type color badge
│   │   ├── ScoreBar.tsx              # 0–100 horizontal score bar
│   │   └── ConfirmDialog.tsx         # Generic confirm modal
│   │
│   ├── features/
│   │   ├── trips/                    # Trip CRUD, sidebar, form
│   │   │   ├── components/
│   │   │   │   ├── Sidebar.tsx           # ← was trip-sidebar.tsx
│   │   │   │   ├── TripListItem.tsx      # single trip row in sidebar
│   │   │   │   └── NewTripForm.tsx       # ← was new-trip-form.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTrips.ts           # ← was lib/store.ts
│   │   │   ├── types/
│   │   │   │   └── trip.ts               # Trip, TripType interfaces
│   │   │   └── utils/
│   │   │       └── tripDefaults.ts
│   │   │
│   │   ├── brief/                    # Trip detail card + all data sections
│   │   │   ├── components/
│   │   │   │   ├── TripCard.tsx          # ← was trip-detail.tsx (orchestrator)
│   │   │   │   ├── TripCardHeader.tsx
│   │   │   │   ├── WeatherStrip.tsx
│   │   │   │   ├── PackingSuggestions.tsx
│   │   │   │   ├── DestinationIntel.tsx
│   │   │   │   ├── QualityScores.tsx
│   │   │   │   └── BudgetEstimate.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useWeather.ts         # Open-Meteo
│   │   │   │   ├── useCountry.ts         # RestCountries
│   │   │   │   └── useTeleport.ts        # Teleport API
│   │   │   └── utils/
│   │   │       ├── packingLogic.ts
│   │   │       └── budgetLogic.ts
│   │   │
│   │   ├── share/
│   │   │   ├── components/
│   │   │   │   └── ShareActions.tsx
│   │   │   └── utils/
│   │   │       ├── shareLink.ts
│   │   │       ├── copyText.ts
│   │   │       └── icsGenerator.ts
│   │   │
│   │   └── welcome/
│   │       └── components/
│   │           └── WelcomeScreen.tsx     # ← was welcome-state.tsx
│   │
│   ├── hooks/                        # Shared cross-feature hooks
│   │   ├── useGeocoding.ts           # Nominatim city → lat/lon
│   │   ├── useMobile.ts              # ← was use-mobile.ts
│   │   └── useToast.ts               # ← was use-toast.ts
│   │
│   ├── config/
│   │   └── constants.ts              # API base URLs, score thresholds, trip type options
│   │
│   ├── types/
│   │   └── index.ts                  # ← was lib/types.ts
│   │
│   ├── lib/
│   │   └── utils.ts                  # ← keep, shadcn depends on this (cn helper)
│   │
│   └── utils/
│       └── formatters.ts             # Date, currency, duration formatters
│
├── submission/                       # Do not modify with agents
│   ├── PROCESS.md
│   ├── how-to-launch.md
│   └── recording.mp4
│
├── AGENTS.md
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Data Flow

```
User fills NewTripForm
        ↓
useTrips.addTrip() → saved to localStorage → reflected in URL (?tripId=)
        ↓
TripCard mounts → triggers parallel data fetching:
  useGeocoding(city)        → { lat, lon, countryCode }
        ↓ (resolved)
  useWeather(lat, lon, dates)   → daily weather array
  useCountry(countryCode)       → country facts
  useTeleport(city, lat, lon)   → quality scores
        ↓ (all resolved)
  packingLogic(weather)         → packing suggestion list
  budgetLogic(scores, duration, tripType) → estimated budget
        ↓
ShareActions receive the resolved trip data for export
```

All data fetching is **stateless and reproducible** — the same inputs always produce the same API calls. This is what makes share links work: the recipient's browser re-fetches the same APIs from URL params.

---

## 5. Core Conventions

### React & TypeScript
- **Functional only.** No class components.
- **TypeScript strict.** No `any`. No `// @ts-ignore`. Use proper type narrowing.
- **No hacky fallbacks.** Do not use `''`, `'N/A'`, or `undefined` as display fallbacks. Use conditional rendering or explicit guards.
- **Custom hooks for all data fetching.** No `fetch` calls inside JSX or event handlers.
- **`useEffect` only for synchronization.** Not for derived state computation.
- **No cross-feature imports.** Features must not import from each other. Compose at `src/app/` level.
- **No barrel files (`index.ts` re-exports).** Import from concrete module paths to keep tree-shaking healthy.

### State & Persistence
- **localStorage is the only persistence layer.** No external DB, no backend.
- **URL reflects selected trip.** Use `?tripId=<id>` query param. On load, if `tripId` is in the URL and exists in localStorage, open that trip automatically.
- **Share links encode trip input only.** Format: `?city=Lisbon&start=2025-05-12&end=2025-05-19&type=leisure`. The recipient's browser fetches fresh data — no data is encoded in the URL.

### Styling
- **Tailwind utility-first.** No inline styles except for truly dynamic values (e.g. score bar widths as `style={{ width: '72%' }}`).
- **No hardcoded HEX values.** Use only tokens defined in `tailwind.config.ts`.
- **`cursor-pointer` on all interactive elements** that are not native `<button>` or `<a>`.
- **Mobile-first.** Use `md:` and `lg:` prefixes for larger breakpoints. Sidebar collapses to a drawer on mobile.

### API Integration Rules
- **Base URLs live in `src/config/constants.ts`.** Never hardcode API URLs inline.
- **Each API has exactly one hook.** Do not duplicate fetch logic across components.
- **All hooks return `{ data, isLoading, error }`.** Consistent shape across all data hooks.
- **Geocoding is a prerequisite.** `useWeather`, `useCountry`, and `useTeleport` must only fire after `useGeocoding` resolves.
- **Graceful degradation.** If Teleport has no data for a city, that section shows a "No data available for this location" message. The rest of the card still renders.
- **Nominatim rate limit.** Add a `User-Agent` header and never fire more than 1 request per second. Do not call Nominatim on every keystroke — only on form submit.

### Loading & Error States
- **Every async section has a skeleton.** Skeletons must match the shape of the real content to prevent layout shift.
- **Errors are section-level**, not full-page. One failed API does not block the rest of the card from rendering.
- **No spinners on the full page.** Loading is granular, per section.

### Accessibility
- **Icon-only buttons** must include `aria-label`.
- **Use `<button>`** for all interactive elements. Only use `role="button"` when a native button is not possible.
- **Confirm before destructive actions.** Delete trip must trigger a `ConfirmDialog` before removing from localStorage.

---

## 6. Feature Rules

### `trips` feature
- `useTrips` manages all localStorage read/write.
- Trip shape:

```ts
type TripType = 'leisure' | 'business' | 'adventure';

interface Trip {
  id: string;           // nanoid or crypto.randomUUID()
  city: string;
  countryCode: string;  // resolved by geocoding on creation
  startDate: string;    // ISO date string YYYY-MM-DD
  endDate: string;      // ISO date string YYYY-MM-DD
  type: TripType;
  createdAt: string;    // ISO timestamp
}
```

- On delete: remove from localStorage, if the deleted trip was selected → navigate to `/` (welcome screen).

### `brief` feature
- `TripCard` is the orchestrator. It calls all hooks and passes resolved data to child sections.
- Child section components are **presentational** — they receive props, they do not fetch.
- `packingLogic` derives suggestions from the weather array: checks for rain, cold (<10°C), heat (>28°C), UV, wind.
- `budgetLogic` uses Teleport's `cost_of_living` score, trip duration in days, and a multiplier per `TripType` (leisure: 1.8×, business: 1.4×, adventure: 0.9×).

### `share` feature
- `ShareActions` shows three buttons: **Share link**, **Copy text**, **Add to Calendar**.
- Share link: copies `window.location.origin + ?city=&start=&end=&type=` to clipboard.
- Copy text: formats a plain-text brief and writes to clipboard via `navigator.clipboard.writeText`.
- Calendar: generates and triggers download of a `.ics` file. Event title: `✈️ Trip to {city}`. Notes field contains budget, and packing list.

---

## 7. Specialist Agent Personas

### 🎨 UI/UX Agent
**Trigger:** Component creation, layout, styling.
**Rules:**
- Always check `tailwind.config.ts` for tokens before using any color or spacing value.
- Implement skeleton states for every async section before the real content.
- Sidebar is always visible on `md:` and above. On mobile it is a slide-in drawer.

### 🔌 API Integration Agent
**Trigger:** Any hook touching an external API.
**Rules:**
- Verify the endpoint response shape before writing types — do not guess.
- Return `{ data: T | null, isLoading: boolean, error: string | null }` from every hook.
- Teleport requires a two-step lookup: search for the city slug, then fetch the scores. Handle both steps inside `useTeleport`.
- Open-Meteo requires `latitude`, `longitude`, `start_date`, `end_date`, and `daily` params. Map `weathercode` to icon + label using the WMO weather interpretation table.

### 🛡️ Security Agent
**Trigger:** Env vars, external data, clipboard, file generation.
**Rules:**
- No API keys are required by this project. If one is added in future, it must go in `.env` and be documented in `.env.example`. Never commit secrets.
- Sanitize any user input used in API calls (city name). Encode it with `encodeURIComponent` before appending to URLs.
- `.ics` file content must not include any unescaped user input that could inject calendar data.

### 🧪 QA Agent
**Trigger:** Writing or reviewing tests.
**Rules:**
- Use Vitest + React Testing Library.
- Test user-visible behavior: rendered text, button clicks, form submissions.
- Mock all `fetch` calls — do not hit real APIs in tests.
- Cover: happy path, empty/no-data state, error state, and delete confirmation flow.

---

## 8. What Agents Must NOT Do

- ❌ Add a state manager (Redux, Zustand, Jotai, etc.)
- ❌ Add a backend or serverless functions
- ❌ Call any paid or key-required API
- ❌ Store data anywhere other than localStorage
- ❌ Use hardcoded HEX color values
- ❌ Put fetch logic directly inside components
