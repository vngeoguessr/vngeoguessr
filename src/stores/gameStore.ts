import { create } from 'zustand'
import { City, Location, Guess, GameState } from '@/types/game'

interface GameStore extends GameState {
  setSelectedCity: (city: City) => void
  setCurrentLocation: (location: Location) => void
  addGuess: (guess: Guess) => void
  resetTimer: () => void
  decrementTimer: () => void
  resetGame: () => void
  setIsPlaying: (playing: boolean) => void
}

export const useGameStore = create<GameStore>((set) => ({
  selectedCity: null,
  currentLocation: null,
  totalScore: 0,
  timeRemaining: 180, // 3 minutes in seconds
  guesses: [],
  isPlaying: false,
  
  setSelectedCity: (city) => set({ selectedCity: city }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  addGuess: (guess) => set((state) => ({ 
    guesses: [...state.guesses, guess],
    totalScore: state.totalScore + guess.points 
  })),
  resetTimer: () => set({ timeRemaining: 180 }),
  decrementTimer: () => set((state) => ({ 
    timeRemaining: Math.max(0, state.timeRemaining - 1) 
  })),
  resetGame: () => set({
    selectedCity: null,
    currentLocation: null,
    totalScore: 0,
    timeRemaining: 180,
    guesses: [],
    isPlaying: false
  }),
  setIsPlaying: (playing) => set({ isPlaying: playing })
}))