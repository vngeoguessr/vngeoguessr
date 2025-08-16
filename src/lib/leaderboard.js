import { getRedis } from './redis.js';

// Leaderboard constants
const GLOBAL_LEADERBOARD_KEY = 'leaderboard:vietnam';
const CITY_LEADERBOARD_PREFIX = 'leaderboard:city:';
const MAX_LEADERBOARD_SIZE = 200;

// Helper function to get city leaderboard key
function getCityLeaderboardKey(cityCode) {
  return `${CITY_LEADERBOARD_PREFIX}${cityCode.toLowerCase()}`;
}


/**
 * Get leaderboard (global Vietnam or city-specific)
 * @param {string|null} cityCode - City code for city leaderboard, null for global Vietnam
 * @param {number} limit - Number of entries to return (default: 100)
 * @returns {Promise<Array>} Array of leaderboard entries
 */
export async function getLeaderboard(cityCode = null, limit = 100) {
  try {
    const redis = await getRedis();
    
    // Determine which leaderboard to fetch
    const leaderboardKey = cityCode ? getCityLeaderboardKey(cityCode) : GLOBAL_LEADERBOARD_KEY;
    
    // Get top entries from the sorted set (highest scores first)
    const leaderboardData = await redis.zRangeWithScores(leaderboardKey, 0, limit - 1, {
      REV: true // Reverse order to get highest scores first
    });
    
    const entries = [];
    
    // Process each entry (leaderboardData is array of {value, score} objects)
    for (let i = 0; i < leaderboardData.length; i++) {
      const entry = leaderboardData[i];
      
      entries.push({
        username: entry.value,
        score: Number(entry.score),
        rank: i + 1 // Calculate rank based on position
      });
    }
    
    return entries;
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error; // Pass through the original error for better debugging
  }
}

/**
 * Submit a score to both city and global leaderboards
 * @param {string} username - Player username  
 * @param {number} score - Score achieved (0-5)
 * @param {string} cityCode - City code where the game was played
 * @returns {Promise<Object>} Submission result with both city and global ranks
 */
export async function submitScore(username, score, cityCode) {
  try {
    const redis = await getRedis();
    
    // Validate input
    if (!username || score === undefined || !cityCode) {
      throw new Error('Missing required fields: username, score, cityCode');
    }
    
    const trimmedUsername = username.trim();
    const numScore = Number(score);
    
    // Get leaderboard keys
    const globalKey = GLOBAL_LEADERBOARD_KEY;
    const cityKey = getCityLeaderboardKey(cityCode);
    
    // Get existing scores for both leaderboards
    const [globalExisting, cityExisting] = await Promise.all([
      redis.zScore(globalKey, trimmedUsername),
      redis.zScore(cityKey, trimmedUsername)
    ]);
    
    const globalCurrentTotal = globalExisting || 0;
    const cityCurrentTotal = cityExisting || 0;
    
    // Calculate new totals
    const globalNewTotal = globalCurrentTotal + numScore;
    const cityNewTotal = cityCurrentTotal + numScore;
    
    // Update both leaderboards
    await Promise.all([
      redis.zAdd(globalKey, {
        score: globalNewTotal,
        value: trimmedUsername
      }),
      redis.zAdd(cityKey, {
        score: cityNewTotal,
        value: trimmedUsername
      })
    ]);
    
    // Keep only top 200 entries in both leaderboards
    await Promise.all([
      redis.zRemRangeByRank(globalKey, 0, -(MAX_LEADERBOARD_SIZE + 1)),
      redis.zRemRangeByRank(cityKey, 0, -(MAX_LEADERBOARD_SIZE + 1))
    ]);
    
    // Calculate current ranks
    const [globalRank, cityRank] = await Promise.all([
      redis.zRevRank(globalKey, trimmedUsername),
      redis.zRevRank(cityKey, trimmedUsername)
    ]);
    
    const actualGlobalRank = globalRank !== null ? globalRank + 1 : null;
    const actualCityRank = cityRank !== null ? cityRank + 1 : null;
    
    return {
      success: true,
      global: {
        username: trimmedUsername,
        score: Number(globalNewTotal),
        rank: actualGlobalRank
      },
      city: {
        username: trimmedUsername,
        score: Number(cityNewTotal),
        rank: actualCityRank,
        cityCode: cityCode
      },
      message: `Score added! City: ${cityNewTotal} (+${numScore}), Global: ${globalNewTotal} (+${numScore})`
    };
    
  } catch (error) {
    console.error('Error submitting score:', error);
    throw new Error(error.message || 'Failed to submit score');
  }
}

