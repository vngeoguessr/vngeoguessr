import { NextResponse } from 'next/server';
import { submitScore } from '../../../lib/leaderboard.js';
import { getGameSession, deleteGameSession } from '../../../lib/session.js';
import { calculateDistance, calculateScore } from '../../../lib/game.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, guessLat, guessLng, sessionId } = body;

    // Validate required fields
    if (!username || !sessionId ||
        guessLat === undefined || guessLng === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: username, sessionId, guess coordinates'
      }, { status: 400 });
    }

    // Get session data from Redis
    const session = await getGameSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or expired'
      }, { status: 400 });
    }

    // Get target coordinates from session
    const targetLat = session.exactLocation.lat;
    const targetLng = session.exactLocation.lng;

    // Validate coordinate ranges
    const numGuessLat = Number(guessLat);
    const numGuessLng = Number(guessLng);
    const numTargetLat = Number(targetLat);
    const numTargetLng = Number(targetLng);

    // Basic coordinate validation
    if (Math.abs(numGuessLat) > 90 || Math.abs(numTargetLat) > 90) {
      return NextResponse.json({
        success: false,
        error: 'Invalid latitude values'
      }, { status: 400 });
    }

    if (Math.abs(numGuessLng) > 180 || Math.abs(numTargetLng) > 180) {
      return NextResponse.json({
        success: false,
        error: 'Invalid longitude values'
      }, { status: 400 });
    }


    // Calculate distance between guess and target (server-side)
    const distance = calculateDistance(
      numGuessLat, numGuessLng,
      numTargetLat, numTargetLng
    );

    // Calculate score based on distance (server-side)
    const finalScore = calculateScore(distance);

    // Submit to leaderboard with calculated score (both city and global)
    const leaderboardResult = await submitScore(username.trim(), finalScore, session.cityCode);

    // Log the submission for anti-cheat monitoring
    console.log('Game submission:', {
      username: username.trim(),
      distance: `${distance}m`,
      score: finalScore,
      coordinates: {
        guess: [numGuessLat, numGuessLng],
        target: [numTargetLat, numTargetLng]
      },
      timestamp: new Date().toISOString()
    });

    // Clean up session after successful submission
    await deleteGameSession(sessionId);

    return NextResponse.json({
      success: true,
      gameResult: {
        distance,
        score: finalScore,
        globalRank: leaderboardResult.global?.rank || null,
        cityRank: leaderboardResult.city?.rank || null,
        exactLocation: {
          lat: numTargetLat,
          lng: numTargetLng
        }
      },
      leaderboard: leaderboardResult,
      message: 'Game result processed successfully'
    });

  } catch (error) {
    console.error('Submit Guess Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process game result',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request) {
  return NextResponse.json({
    success: false,
    error: 'GET method not supported for game submissions'
  }, { status: 405 });
}
