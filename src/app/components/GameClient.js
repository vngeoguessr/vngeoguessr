"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import PanoramaViewer from './PanoramaViewer';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-gray-100 flex items-center justify-center">Loading map...</div>
});
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CITIES,
  cityCenters,
  cityNames,
  formatDistance,
  getUsername,
  getResultMessage
} from '../../lib/game';

export default function GameClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState('TPHCM');
  const [imageData, setImageData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guessCoordinates, setGuessCoordinates] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [distance, setDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [exactLocation, setExactLocation] = useState(null);
  const [showDonate, setShowDonate] = useState(false);
  const [username, setUsernameState] = useState('');
  const [leaderboardRank, setLeaderboardRank] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.8231, 106.6297]); // Default to Ho Chi Minh
  const resultMapRef = useRef(null);
  const resultLeafletMapRef = useRef(null);

  const loadLibrariesAndInitialize = useCallback(async (locationCode) => {
    setLoading(true);
    try {
      // Set map center based on location
      const center = cityCenters[locationCode];
      if (center) {
        setMapCenter(center);
      }

      await getRandomImage(locationCode);
    } catch (error) {
      console.error('Failed to initialize:', error);
      setLoading(false);
    }
  }, []); // Remove sessionId dependency to prevent infinite loop

  useEffect(() => {
    const locationParam = searchParams.get('location') || 'TPHCM';
    setLocation(locationParam);

    // Get existing username (should be set from home page)
    const existingUsername = getUsername();
    setUsernameState(existingUsername || '');

    // Initialize the game
    loadLibrariesAndInitialize(locationParam);
  }, [searchParams]); // Remove loadLibrariesAndInitialize from deps to prevent infinite loop



  const submitGameResult = async (guessCoords) => {
    if (!guessCoords || !sessionId) return null;

    // Use username or default to 'Anonymous' if not set
    const playerName = username || 'Anonymous';

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: playerName,
          guessLat: guessCoords[0],
          guessLng: guessCoords[1],
          sessionId
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log(`Game result processed. Distance: ${data.gameResult.distance}m, Score: ${data.gameResult.score}, Rank: ${data.gameResult.rank}`);
        return data.gameResult;
      } else {
        console.error('Failed to submit game result:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Failed to submit game result:', error);
      return null;
    }
  };

  const handlePanoramaReady = useCallback(() => {
    setLoading(false);
    console.log('Panorama viewer ready');
  }, []);

  const handlePanoramaError = useCallback((error) => {
    console.error('Panorama error:', error);
    setLoading(false);
  }, []);

  const handleMapClick = (coordinates) => {
    setGuessCoordinates([coordinates.lat, coordinates.lng]);
    console.log('Map clicked at:', coordinates);
  };

  const getRandomImage = async (locationCode) => {
    try {
      console.log('Fetching random image for city:', locationCode);
      const url = sessionId ?
        `/api/new-game?city=${locationCode}&sessionId=${sessionId}` :
        `/api/new-game?city=${locationCode}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        console.log('API response data:', data);
        setSessionId(data.sessionId);
        const newImageData = {
          id: data.imageData.id,
          url: data.imageData.url,
          isPano: data.imageData.isPano
        };
        console.log('Setting imageData:', newImageData);
        setImageData(newImageData);
        // Temporarily set loading to false here to debug
        console.log('Setting loading to false');
        setLoading(false);

        console.log(`Image loaded from city bbox`);
      } else {
        throw new Error(data.error || 'No images found');
      }
    } catch (error) {
      console.error('Error fetching image after all retries:', error);
      console.error('Error details:', error.message);

      // Set imageData to null to trigger error display in PanoramaViewer
      setImageData(null);
      setSessionId(null);

      setLoading(false);

      // Only show error after all retries are complete
      // The API already handles retries internally
      alert(`Failed to load street view image after trying different search areas: ${error.message || 'No images found'}`);
    }
  };


  const handleSubmitGuess = async () => {
    if (!guessCoordinates || !imageData) return;

    setLoading(true);

    try {
      // Submit to server for processing
      const result = await submitGameResult(guessCoordinates);

      if (result) {
        // Use server-calculated values
        setDistance(result.distance);
        setScore(result.score);
        setExactLocation(result.exactLocation);
        setLeaderboardRank(result.rank);
      } else {
        // Fallback: no calculation possible without exact location
        setDistance(99999);
        setScore(0);
        setExactLocation(null);
        setLeaderboardRank(null);
      }
    } catch (error) {
      console.error('Error submitting guess:', error);

      // Fallback: no calculation possible
      setDistance(99999);
      setScore(0);
      setExactLocation(null);
      setLeaderboardRank(null);
    }

    setLoading(false);
    setShowResult(true);
  };

  const handleNextRound = () => {
    setShowResult(false);
    setGuessCoordinates(null);
    setLeaderboardRank(null);
    setExactLocation(null);
    setSessionId(null);
    getRandomImage(location);
  };

  const handleSkipGuess = async () => {
    if (!imageData) return;

    setLoading(true);

    try {
      // Just clean up the current session and move to next image
      if (sessionId) {
        await fetch('/api/skip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch (error) {
      console.error('Error cleaning up session:', error);
    }

    // Reset state and load next image
    setGuessCoordinates(null);
    setLeaderboardRank(null);
    setExactLocation(null);
    setSessionId(null);
    getRandomImage(location);
  };

  const handleGoBack = () => {
    router.push('/');
  };

  // Create result map when dialog opens
  useEffect(() => {
    console.log('Result map effect triggered:', { showResult, exactLocation, guessCoordinates, hasRef: !!resultMapRef.current });
    
    if (showResult && guessCoordinates) {
      // Clean up existing map
      if (resultLeafletMapRef.current) {
        resultLeafletMapRef.current.remove();
        resultLeafletMapRef.current = null;
      }

      // Use a more aggressive approach to wait for DOM
      const initializeMap = async () => {
        if (!resultMapRef.current) {
          console.log('Map ref not available, retrying...');
          setTimeout(initializeMap, 100);
          return;
        }
        
        console.log('Map ref found, initializing map...');
        try {
          // Dynamically import Leaflet only on client side
          const L = (await import('leaflet')).default;
          await import('leaflet/dist/leaflet.css');
          
          // Fix default marker icons issue (same as in LeafletMap component)
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });

          // Create map with explicit size settings
          const map = L.map(resultMapRef.current, {
            preferCanvas: true,
            attributionControl: true
          });

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const markers = [];

          // Guess marker (red circle) - always show this
          const redIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          const guessMarker = L.marker([guessCoordinates[0], guessCoordinates[1]], {
            icon: redIcon
          }).addTo(map).bindPopup("Your Guess");
          markers.push(guessMarker);

          // True location marker (green circle) - only if exactLocation exists
          if (exactLocation) {
            const greenIcon = L.divIcon({
              className: 'custom-div-icon',
              html: '<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            
            const trueLocationMarker = L.marker([exactLocation.lat, exactLocation.lng], {
              icon: greenIcon
            }).addTo(map).bindPopup("Actual Location");
            markers.push(trueLocationMarker);

            // Draw line between markers
            L.polyline([
              [exactLocation.lat, exactLocation.lng],
              [guessCoordinates[0], guessCoordinates[1]]
            ], { color: 'blue', weight: 3 }).addTo(map);
          }

          // Fit bounds to show all markers
          if (markers.length > 1) {
            const featureGroup = new L.featureGroup(markers);
            map.fitBounds(featureGroup.getBounds(), { 
              padding: [20, 20],
              maxZoom: 16 
            });
          } else {
            // Only guess marker, center on it
            map.setView([guessCoordinates[0], guessCoordinates[1]], 13);
          }

          // Force map to recognize its size after a delay
          setTimeout(() => {
            map.invalidateSize();
          }, 100);

          // Additional invalidation after longer delay to ensure tiles load
          setTimeout(() => {
            map.invalidateSize();
          }, 500);

          resultLeafletMapRef.current = map;
        } catch (error) {
          console.error('Error creating result map:', error);
        }
      };

      // Start trying to initialize the map
      setTimeout(initializeMap, 300);
    }
  }, [showResult, exactLocation, guessCoordinates]);

  // Clean up result map when dialog closes
  useEffect(() => {
    if (!showResult && resultLeafletMapRef.current) {
      resultLeafletMapRef.current.remove();
      resultLeafletMapRef.current = null;
    }
  }, [showResult]);

  console.log('GameClient render - loading state:', loading);
  
  if (loading) {
    console.log('Showing main loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
        <Card className="w-80">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <p className="text-muted-foreground">Loading panoramic image...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      <div className="min-h-screen bg-black/20">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-black/20">
          <Button
            onClick={handleGoBack}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <span>←</span>
            <span>Back</span>
          </Button>

          <div className="text-center">
            <div className="text-white text-2xl font-bold">VNGEOGUESSR</div>
            <Badge variant="secondary" className="text-lg bg-blue-500 text-white">
              {cityNames[location] || location}
            </Badge>
          </div>

          <Button
            onClick={() => setShowDonate(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <span>☕</span>
            <span>Donate</span>
          </Button>
        </header>

        {/* Game Content */}
        <div className="p-4 grid lg:grid-cols-2 gap-4 h-[calc(100vh-100px)]">
          {/* Panorama Viewer */}
          <div className="bg-black rounded-lg overflow-hidden">
            {imageData ? (
              <PanoramaViewer
                key={imageData.id}
                imageUrl={imageData.url}
                onReady={handlePanoramaReady}
                onError={handlePanoramaError}
              />
            ) : (
              <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                <div className="text-white">Loading panorama...</div>
              </div>
            )}
          </div>

          {/* Map and Submit */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-lg overflow-hidden flex-1">
              <LeafletMap
                center={mapCenter}
                bbox={CITIES[location]?.bbox}
                zoom={10}
                onMapClick={handleMapClick}
                className="w-full h-full min-h-[400px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitGuess}
                disabled={!guessCoordinates || loading}
                className="flex-1 py-4 text-lg font-bold"
                size="lg"
              >
                {loading ? 'PROCESSING...' : 'SUBMIT GUESS'}
              </Button>
              <Button
                onClick={handleSkipGuess}
                disabled={loading}
                variant="outline"
                className="py-4 px-6 text-lg font-bold"
                size="lg"
              >
                SKIP
              </Button>
            </div>
          </div>
        </div>

        {/* Result Modal */}
        <Dialog open={showResult} onOpenChange={() => setShowResult(false)}>
          <DialogContent className="sm:max-w-2xl" key={showResult ? 'open' : 'closed'}>
            <DialogHeader>
              <DialogTitle className="text-3xl text-center">RESULT</DialogTitle>
            </DialogHeader>

            <div className="text-center space-y-4">
              <Badge variant="secondary" className="text-2xl font-bold text-blue-600 px-4 py-2">
                {formatDistance(distance)} away
              </Badge>

              <div className="text-xl">
                Score: <Badge className="text-lg font-bold bg-green-600">{score}/5 points</Badge>
              </div>

              {leaderboardRank && (
                <Badge variant="outline" className="text-lg text-purple-600 font-semibold">
                  Vietnam Leaderboard Rank: #{leaderboardRank}
                </Badge>
              )}

              <p className="text-sm text-muted-foreground">
                Playing as: {username || 'Anonymous'} • City: {cityNames[location] || location}
              </p>
            </div>

            <Card className="my-6">
              <CardContent className="p-6">
                <div className="text-center text-lg mb-4">📍 Actual Location vs Your Guess</div>
                <div 
                  ref={resultMapRef}
                  key={`map-${sessionId}`}
                  className="h-64 w-full bg-gray-100 rounded-lg overflow-hidden"
                  style={{ minHeight: '256px' }}
                ></div>
                <div className="text-center text-muted-foreground space-y-2 mt-4">
                  {exactLocation && (
                    <p className="text-sm">
                      Actual: {exactLocation.lat.toFixed(4)}, {exactLocation.lng.toFixed(4)}
                    </p>
                  )}
                  {guessCoordinates && (
                    <p className="text-sm">
                      Guess: {guessCoordinates[0].toFixed(4)}, {guessCoordinates[1].toFixed(4)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <p className="text-lg">
                {getResultMessage(score, distance)}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleNextRound}
                  size="lg"
                  className="px-8 py-3"
                >
                  NEXT ROUND
                </Button>
                <Button
                  onClick={handleGoBack}
                  variant="secondary"
                  size="lg"
                  className="px-8 py-3"
                >
                  MENU
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        {/* Donate Modal */}
        <Dialog open={showDonate} onOpenChange={setShowDonate}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">DONATE HERE</DialogTitle>
            </DialogHeader>

            <div className="text-center space-y-6">
              <Card className="w-64 h-64 mx-auto">
                <CardContent className="h-full flex items-center justify-center">
                  <span className="text-muted-foreground">QR Code Placeholder</span>
                </CardContent>
              </Card>

              <Button
                onClick={() => setShowDonate(false)}
                className="px-6"
              >
                CLOSE
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
