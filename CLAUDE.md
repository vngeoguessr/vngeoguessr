# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🇻🇳 VNGeoGuessr - Project Configuration

A Vietnamese location-guessing game where players identify locations within Vietnamese cities using panoramic street views.

## 🛠️ Development Environment

- **Language**: TypeScript (`^5.0.0`)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **State Management**: Zustand
- **Maps**: Google Maps JavaScript API
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
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add zustand @turf/turf @googlemaps/js-api-loader
pnpm add -D @types/google.maps
```

## 🌍 Environment Variables

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎮 Gameplay Flow

1. **Authentication**: Login required for score saving, guest mode available with warning
2. **City Selection**: Choose from Vietnamese cities (Ho Chi Minh, Hanoi, Da Nang, etc.)
3. **Location Display**: Server sends random city location without metadata
4. **Guessing Phase**: 
   - View panoramic image (no location hints)
   - 3-minute timer per location
   - Place guess on city overview map
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

- Panoramic street view images (no location metadata)
- City overview maps for guessing
- Distance calculation and visualization

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
- Lazy load Google Maps API
- Implement RLS policies for security

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

// Secure API response (no location hints)
const getRandomLocation = async (cityId: string) => {
  return {
    id: 'location_id',
    panoramaData: 'base64_image_data', // No lat/lng included
    cityBounds: { north: 10.8, south: 10.7, east: 106.8, west: 106.6 }
  }
}
```