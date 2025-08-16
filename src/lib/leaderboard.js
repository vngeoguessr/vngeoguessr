import { getRedis } from './redis.js';

// Leaderboard constants
const GLOBAL_LEADERBOARD_KEY = 'leaderboard:vietnam';
const CITY_LEADERBOARD_PREFIX = 'leaderboard:city:';
const DISTANCE_GLOBAL_KEY = 'distance:vietnam';
const DISTANCE_CITY_PREFIX = 'distance:city:';
const MAX_LEADERBOARD_SIZE = 200;

// Helper function to get city leaderboard key
function getCityLeaderboardKey(cityCode) {
  return `${CITY_LEADERBOARD_PREFIX}${cityCode.toLowerCase()}`;
}

// Helper function to get distance leaderboard key
function getDistanceLeaderboardKey(cityCode = null) {
  return cityCode ? `${DISTANCE_CITY_PREFIX}${cityCode.toLowerCase()}` : DISTANCE_GLOBAL_KEY;
}


/**
 * Get leaderboard (global Vietnam or city-specific)
 * @param {string|null} cityCode - City code for city leaderboard, null for global Vietnam
 * @param {number} limit - Number of entries to return (default: 100)
 * @param {string} type - Leaderboard type: 'score' or 'distance' (default: 'score')
 * @returns {Promise<Array>} Array of leaderboard entries
 */
export async function getLeaderboard(cityCode = null, limit = 100, type = 'score') {
  try {
    const redis = await getRedis();
    
    // Determine which leaderboard to fetch
    let leaderboardKey;
    if (type === 'distance') {
      leaderboardKey = getDistanceLeaderboardKey(cityCode);
    } else {
      leaderboardKey = cityCode ? getCityLeaderboardKey(cityCode) : GLOBAL_LEADERBOARD_KEY;
    }
    
    // Get entries from the sorted set
    const leaderboardData = await redis.zRangeWithScores(leaderboardKey, 0, limit - 1, {
      REV: type === 'score' // Reverse for scores (highest first), normal for distance (lowest first)
    });
    
    const entries = [];
    
    // Process each entry (leaderboardData is array of {value, score} objects)
    for (let i = 0; i < leaderboardData.length; i++) {
      const entry = leaderboardData[i];
      
      if (type === 'distance') {
        // For distance leaderboards, parse the entry format: "username:distance:timestamp"
        const [username, distance, timestamp] = entry.value.split(':');
        entries.push({
          username,
          distance: Number(distance),
          timestamp: Number(timestamp),
          rank: i + 1
        });
      } else {
        // For score leaderboards
        entries.push({
          username: entry.value,
          score: Number(entry.score),
          rank: i + 1
        });
      }
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

/**
 * Submit a distance record to both city and global distance leaderboards
 * @param {string} username - Player username  
 * @param {number} distance - Distance achieved in meters
 * @param {string} cityCode - City code where the game was played
 * @returns {Promise<Object>} Submission result with distance ranks
 */
export async function submitDistanceRecord(username, distance, cityCode) {
  try {
    const redis = await getRedis();
    
    // Validate input
    if (!username || distance === undefined || !cityCode) {
      throw new Error('Missing required fields: username, distance, cityCode');
    }
    
    const trimmedUsername = username.trim();
    const numDistance = Number(distance);
    const timestamp = Date.now();
    
    // Create unique entry identifier for this specific record
    const entryId = `${trimmedUsername}:${numDistance}:${timestamp}`;
    
    // Get distance leaderboard keys
    const globalDistanceKey = getDistanceLeaderboardKey();
    const cityDistanceKey = getDistanceLeaderboardKey(cityCode);
    
    // Add distance record to both leaderboards (using distance as score, lower is better)
    await Promise.all([
      redis.zAdd(globalDistanceKey, {
        score: numDistance,
        value: entryId
      }),
      redis.zAdd(cityDistanceKey, {
        score: numDistance,
        value: entryId
      })
    ]);
    
    // Keep only top 200 entries in both distance leaderboards
    await Promise.all([
      redis.zRemRangeByRank(globalDistanceKey, MAX_LEADERBOARD_SIZE, -1),
      redis.zRemRangeByRank(cityDistanceKey, MAX_LEADERBOARD_SIZE, -1)
    ]);
    
    // Calculate current ranks for this specific record
    const [globalRank, cityRank] = await Promise.all([
      redis.zRank(globalDistanceKey, entryId),
      redis.zRank(cityDistanceKey, entryId)
    ]);
    
    const actualGlobalRank = globalRank !== null ? globalRank + 1 : null;
    const actualCityRank = cityRank !== null ? cityRank + 1 : null;
    
    return {
      success: true,
      globalDistance: {
        username: trimmedUsername,
        distance: numDistance,
        rank: actualGlobalRank
      },
      cityDistance: {
        username: trimmedUsername,
        distance: numDistance,
        rank: actualCityRank,
        cityCode: cityCode
      },
      message: `Distance record: ${numDistance}m`
    };
    
  } catch (error) {
    console.error('Error submitting distance record:', error);
    throw new Error(error.message || 'Failed to submit distance record');
  }
}

