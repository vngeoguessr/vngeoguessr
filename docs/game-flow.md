# Gameplay Flow

## Complete Game Flow

### 1. Username Setup
- Check localStorage for existing username
- Display UsernameModal if not set
- Store username for leaderboard tracking

### 2. Location Selection
- Choose from 5 Vietnamese locations:
  - Ha Noi
  - Da Nang
  - Ho Chi Minh
  - Da Lat
  - Duc Hoa (Long An)

### 3. Session Creation
- Server generates unique session ID using UUID
- Server stores exact target location securely in session Map
- Client receives session ID but never the target coordinates

### 4. Location Display Process
- **Boundary Detection**: Server uses Nominatim API + Turf.js for accurate city boundary detection
- **Image Search**: Mapillary API with 3-tier fallback logic:
  1. Search within 1km radius
  2. Fallback to 2km radius if no results
  3. Final fallback to 5km radius
- **Panorama Display**: PhotoSphereViewer renders 360° street view
- **Security**: Client never receives exact target coordinates

### 5. Guessing Phase
- **Panorama Interaction**: View 360° street-level image with PhotoSphereViewer controls
- **Map Interaction**: Place guess marker on interactive Leaflet map with OpenStreetMap
- **Submission**: Click submit button to finalize guess

### 6. Server-Side Processing
- **Input**: Client submits guess coordinates + session ID only
- **Retrieval**: Server retrieves exact location from secure session storage
- **Calculation**: Server calculates distance using Turf.js (prevents client-side cheating)
- **Scoring**: Server-side score calculation with distance-based points
- **Cleanup**: Session destroyed after submission for security

### 7. Scoring System
Distance-based points (0-5 scale):
- **0-50m**: 5 points
- **50m-100m**: 4 points  
- **100m-200m**: 3 points
- **200m-500m**: 2 points
- **500m-1km**: 1 point
- **1km+**: 0 points

### 8. Results Display
- Show calculated distance between guess and actual location
- Display earned points based on accuracy
- Reveal exact target coordinates and location details
- Show current leaderboard rank (Vietnam-wide)
- Compare guess vs actual location on map

### 9. Leaderboard Management
- **Redis Storage**: Persistent storage with no expiration
- **Top 200 Limit**: Automatic trimming to maintain top performers only
- **Score Updates**: Only update if new score is higher than existing
- **Data Structure**: Username + highest score tracking

### 10. Continue or Exit
- Option to start next round with new session and location
- Option to return to city selection for different city
- Option to view full leaderboard
- Session cleanup ensures fresh start for each round