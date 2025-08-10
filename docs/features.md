# Game Features

## Location Coverage
- **5 Vietnamese Locations**: Ha Noi, Da Nang, Ho Chi Minh, Da Lat, Duc Hoa (Long An)
- **Accurate Location Generation**: Nominatim API + Turf.js for precise city boundary detection

## Street View System
- **Mapillary Integration**: Panoramic street-level images
- **3-Tier Search Logic**: Progressive radius fallback (1km → 2km → 5km)
- **360° Panorama Viewer**: PhotoSphere Viewer with zoom and fullscreen controls

## Interactive Maps
- **Leaflet Integration**: OpenStreetMap-based interactive mapping
- **Click-to-Place**: Intuitive guess marker placement

## Anti-Cheat Security
- **Server-side Session Management**: Target coordinates never sent to client
- **Session Isolation**: Unique session IDs with automatic cleanup
- **30-minute Expiry**: Automatic session cleanup for security
- **Server-side Calculations**: All distance and scoring computed server-side

## Scoring System
Distance-based points (0-5 scale):
- **0-50m**: 5 points
- **50m-100m**: 4 points
- **100m-200m**: 3 points
- **200m-500m**: 2 points
- **500m-1km**: 1 point
- **1km+**: 0 points

## Leaderboards
- **Redis-based Storage**: Persistent leaderboard data
- **Top 100 Players**: Maximum entry limit with auto-trimming
- **Highest Score Only**: Username + best score tracking
- **No Expiration**: Persistent storage across sessions
