"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import UsernameModal from './components/UsernameModal';
import DonateQRModal from './components/DonateQRModal';
import { getUsername, setUsername, cities } from '../lib/game';

export default function Home() {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [username, setUsernameState] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

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

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        console.error('Failed to fetch leaderboard:', data.error);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleLeaderboardClick = () => {
    setShowLeaderboardModal(true);
    fetchLeaderboard();
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
    if (score === 5) return 'text-green-600';
    if (score >= 4) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const isCurrentUser = (leaderboardUsername) => {
    return username && leaderboardUsername === username;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Button asChild className="bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105">
                <Link href="/" className="flex items-center gap-2">
                  <span>🏠</span>
                  <span className="font-semibold">VNGEOGUESSR</span>
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLeaderboardClick}
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <span>🏆</span>
                <span className="font-semibold">LEADERBOARD</span>
              </Button>
              <Button
                onClick={() => setShowDonateModal(true)}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black transition-all duration-200 transform hover:scale-105"
              >
                <span>☕</span>
                <span className="font-semibold">BUY ME COFFEE</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">WELCOME TO VNGEOGUESSR</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Panel - Instructions */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">HOW TO PLAY</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-white">
                  <p className="text-lg">1. Choose your city</p>
                  <p className="text-lg">2. View the street-level panoramic image</p>
                  <p className="text-lg">3. Guess the location on the map as accurately as possible</p>
                  <p className="text-lg">4. Earn points based on your accuracy!</p>
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - City Selection */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white text-center">SELECT CITY</CardTitle>
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
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center">🏆 Vietnam Leaderboard</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
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
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No scores yet!</p>
                  <p className="text-gray-500 mt-2">Be the first to play and make it to the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
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
                          {entry.score}/5
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Floating Debug Button */}
        <Button
          asChild
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gray-600 hover:bg-gray-700 shadow-lg transition-all duration-200 transform hover:scale-110 z-50"
        >
          <Link href="/debug" className="flex items-center justify-center">
            <span className="text-xl">🔧</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
