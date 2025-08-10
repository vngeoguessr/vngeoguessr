import { getRedis } from './redis.js';

// Game session constants
const SESSION_KEY_PREFIX = 'session:';
const SESSION_EXPIRY = 30 * 60; // 30 minutes in seconds

/**
 * Store a game session in Redis
 * @param {string} sessionId - Unique session identifier
 * @param {Object} sessionData - Session data to store
 * @returns {Promise<boolean>} Success status
 */
export async function storeGameSession(sessionId, sessionData) {
  try {
    const redis = await getRedis();
    const key = SESSION_KEY_PREFIX + sessionId;
    
    // Store session data with expiry
    await redis.setEx(key, SESSION_EXPIRY, JSON.stringify(sessionData));
    
    return true;
  } catch (error) {
    console.error('Error storing game session:', error);
    throw error;
  }
}

/**
 * Retrieve a game session from Redis
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object|null>} Session data or null if not found
 */
export async function getGameSession(sessionId) {
  try {
    const redis = await getRedis();
    const key = SESSION_KEY_PREFIX + sessionId;
    
    const sessionData = await redis.get(key);
    
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error retrieving game session:', error);
    throw error;
  }
}

/**
 * Delete a game session from Redis
 * @param {string} sessionId - Session identifier
 * @returns {Promise<boolean>} Success status
 */
export async function deleteGameSession(sessionId) {
  try {
    const redis = await getRedis();
    const key = SESSION_KEY_PREFIX + sessionId;
    
    await redis.del(key);
    
    return true;
  } catch (error) {
    console.error('Error deleting game session:', error);
    throw error;
  }
}