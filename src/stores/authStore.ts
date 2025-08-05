import { create } from 'zustand'
import { User, AuthState } from '@/types/user'

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  playAsGuest: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),

  login: async (email: string, _password: string) => {
    set({ isLoading: true })
    try {
      // TODO: Implement Supabase authentication
      // For now, simulate login
      const user: User = {
        id: 'temp-user-id',
        email,
        name: email.split('@')[0],
        isGuest: false
      }
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Login failed:', error)
      set({ isLoading: false })
    }
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false 
    })
  },

  playAsGuest: () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest Player',
      isGuest: true
    }
    set({ 
      user: guestUser, 
      isAuthenticated: true 
    })
  }
}))