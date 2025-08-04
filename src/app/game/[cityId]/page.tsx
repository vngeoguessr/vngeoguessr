'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameStore } from '@/stores/gameStore'
import { useAuthStore } from '@/stores/authStore'
import { vietnameseCities } from '@/data/cities'
import { calculateDistance } from '@/lib/distance'
import { calculatePoints, getScoreDescription } from '@/lib/scoring'
import MapillaryViewer from '@/components/maps/MapillaryViewer'
import LeafletMap from '@/components/maps/LeafletMap'
import { getRandomMapillaryImage, MapillaryImage } from '@/lib/mapillary'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const cityId = params.cityId as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [mapillaryImage, setMapillaryImage] = useState<MapillaryImage | null>(null)
  const [guessLocation, setGuessLocation] = useState<{lat: number, lng: number} | null>(null)
  const [actualLocation, setActualLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [roundDistance, setRoundDistance] = useState(0)
  const [roundPoints, setRoundPoints] = useState(0)
  const [canGuess, setCanGuess] = useState(false)

  const { 
    selectedCity, 
    timeRemaining, 
    totalScore, 
    addGuess, 
    resetTimer, 
    decrementTimer,
    setIsPlaying 
  } = useGameStore()
  
  const { isAuthenticated } = useAuthStore()

  // Find city data
  const city = vietnameseCities.find(c => c.id === cityId)

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !showResults && isAuthenticated) {
      const timer = setTimeout(() => {
        decrementTimer()
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !showResults) {
      handleTimeUp()
    }
  }, [timeRemaining, showResults, decrementTimer, isAuthenticated])

  // Initialize Mapillary and game
  useEffect(() => {
    if (!city) return

    const initGame = async () => {
      try {
        console.log('🔄 Loading Mapillary image...')
        setIsLoading(true)
        
        // Get random Mapillary image
        const image = await getRandomMapillaryImage(city.bounds)
        
        if (!image) {
          console.error('❌ No Mapillary images found in city bounds')
          setIsLoading(false)
          return
        }

        console.log('✅ Mapillary image loaded:', image.id)
        setMapillaryImage(image)
        
        // Set actual location from Mapillary image coordinates  
        const [lng, lat] = image.computed_geometry.coordinates
        setActualLocation({ lat, lng })
        console.log('📍 Actual location:', { lat, lng })

        setIsLoading(false)
        setIsPlaying(true)
        resetTimer()

      } catch (error) {
        console.error('❌ Failed to load game:', error)
        setIsLoading(false)
      }
    }

    initGame()
  }, [city, resetTimer, setIsPlaying])

  const handleGuessPlaced = (lat: number, lng: number) => {
    setGuessLocation({ lat, lng })
    setCanGuess(true)
  }

  const handleGuess = () => {
    if (!guessLocation || !actualLocation) return

    const distance = calculateDistance(
      guessLocation.lat,
      guessLocation.lng,
      actualLocation.lat,
      actualLocation.lng
    )
    
    const points = calculatePoints(distance)
    
    setRoundDistance(distance)
    setRoundPoints(points)
    
    // Add to game store
    addGuess({
      id: `guess-${Date.now()}`,
      sessionId: 'temp-session',
      locationId: mapillaryImage?.id || 'temp-location',
      guessLat: guessLocation.lat,
      guessLng: guessLocation.lng,
      distanceM: distance,
      points,
      timeTaken: 180 - timeRemaining
    })

    setShowResults(true)
    setCanGuess(false)
  }

  const handleTimeUp = () => {
    if (guessLocation && actualLocation) {
      handleGuess()
    } else {
      // No guess made - 0 points
      setRoundDistance(0)
      setRoundPoints(0)
      setShowResults(true)
    }
  }

  const handleNextRound = async () => {
    // Reset for next round
    setShowResults(false)
    setGuessLocation(null)
    setActualLocation(null)
    setMapillaryImage(null)
    setRoundDistance(0)
    setRoundPoints(0)
    setCanGuess(false)
    setIsLoading(true)

    if (city) {
      // Get new Mapillary image
      const image = await getRandomMapillaryImage(city.bounds)
      if (image) {
        setMapillaryImage(image)
        const [lng, lat] = image.computed_geometry.coordinates
        setActualLocation({ lat, lng })
        resetTimer()
      }
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isAuthenticated) {
    router.push('/')
    return null
  }

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>City not found</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading {city.name}...</p>
            <p className="text-sm text-gray-500 mt-2">Fetching Mapillary images...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">🇻🇳 {city.name}</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Score: <span className="font-semibold">{totalScore}</span>
            </div>
            <div className={`text-sm font-mono ${timeRemaining <= 30 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
              Time: {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>

      {/* Game Layout */}
      <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Mapillary Street View */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Street View</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2">
              <MapillaryViewer 
                image={mapillaryImage}
                className="w-full h-full"
              />
            </CardContent>
          </Card>

          {/* Leaflet Map or Results */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {showResults ? 'Results' : 'Where are you?'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2">
              <div className="h-full flex flex-col">
                <div className="flex-1 mb-4">
                  <LeafletMap
                    center={[
                      (city.bounds.north + city.bounds.south) / 2,
                      (city.bounds.east + city.bounds.west) / 2
                    ]}
                    zoom={11}
                    onGuessPlaced={showResults ? undefined : handleGuessPlaced}
                    guessLocation={guessLocation}
                    actualLocation={actualLocation}
                    showResults={showResults}
                    className="w-full h-full"
                  />
                </div>
                
                {showResults ? (
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold">
                      {getScoreDescription(roundPoints)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Distance: {roundDistance}m • Points: {roundPoints}/5
                    </p>
                    <Button onClick={handleNextRound} className="w-full mt-4">
                      Next Location
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Click on the map to place your guess
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleGuess} 
                        disabled={!canGuess}
                        className="flex-1"
                      >
                        Submit Guess
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleNextRound}
                        className="flex-1"
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}