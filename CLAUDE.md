# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## VNGeoGuessr - Project Configuration

A Vietnamese location-guessing game where players identify locations within Vietnamese cities using panoramic street views.

## 🛠️ Development Environment

- **Language**: TypeScript (`^5.0.0`)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **State Management**: Zustand
- **Maps**: Leaflet + OpenStreetMap
- **Street View**: Mapillary API
- **Backend**: Supabase (Database, Auth, Storage, Realtime)
- **Geo Calculations**: Turf.js
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with `@typescript-eslint`
- **Formatting**: Prettier
- **Package Manager**: `pnpm` (preferred)
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics

## ⚙️ Development Commands

- **Dev server**: `pnpm dev` (with Turbopack, runs on http://localhost:3000)
- **Build**: `pnpm build`
- **Start**: `pnpm start`
- **Lint**: `pnpm lint`

## 🔧 TypeScript Code Quality Rules

### Strict Typing Requirements
- **No `any` types**: Use `@typescript-eslint/no-explicit-any` - always specify exact types
- **Explicit function signatures**: All parameters and return types must be declared
- **React components**: Return type should be `React.JSX.Element` (import React if needed)
- **Async functions**: Must declare `Promise<ReturnType>` return types
- **Event handlers**: Use proper React event types (`React.FormEvent`, `React.ChangeEvent`, etc.)

### Function Type Examples
```typescript
// ✅ Correct function typing
const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault()
}

const calculateScore = (distance: number): number => {
  return distance < 100 ? 5 : 0
}

const fetchData = async (id: string): Promise<ApiResponse> => {
  return await api.get(`/data/${id}`)
}

// ❌ Avoid these patterns
const badFunction = (data: any) => { } // No any types
const badAsync = async (id: string) => { } // Missing Promise return type
const badComponent = () => { } // Missing React.JSX.Element return type
```

### Component Type Patterns
```typescript
// React component with proper typing
import React from 'react'

interface Props {
  title: string
  onClick: (id: string) => void
}

const MyComponent = ({ title, onClick }: Props): React.JSX.Element => {
  return <div>{title}</div>
}

// Store actions with explicit types
interface GameStore {
  score: number
  setScore: (score: number) => void
  updateScore: (increment: number) => void
}
```

## 📂 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── game/
│   │   ├── [gameId]/
│   │   └── create/
│   ├── leaderboard/
│   ├── profile/
│   └── api/
│       ├── games/
│       └── scores/
├── components/              # UI components
│   ├── ui/                  # shadcn/ui components
│   ├── game/                # Game components
│   │   ├── MapView.tsx
│   │   ├── GuessMarker.tsx
│   │   ├── ScoreDisplay.tsx
│   │   └── GameControls.tsx
│   └── maps/                # Map components
├── stores/                  # Zustand stores
│   ├── gameStore.ts
│   ├── userStore.ts
│   └── mapStore.ts
├── hooks/                   # Custom hooks
│   ├── useSupabase.ts
│   ├── useGoogleMaps.ts
│   └── useGameLogic.ts
├── lib/                     # Utilities
│   ├── supabase/
│   ├── maps/
│   ├── game/
│   │   ├── scoring.ts
│   │   ├── distance.ts
│   │   └── locations.ts
│   └── utils.ts
└── types/                   # TypeScript types
    ├── game.ts
    ├── user.ts
    └── maps.ts
```

## 📦 Required Dependencies

```bash
# Core dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add zustand @turf/turf
pnpm add leaflet react-leaflet
pnpm add mapillary-js

# Development dependencies
pnpm add -D @types/leaflet
```

## 🌍 Environment Variables

```bash
NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN=your_mapillary_access_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎮 Gameplay Flow

1. **Authentication**: Login required for score saving, guest mode available with warning
2. **City Selection**: Choose from Vietnamese cities (Ho Chi Minh, Hanoi, Da Nang, etc.)
3. **Location Display**: Server sends random city location without metadata
4. **Guessing Phase**:
   - View Mapillary street-level imagery (no location hints)
   - 3-minute timer per location
   - Place guess on OpenStreetMap via Leaflet
   - Submit guess or skip to new location
5. **Scoring**: Distance-based points (0-5 scale):
   - 0-50m = 5 points
   - 50m-100m = 4 points
   - 100m-200m = 3 points
   - 200m-500m = 2 points
   - 500m-1km = 1 point
   - >1km = 0 points
6. **Results**: Show actual location, distance, points earned, leaderboard position
7. **Continue**: Next round or view location details

## 🎮 Game Architecture

### State Management
- **AuthStore**: User authentication, guest mode
- **GameStore**: Current game session, city selection, scores
- **LeaderboardStore**: User rankings and statistics

### Core Logic
- Secure location data (no metadata in API)
- Distance-based scoring system
- Session-based gameplay

## 🗺️ Maps Integration

- **Mapillary**: Street-level imagery from crowd-sourced photos
- **OpenStreetMap + Leaflet**: Interactive maps for location guessing
- **No Location Metadata**: Secure API responses without coordinates
- Distance calculation and visualization with result overlays

## 💾 Database Schema

```sql
cities (id, name, bounds, status)
locations (id, city_id, lat, lng, street_view_data, verified)
user_sessions (id, user_id, city_id, total_score, created_at)
guesses (id, session_id, location_id, guess_lat, guess_lng, distance_m, points, time_taken)
leaderboard (user_id, city_id, best_score, total_games, last_played)
```

## 📱 Development Guidelines

- Use shadcn/ui for UI components
- Responsive mobile-first design
- Use Leaflet with OpenStreetMap tiles
- Use Mapillary Viewer for street imagery
- Implement RLS policies for security
- Handle Mapillary API rate limits gracefully

## 💡 Code Examples

```typescript
// Game session store
const useGameStore = create<GameState>((set) => ({
  selectedCity: null,
  currentLocation: null,
  totalScore: 0,
  timeRemaining: 180, // 3 minutes in seconds
  guesses: [],
  addGuess: (guess) => set((state) => ({
    guesses: [...state.guesses, guess],
    totalScore: state.totalScore + guess.points
  })),
  resetTimer: () => set({ timeRemaining: 180 })
}))

// Distance-based scoring (0-5 points)
const calculatePoints = (distanceM: number): number => {
  if (distanceM <= 50) return 5
  if (distanceM <= 100) return 4
  if (distanceM <= 200) return 3
  if (distanceM <= 500) return 2
  if (distanceM <= 1000) return 1
  return 0
}

// Mapillary image retrieval
const getMapillaryImage = async (lat: number, lng: number) => {
  const response = await fetch(
    `https://graph.mapillary.com/images?access_token=${token}&fields=id,thumb_2048_url&bbox=${bbox}`
  )
  return response.json()
}

// Leaflet map initialization
const map = L.map('map').setView([lat, lng], 13)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map)

// Secure API response (no location hints)
const getRandomLocation = async (cityId: string) => {
  return {
    id: 'location_id',
    mapillary_image_id: 'image_id_here', // No lat/lng included
    cityBounds: { north: 10.8, south: 10.7, east: 106.8, west: 106.6 }
  }
}
```
