import { getRedis } from './redis.js';

// Global Vietnam leaderboard constants
const LEADERBOARD_KEY = 'leaderboard:vietnam';
const MAX_LEADERBOARD_SIZE = 200;


/**
 * Get the global Vietnam leaderboard
 * @param {number} limit - Number of entries to return (default: 100)
 * @returns {Promise<Array>} Array of leaderboard entries
 */
export async function getLeaderboard(limit = 100) {
  try {
    const redis = await getRedis();
    
    // Get top entries from the sorted set (highest scores first)
    const leaderboardData = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, limit - 1, {
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
 * Submit a score to the global Vietnam leaderboard
 * @param {string} username - Player username  
 * @param {number} score - Score achieved (0-5)
 * @returns {Promise<Object>} Submission result with rank
 */
export async function submitScore(username, score) {
  try {
    const redis = await getRedis();
    
    // Validate input
    if (!username || score === undefined) {
      throw new Error('Missing required fields: username, score');
    }
    
    const trimmedUsername = username.trim();
    const numScore = Number(score);
    
    // Get existing accumulated score
    const existingScore = await redis.zScore(LEADERBOARD_KEY, trimmedUsername);
    const currentTotal = existingScore || 0;
    
    // Add new score to accumulated total
    const newTotal = currentTotal + numScore;
    
    // Update user's accumulated score in the leaderboard
    await redis.zAdd(LEADERBOARD_KEY, {
      score: newTotal,
      value: trimmedUsername
    });
    
    // Keep only top 200 entries to manage storage
    await redis.zRemRangeByRank(LEADERBOARD_KEY, 0, -(MAX_LEADERBOARD_SIZE + 1));
    
    // Calculate current rank
    const rank = await redis.zRevRank(LEADERBOARD_KEY, trimmedUsername);
    const actualRank = rank !== null ? rank + 1 : null;
    
    return {
      success: true,
      entry: { 
        username: trimmedUsername, 
        score: Number(newTotal),
        rank: actualRank 
      },
      message: `Score added! Total: ${newTotal} (+${numScore})`
    };
    
  } catch (error) {
    console.error('Error submitting score:', error);
    throw new Error(error.message || 'Failed to submit score');
  }
}

