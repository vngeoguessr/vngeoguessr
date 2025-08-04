# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🇻🇳 VNGeoGuessr - Project Configuration

A Vietnamese location-guessing game built with Next.js, featuring interactive maps, real-time multiplayer, and scoring systems focused on Vietnam geography.

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

## 🎮 Game Architecture

### State Management
- **GameStore**: Game state, rounds, scores, guesses
- **UserStore**: Authentication, user preferences
- **MapStore**: Map settings, current location, Street View

### Core Logic
- Distance calculations with Turf.js
- Exponential scoring system
- Real-time multiplayer via Supabase

## 🗺️ Maps Integration

- Street View for location exploration
- Interactive world map for guessing
- Distance visualization and markers

## 💾 Database Schema

```sql
games (id, created_by, game_mode, max_rounds, time_limit, status)
game_rounds (id, game_id, round_number, location_lat, location_lng)
player_guesses (id, game_id, player_id, round_id, guess_lat, guess_lng, distance_km, score)
```

## 📱 Development Guidelines

- Use shadcn/ui for UI components
- Responsive mobile-first design
- Lazy load Google Maps API
- Implement RLS policies for security

## 💡 Code Examples

```typescript
// Zustand game store
const useGameStore = create<GameState>((set) => ({
  currentRound: 1,
  score: 0,
  guesses: [],
  updateScore: (points) => set((state) => ({ score: state.score + points }))
}))

// Distance calculation
import { distance } from '@turf/distance'
const calculateDistance = (guess: [number, number], actual: [number, number]) => {
  return distance(guess, actual, { units: 'kilometers' })
}

// Scoring algorithm
const calculateScore = (distanceKm: number, maxScore = 5000) => {
  if (distanceKm === 0) return maxScore
  return Math.round(maxScore * Math.exp(-distanceKm / 2000))
}
```