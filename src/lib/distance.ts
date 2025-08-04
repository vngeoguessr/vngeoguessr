/**
 * Calculate distance between two geographic points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point  
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number, 
  lng2: number
): number => {
  if (lat1 === lat2 && lng1 === lng2) {
    return 0
  }

  const radLat1 = (Math.PI * lat1) / 180
  const radLat2 = (Math.PI * lat2) / 180
  const theta = lng1 - lng2
  const radTheta = (Math.PI * theta) / 180

  let dist =
    Math.sin(radLat1) * Math.sin(radLat2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta)

  if (dist > 1) {
    dist = 1
  }

  dist = Math.acos(dist)
  dist = (dist * 180) / Math.PI
  dist = dist * 60 * 1.1515 * 1.609344 * 1000 // Convert to meters

  return Math.round(dist)
}

/**
 * Generate random location within city bounds
 * @param bounds City boundary coordinates
 * @returns Random lat/lng within bounds
 */
export const generateRandomLocation = (bounds: {
  north: number
  south: number
  east: number
  west: number
}) => {
  const lat = Math.random() * (bounds.north - bounds.south) + bounds.south
  const lng = Math.random() * (bounds.east - bounds.west) + bounds.west
  
  return { lat, lng }
}