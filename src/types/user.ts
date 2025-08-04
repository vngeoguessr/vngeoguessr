export interface User {
  id: string
  email?: string
  name?: string
  isGuest: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}