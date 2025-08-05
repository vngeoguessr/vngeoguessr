'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { useGameStore } from '@/stores/gameStore'
import { vietnameseCities } from '@/data/cities'

export default function Home() {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showGuestWarning, setShowGuestWarning] = useState(false)

  const router = useRouter()
  const { user, isAuthenticated, login, playAsGuest, isLoading } = useAuthStore()
  const { setSelectedCity } = useGameStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  const handleGuestPlay = () => {
    setShowGuestWarning(true)
  }

  const confirmGuestPlay = () => {
    playAsGuest()
    setShowGuestWarning(false)
  }

  const handleCitySelect = (cityId: string) => {
    const city = vietnameseCities.find(c => c.id === cityId)
    if (city) {
      setSelectedCity(city)
      router.push(`/game/${cityId}`)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-green-50">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">VNGeoGuessr</h1>
            <p className="text-gray-600">Explore Vietnam through Street View</p>
          </div>

          {showGuestWarning ? (
            <Card>
              <CardHeader>
                <CardTitle>⚠️ Guest Mode Warning</CardTitle>
                <CardDescription>
                  Playing as a guest means your scores will not be saved to the leaderboard.
                  Are you sure you want to continue?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={confirmGuestPlay} className="w-full">
                  Yes, Play as Guest
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowGuestWarning(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          ) : showLogin ? (
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogin(false)}
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to VNGeoGuessr!</CardTitle>
                <CardDescription>
                  Choose how you&apos;d like to play
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setShowLogin(true)} className="w-full">
                  Sign In to Save Scores
                </Button>
                <Button variant="outline" onClick={handleGuestPlay} className="w-full">
                  Play as Guest
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">VNGeoGuessr</h1>
          <p className="text-gray-600 mb-4">Welcome, {user?.name || 'Guest Player'}</p>
          {user?.isGuest && (
            <p className="text-amber-600 text-sm">
              ⚠️ Guest mode - scores will not be saved
            </p>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6">Select a Vietnamese City</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vietnameseCities.map((city) => (
              <Card
                key={city.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCitySelect(city.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{city.name}</CardTitle>
                  <CardDescription>
                    Explore the streets of {city.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Game</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
