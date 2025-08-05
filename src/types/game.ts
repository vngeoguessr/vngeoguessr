export interface City {
  id: string
  name: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  status: 'active' | 'inactive'
}

export interface Location {
  id: string
  cityId: string
  lat: number
  lng: number
  streetViewData?: string
  verified: boolean
}

export interface GameSession {
  id: string
  userId?: string
  cityId: string
  totalScore: number
  createdAt: string
}

export interface Guess {
  id: string
  sessionId: string
  locationId: string
  guessLat: number
  guessLng: number
  distanceM: number
  points: number
  timeTaken: number
}

export interface GameState {
  selectedCity: City | null
  currentLocation: Location | null
  totalScore: number
  timeRemaining: number
  guesses: Guess[]
  isPlaying: boolean
}