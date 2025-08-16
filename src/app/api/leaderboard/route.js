import { NextResponse } from 'next/server';
import { getLeaderboard } from '../../../lib/leaderboard.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityCode = searchParams.get('city'); // Optional city parameter
    const limit = parseInt(searchParams.get('limit')) || 100;
    const type = searchParams.get('type') || 'score'; // 'score' or 'distance'

    // Get leaderboard entries (city-specific or global, score or distance)
    const leaderboard = await getLeaderboard(cityCode, limit, type);

    return NextResponse.json({
      success: true,
      leaderboard,
      count: leaderboard.length,
      type: cityCode ? 'city' : 'global',
      leaderboardType: type,
      cityCode: cityCode || null
    });

  } catch (error) {
    console.error('Leaderboard GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leaderboard',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
