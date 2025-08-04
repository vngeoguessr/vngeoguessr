/**
 * Calculate points based on distance (0-5 point scale)
 * @param distanceM Distance in meters
 * @returns Points earned (0-5)
 */
export const calculatePoints = (distanceM: number): number => {
  if (distanceM <= 50) return 5
  if (distanceM <= 100) return 4
  if (distanceM <= 200) return 3
  if (distanceM <= 500) return 2
  if (distanceM <= 1000) return 1
  return 0
}

/**
 * Get description for points earned
 * @param points Points earned
 * @returns Description string
 */
export const getScoreDescription = (points: number): string => {
  switch (points) {
    case 5: return "Perfect! (≤50m)"
    case 4: return "Excellent! (50-100m)"
    case 3: return "Great! (100-200m)"
    case 2: return "Good! (200-500m)"
    case 1: return "Close! (500m-1km)"
    default: return "Try again! (>1km)"
  }
}