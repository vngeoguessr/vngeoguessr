'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameStore } from '@/stores/gameStore'
import { useAuthStore } from '@/stores/authStore'
import { vietnameseCities } from '@/data/cities'
import { generateRandomLocation, calculateDistance } from '@/lib/distance'
import { calculatePoints, getScoreDescription } from '@/lib/scoring'
import { Loader } from '@googlemaps/js-api-loader'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const cityId = params.cityId as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [gameMap, setGameMap] = useState<google.maps.Map | null>(null)
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null)
  const [resultMap, setResultMap] = useState<google.maps.Map | null>(null)
  const [guessMarker, setGuessMarker] = useState<google.maps.Marker | null>(null)
  const [guessLocation, setGuessLocation] = useState<{lat: number, lng: number} | null>(null)
  const [actualLocation, setActualLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [roundDistance, setRoundDistance] = useState(0)
  const [roundPoints, setRoundPoints] = useState(0)
  const [canGuess, setCanGuess] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const streetViewRef = useRef<HTMLDivElement>(null)
  const resultMapRef = useRef<HTMLDivElement>(null)

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

  // Initialize Google Maps
  useEffect(() => {
    if (!city) return

    const initMaps = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
        })

        await loader.load()
        
        // Generate random location in city
        const location = generateRandomLocation(city.bounds)
        setActualLocation(location)

        // Initialize street view
        if (streetViewRef.current) {
          const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
            position: location,
            pov: { heading: Math.random() * 360, pitch: 0 },
            addressControl: false,
            showRoadLabels: false,
            disableDefaultUI: true,
            clickToGo: true,
            scrollwheel: false
          })
          setStreetView(panorama)
        }

        // Initialize guessing map
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: {
              lat: (city.bounds.north + city.bounds.south) / 2,
              lng: (city.bounds.east + city.bounds.west) / 2
            },
            zoom: 11,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: 'greedy'
          })

          // Add click listener for guessing
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng && !showResults) {
              placeGuessMarker(event.latLng)
            }
          })

          setGameMap(map)
        }

        setIsLoading(false)
        setIsPlaying(true)
        resetTimer()

      } catch (error) {
        console.error('Failed to load Google Maps:', error)
        setIsLoading(false)
      }
    }

    initMaps()
  }, [city, resetTimer, setIsPlaying])

  const placeGuessMarker = (latLng: google.maps.LatLng) => {
    if (!gameMap) return

    // Remove existing marker
    if (guessMarker) {
      guessMarker.setMap(null)
    }

    // Place new marker
    const marker = new google.maps.Marker({
      position: latLng,
      map: gameMap,
      draggable: true,
      title: 'Your Guess'
    })

    // Update guess location when marker is dragged
    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      if (position) {
        setGuessLocation({
          lat: position.lat(),
          lng: position.lng()
        })
      }
    })

    setGuessMarker(marker)
    setGuessLocation({
      lat: latLng.lat(),
      lng: latLng.lng()
    })
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
      locationId: 'temp-location',
      guessLat: guessLocation.lat,
      guessLng: guessLocation.lng,
      distanceM: distance,
      points,
      timeTaken: 180 - timeRemaining
    })

    showResultsMap()
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
      showResultsMap()
      setShowResults(true)
    }
  }

  const showResultsMap = () => {
    if (!resultMapRef.current || !actualLocation) return

    const map = new google.maps.Map(resultMapRef.current, {
      center: actualLocation,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true
    })

    // Actual location marker (green)
    new google.maps.Marker({
      position: actualLocation,
      map: map,
      title: 'Actual Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      }
    })

    // Guess location marker (red) if guess was made
    if (guessLocation) {
      new google.maps.Marker({
        position: guessLocation,
        map: map,
        title: 'Your Guess',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      })

      // Draw line between guess and actual
      const line = new google.maps.Polyline({
        path: [actualLocation, guessLocation],
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        geodesic: true
      })
      line.setMap(map)

      // Adjust map bounds to show both markers
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(actualLocation)
      bounds.extend(guessLocation)
      map.fitBounds(bounds)
    }

    setResultMap(map)
  }

  const handleNextRound = () => {
    // Reset for next round
    setShowResults(false)
    setGuessLocation(null)
    setActualLocation(null)
    setRoundDistance(0)
    setRoundPoints(0)
    setCanGuess(false)
    
    if (guessMarker) {
      guessMarker.setMap(null)
      setGuessMarker(null)
    }

    // Generate new location and reinitialize
    if (city && streetView && gameMap) {
      const location = generateRandomLocation(city.bounds)
      setActualLocation(location)
      
      streetView.setPosition(location)
      streetView.setPov({ heading: Math.random() * 360, pitch: 0 })
      
      resetTimer()
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
          {/* Street View */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Street View</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2">
              <div
                ref={streetViewRef}
                className="w-full h-full rounded-lg border"
                style={{ minHeight: '300px' }}
              />
            </CardContent>
          </Card>

          {/* Guessing Map or Results */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {showResults ? 'Results' : 'Where are you?'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2">
              {showResults ? (
                <div className="h-full flex flex-col">
                  <div
                    ref={resultMapRef}
                    className="flex-1 rounded-lg border mb-4"
                    style={{ minHeight: '200px' }}
                  />
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
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div
                    ref={mapRef}
                    className="flex-1 rounded-lg border mb-4"
                    style={{ minHeight: '200px' }}
                  />
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}