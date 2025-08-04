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
- **Format**: `pnpm format`
- **Test**: `pnpm test`
- **Type check**: `pnpm type-check`

## 📂 Project Structure

```
.
├── app/                     # App Router structure
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
│   ├── game/                # Game-specific components
│   │   ├── MapView.tsx
│   │   ├── GuessMarker.tsx
│   │   ├── ScoreDisplay.tsx
│   │   └── GameControls.tsx
│   ├── maps/                # Map-related components
│   └── auth/                # Authentication components
├── stores/                  # Zustand stores
│   ├── gameStore.ts
│   ├── userStore.ts
│   └── mapStore.ts
├── hooks/                   # Custom React hooks
│   ├── useSupabase.ts
│   ├── useGoogleMaps.ts
│   └── useGameLogic.ts
├── lib/                     # Utilities and configurations
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── realtime.ts
│   ├── maps/
│   │   ├── googleMaps.ts
│   │   └── streetView.ts
│   ├── game/
│   │   ├── scoring.ts
│   │   ├── distance.ts      # Turf.js calculations
│   │   └── locations.ts
│   └── utils.ts
├── types/                   # TypeScript type definitions
│   ├── game.ts
│   ├── user.ts
│   └── maps.ts
├── styles/                  # Tailwind customizations
├── tests/                   # Unit and integration tests
├── public/
├── .env.local.example
├── .eslintrc.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── next.config.js
├── package.json
└── README.md
```

## 📦 Required Dependencies

```bash
# Core dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add zustand
pnpm add @turf/turf @turf/distance @turf/helpers
pnpm add @googlemaps/js-api-loader

# Development dependencies
pnpm add -D @types/google.maps
```

**Setup Requirements:**
- Tailwind CSS with PostCSS configuration
- shadcn/ui: `npx shadcn-ui@latest init`
- Google Maps API key in environment variables
- Supabase project with RLS policies configured

## 🌍 Environment Variables

```bash
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vercel Analytics (auto-configured on Vercel)
```

## 🎮 Game Logic Architecture

### Scoring System
- Use Turf.js `distance()` for geographical calculations
- Exponential scoring: closer guesses = exponentially higher points
- Store scoring logic in `lib/game/scoring.ts`

### State Management (Zustand)
- **GameStore**: Current game state, rounds, scores, guesses
- **UserStore**: Authentication state, user preferences, statistics  
- **MapStore**: Map settings, current location, Street View state

### Real-time Features
- Supabase Realtime for multiplayer game rooms
- Live game state updates and synchronization
- Connection state handling and reconnection logic

## 🗺️ Google Maps Integration

### Street View Implementation
- Random locations with Street View coverage verification
- Panorama controls and movement restrictions
- Street View availability checks before game start

### Interactive Guessing Map  
- World map for placing guesses with custom markers
- Distance visualization between guess and actual location
- Smooth animations and transitions between rounds

## 💾 Supabase Database Schema

```sql
-- Games table
games (
  id uuid primary key,
  created_by uuid references auth.users,
  game_mode text,
  max_rounds integer,
  time_limit integer,
  created_at timestamp,
  status text
)

-- Game rounds table
game_rounds (
  id uuid primary key,
  game_id uuid references games,
  round_number integer,
  location_lat float,
  location_lng float,
  street_view_data jsonb
)

-- Player guesses table
player_guesses (
  id uuid primary key,
  game_id uuid references games,
  player_id uuid references auth.users,
  round_id uuid references game_rounds,
  guess_lat float,
  guess_lng float,
  distance_km float,
  score integer,
  time_taken integer
)
```

## 🧪 Testing Strategy

- **Framework**: Jest + React Testing Library
- **Mocking**: Google Maps API calls, Supabase client interactions
- **Focus Areas**: Game logic (scoring, distance calculations), component rendering
- **Integration Tests**: Full game flow with mocked external services

## 📱 Development Guidelines

### Component Architecture
- Use shadcn/ui for base UI components (buttons, dialogs, forms)
- Game-specific components in `components/game/`
- Responsive design with mobile-first approach
- Handle loading states for maps and Street View

### Performance Optimization
- Lazy load Google Maps API
- React.memo for expensive game components  
- Optimize Supabase queries with proper indexing
- Image optimization for location thumbnails

### Security Implementation
- Row Level Security (RLS) policies for all user data
- Server-side validation for all game inputs
- Rate limiting on game creation and submission endpoints
- Secure API routes with authentication middleware

## 💡 Common Development Patterns

```typescript
// Game state management with Zustand
const useGameStore = create<GameState>((set) => ({
  currentRound: 1,
  score: 0,
  guesses: [],
  updateScore: (points) => set((state) => ({ score: state.score + points }))
}))

// Distance calculation with Turf.js
import { distance } from '@turf/turf'
const calculateDistance = (guess: [number, number], actual: [number, number]) => {
  return distance(guess, actual, { units: 'kilometers' })
}

// Supabase real-time subscription
const gameChannel = supabase
  .channel('game-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, 
    (payload) => handleGameUpdate(payload))
  .subscribe()
```

## 🧩 Custom Development Commands

For future implementation in `.claude/commands/`:

- `/create-game-component` - Scaffold game component with TypeScript
- `/setup-map-integration` - Configure Google Maps with Street View
- `/add-zustand-store` - Create new Zustand store with proper typing
- `/implement-scoring` - Add scoring logic with Turf.js calculations
- `/setup-realtime` - Configure Supabase Realtime features