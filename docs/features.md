# Game Features

## Location Coverage
- **5 Vietnamese Locations**: Ha Noi, Da Nang, Ho Chi Minh, Da Lat, Duc Hoa (Long An)
- **Bbox-based Location Generation**: Pre-defined city bounding boxes for accurate area targeting
- **Random Location Selection**: Server-side random coordinate generation within city boundaries

## Street View System
- **Mapillary Integration**: Panoramic street-level images via Mapillary API
- **Bbox Filtering**: Direct city bbox filtering for image search (no fallback tiers)
- **Panoramic Image Priority**: Filters for is_pano=true images when available
- **Thumbnail Display**: Currently uses thumb_original_url for image display

## Interactive Maps
- **Leaflet Integration**: OpenStreetMap-based interactive mapping
- **Click-to-Place**: Intuitive guess marker placement

## Anti-Cheat Security
- **Redis Session Management**: Target coordinates stored server-side in Redis
- **UUID Session IDs**: Unique session identifiers using uuid v4
- **30-minute Expiry**: Automatic Redis session cleanup for security
- **Server-side Calculations**: All distance and scoring computed server-side using Turf.js
- **Session Cleanup**: Automatic session deletion after guess submission

## Scoring System
Distance-based points (0-5 scale):
- **0-50m**: 5 points
- **50m-100m**: 4 points
- **100m-200m**: 3 points
- **200m-500m**: 2 points
- **500m-1km**: 1 point
- **1km+**: 0 points

## Leaderboards
- **Redis Sorted Sets**: Persistent leaderboard data using Redis ZADD/ZRANGE
- **Top 200 Players**: Maximum entry limit with automatic trimming
- **Highest Score Only**: Only updates if new score exceeds existing score
- **Persistent Storage**: No expiration on leaderboard data
- **Real-time Ranking**: Dynamic rank calculation based on current standings
