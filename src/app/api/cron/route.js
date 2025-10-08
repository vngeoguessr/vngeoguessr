import { NextResponse } from 'next/server';
import { getLeaderboard } from '../../../lib/leaderboard.js';

export async function GET(request) {
  // Security check - verify CRON_SECRET
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch global leaderboard data (both score and distance)
    const [scoreLeaderboard, distanceLeaderboard] = await Promise.all([
      getLeaderboard(null, 100, 'score'),
      getLeaderboard(null, 100, 'distance')
    ]);

    // Log the fetched data for monitoring
    console.log('Cron job - Leaderboard data fetched successfully', {
      scoreEntries: scoreLeaderboard.length,
      distanceEntries: distanceLeaderboard.length,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Leaderboard data fetched successfully',
      data: {
        score: scoreLeaderboard,
        distance: distanceLeaderboard
      },
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job - Error fetching leaderboard data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leaderboard data',
      message: error.message
    }, { status: 500 });
  }
}