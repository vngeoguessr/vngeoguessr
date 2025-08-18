"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsernameModal from './components/UsernameModal';
import DonateQRModal from './components/DonateQRModal';
import { getUsername, setUsername, cities, formatDistance, getDistanceColor } from '../lib/game';

export default function Home() {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [username, setUsernameState] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [activeLocationTab, setActiveLocationTab] = useState('global');
  const [activeTypeTab, setActiveTypeTab] = useState('score');
  const [cityLeaderboards, setCityLeaderboards] = useState({});
  const [distanceLeaderboard, setDistanceLeaderboard] = useState([]);
  const [cityDistanceLeaderboards, setCityDistanceLeaderboards] = useState({});

  useEffect(() => {
    // Check for existing username on page load
    const existingUsername = getUsername();
    if (existingUsername) {
      setUsernameState(existingUsername);
    } else {
      setShowUsernameModal(true);
    }
  }, []);

  const handleUsernameSubmit = (newUsername) => {
    setUsername(newUsername);
    setUsernameState(newUsername);
    setShowUsernameModal(false);
  };

  const handleUsernameSkip = () => {
    setShowUsernameModal(false);
  };

  const fetchLeaderboard = async (cityCode = null, type = 'score') => {
    setLoadingLeaderboard(true);
    try {
      const params = new URLSearchParams();
      if (cityCode) params.append('city', cityCode);
      if (type) params.append('type', type);

      const url = `/api/leaderboard?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        if (type === 'distance') {
          if (cityCode) {
            setCityDistanceLeaderboards(prev => ({
              ...prev,
              [cityCode]: data.leaderboard
            }));
          } else {
            setDistanceLeaderboard(data.leaderboard);
          }
        } else {
          if (cityCode) {
            setCityLeaderboards(prev => ({
              ...prev,
              [cityCode]: data.leaderboard
            }));
          } else {
            setLeaderboard(data.leaderboard);
          }
        }
      } else {
        console.error('Failed to fetch leaderboard:', data.error);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const fetchAllLeaderboards = async () => {
    setLoadingLeaderboard(true);
    try {
      // Fetch global score leaderboard
      await fetchLeaderboard(null, 'score');

      // Fetch global distance leaderboard
      await fetchLeaderboard(null, 'distance');

      // Fetch all city score leaderboards
      const cityScorePromises = cities.map(city => fetchLeaderboard(city.code, 'score'));
      await Promise.all(cityScorePromises);

      // Fetch all city distance leaderboards
      const cityDistancePromises = cities.map(city => fetchLeaderboard(city.code, 'distance'));
      await Promise.all(cityDistancePromises);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleLeaderboardClick = () => {
    setShowLeaderboardModal(true);
    fetchAllLeaderboards();
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 50) return 'text-purple-600';
    if (score >= 25) return 'text-green-600';
    if (score >= 15) return 'text-blue-600';
    if (score >= 10) return 'text-yellow-600';
    if (score >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const isCurrentUser = (leaderboardUsername) => {
    return username && leaderboardUsername === username;
  };

  const renderLeaderboardContent = (leaderboardData, title) => (
    <>
      {title && <h3 className="text-xl font-bold text-center mb-4">{title}</h3>}
      {loadingLeaderboard ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-100">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No scores yet!</p>
          <p className="text-gray-500 mt-2">Be the first to play in this category!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboardData.map((entry, index) => (
            <div
              key={entry.username}
              className={`flex items-center justify-between p-4 rounded-lg transition-all ${isCurrentUser(entry.username)
                  ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg'
                  : entry.rank <= 3
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold w-12 text-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <div className={`font-semibold text-lg ${isCurrentUser(entry.username) ? 'text-yellow-800' : 'text-gray-800'
                    }`}>
                    {entry.username}
                    {isCurrentUser(entry.username) && (
                      <Badge className="ml-2 bg-yellow-500 text-black">YOU</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Badge variant="secondary" className={`text-xl font-bold ${getScoreColor(entry.score)}`}>
                  {entry.score}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderDistanceLeaderboardContent = (leaderboardData, title) => (
    <>
      {title && <h3 className="text-xl font-bold text-center mb-4">{title}</h3>}
      {loadingLeaderboard ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-100">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No records yet!</p>
          <p className="text-gray-500 mt-2">Be the first to play in this category!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboardData.map((entry, index) => (
            <div
              key={`${entry.username}-${entry.timestamp}`}
              className={`flex items-center justify-between p-4 rounded-lg transition-all ${isCurrentUser(entry.username)
                  ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg'
                  : entry.rank <= 3
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold w-12 text-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <div className={`font-semibold text-lg ${isCurrentUser(entry.username) ? 'text-yellow-800' : 'text-gray-800'
                    }`}>
                    {entry.username}
                    {isCurrentUser(entry.username) && (
                      <Badge className="ml-2 bg-yellow-500 text-black">YOU</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <Badge variant="secondary" className={`text-xl font-bold ${getDistanceColor(entry.distance)}`}>
                  {formatDistance(entry.distance)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Button asChild className="bg-black hover:bg-gray-800 text-white transition-all duration-200 transform hover:scale-105">
                <Link href="/" className="flex items-center gap-2">
                  <span>🏠</span>
                  <span className="font-semibold">VNGEOGUESSR</span>
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLeaderboardClick}
                className="bg-gray-700 hover:bg-gray-800 text-white transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <span>🏆</span>
                <span className="font-semibold">LEADERBOARD</span>
              </Button>
              <Button
                onClick={() => setShowDonateModal(true)}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black border border-gray-300 transition-all duration-200 transform hover:scale-105"
              >
                <span>☕</span>
                <span className="font-semibold">BUY ME A COFFEE</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">WELCOME TO VNGEOGUESSR</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Panel - Instructions */}
            <Card className="bg-white border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-black">HOW TO PLAY</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-black">
                  <p className="text-lg">1. Choose your city</p>
                  <p className="text-lg">2. View the street-level panoramic image</p>
                  <p className="text-lg">3. Guess the location on the map as accurately as possible</p>
                  <p className="text-lg">4. Earn points based on your accuracy!</p>
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - City Selection */}
            <Card className="bg-white border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-black text-center">SELECT CITY</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {cities.map((city) => (
                    <Button
                      key={city.code}
                      asChild
                      className="w-full font-bold py-3 px-6 transition-all duration-200 transform hover:scale-105"
                      size="lg"
                    >
                      <Link href={`/game?location=${city.code}`}>
                        {city.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Donate Modal */}
        <DonateQRModal
          isOpen={showDonateModal}
          onClose={() => setShowDonateModal(false)}
        />

        {/* Username Modal */}
        <UsernameModal
          isOpen={showUsernameModal}
          onSubmit={handleUsernameSubmit}
          onClose={handleUsernameSkip}
        />

        {/* Leaderboard Modal */}
        <Dialog open={showLeaderboardModal} onOpenChange={setShowLeaderboardModal}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center">🏆 VNGeoGuessr Leaderboards</DialogTitle>
            </DialogHeader>

            {/* Horizontal Location Tabs */}
            <Tabs value={activeLocationTab} onValueChange={setActiveLocationTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="global">🌏 Global</TabsTrigger>
                {cities.map(city => (
                  <TabsTrigger key={city.code} value={city.code}>
                    {city.code}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Global Location Content */}
              <TabsContent value="global" className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-center text-gray-800">
                    🌏 Global Vietnam Leaderboards
                  </h3>
                  <p className="text-sm text-center text-gray-600 mt-1">
                    Rankings across all Vietnamese cities
                  </p>
                </div>

                <div className="flex gap-4">
                  {/* Vertical Type Tabs */}
                  <div className="flex flex-col space-y-2 min-w-[120px]">
                    <div className="text-xs font-medium text-gray-500 mb-1 px-2">VIEW TYPE</div>
                    <button
                      onClick={() => setActiveTypeTab('score')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTypeTab === 'score'
                          ? 'bg-black text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📊 Score
                    </button>
                    <button
                      onClick={() => setActiveTypeTab('distance')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTypeTab === 'distance'
                          ? 'bg-gray-700 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📏 Distance
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1">
                    {activeTypeTab === 'score' && (
                      renderLeaderboardContent(leaderboard, "")
                    )}
                    {activeTypeTab === 'distance' && (
                      renderDistanceLeaderboardContent(distanceLeaderboard, "")
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* City Location Content */}
              {cities.map(city => (
                <TabsContent key={city.code} value={city.code} className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-center text-gray-800">
                      🏙️ {city.name} Leaderboards
                    </h3>
                    <p className="text-sm text-center text-gray-600 mt-1">
                      City-specific rankings for {city.name}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    {/* Vertical Type Tabs */}
                    <div className="flex flex-col space-y-2 min-w-[120px]">
                      <div className="text-xs font-medium text-gray-500 mb-1 px-2">VIEW TYPE</div>
                      <button
                        onClick={() => setActiveTypeTab('score')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTypeTab === 'score'
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        📊 Score
                      </button>
                      <button
                        onClick={() => setActiveTypeTab('distance')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTypeTab === 'distance'
                            ? 'bg-gray-700 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        📏 Distance
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                      {activeTypeTab === 'score' && (
                        renderLeaderboardContent(cityLeaderboards[city.code] || [], "")
                      )}
                      {activeTypeTab === 'distance' && (
                        renderDistanceLeaderboardContent(cityDistanceLeaderboards[city.code] || [], "")
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}

              {/* Scoring Legend */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-center">Scoring System</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>0-50m = 5 points ⭐⭐⭐⭐⭐</div>
                    <div>50-100m = 4 points ⭐⭐⭐⭐</div>
                    <div>100-200m = 3 points ⭐⭐⭐</div>
                    <div>200-500m = 2 points ⭐⭐</div>
                    <div>500m-1km = 1 point ⭐</div>
                    <div>1km+ = 0 points</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-700 mb-1">📊 Score Leaderboards</div>
                        <div className="text-gray-600">Accumulated points across all games</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-700 mb-1">📏 Distance Leaderboards</div>
                        <div className="text-gray-600">Best distance records (multiple entries per user)</div>
                      </div>
                    </div>
                    <p className="text-sm text-center font-medium text-gray-700 mt-3">
                      🏆 Choose location (Global/City) and view type (Score/Distance) above
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Floating Debug Button */}
        <Button
          asChild
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black hover:bg-gray-800 text-white shadow-lg transition-all duration-200 transform hover:scale-110 z-50"
        >
          <Link href="/debug" className="flex items-center justify-center">
            <span className="text-xl">🔧</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
