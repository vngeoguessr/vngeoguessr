/**
 * Mapillary API utilities for fetching street-level imagery
 */

const MAPILLARY_BASE_URL = 'https://graph.mapillary.com'
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN!

export interface MapillaryImage {
  id: string
  thumb_1024_url: string
  computed_geometry: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat]
  }
}

export interface MapillaryResponse {
  data: MapillaryImage[]
  paging?: {
    next?: string
  }
}

/**
 * Search for Mapillary images within a bounding box
 * @param bounds City bounds
 * @param limit Number of images to fetch (max 2000)
 * @returns Array of Mapillary images
 */
export const searchMapillaryImages = async (
  bounds: {
    north: number
    south: number
    east: number
    west: number
  },
  limit = 100
): Promise<MapillaryImage[]> => {
  const bbox = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`
  
  const url = new URL(`${MAPILLARY_BASE_URL}/images`)
  url.searchParams.set('access_token', ACCESS_TOKEN)
  url.searchParams.set('bbox', bbox)
  url.searchParams.set('limit', limit.toString())
  url.searchParams.set('fields', 'id,thumb_1024_url,computed_geometry')

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Mapillary API error: ${response.status}`)
    }
    
    const data: MapillaryResponse = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching Mapillary images:', error)
    return []
  }
}

/**
 * Get a random Mapillary image from within city bounds
 * @param bounds City bounds  
 * @returns Random Mapillary image or null if none found
 */
export const getRandomMapillaryImage = async (
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
): Promise<MapillaryImage | null> => {
  const images = await searchMapillaryImages(bounds, 200)
  
  if (images.length === 0) {
    console.warn('No Mapillary images found in bounds')
    return null
  }
  
  const randomIndex = Math.floor(Math.random() * images.length)
  return images[randomIndex]
}

/**
 * Get Mapillary image details by ID
 * @param imageId Mapillary image ID
 * @returns Image details
 */
export const getMapillaryImageById = async (imageId: string): Promise<MapillaryImage | null> => {
  const url = new URL(`${MAPILLARY_BASE_URL}/${imageId}`)
  url.searchParams.set('access_token', ACCESS_TOKEN)
  url.searchParams.set('fields', 'id,thumb_1024_url,computed_geometry')

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Mapillary API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching Mapillary image:', error)
    return null
  }
}