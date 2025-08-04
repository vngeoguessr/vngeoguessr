# VNGeoGuessr Gameplay Documentation

## Game Flow Overview

### 1. Authentication & Entry
- **Home Page Check**: Verify if user is logged in
- **Login Options**:
  - Sign in with existing account
  - Play as guest (with warning: scores won't be saved)
- **Guest Warning**: Clear notification that progress will be lost

### 2. City Selection
- **Available Cities**: Ho Chi Minh City, Hanoi, Da Nang, Can Tho, Nha Trang
- **City Cards**: Display city name, image preview, difficulty indicator
- **Selection**: Click to start game in selected city

### 3. Game Session Start
- **Server Process**:
  - Generate random location within selected city bounds
  - Verify Street View availability
  - Prepare panoramic image data
  - Create secure session (no location metadata in response)

### 4. Location Display
- **Panoramic View**: 
  - Full 360° street view image
  - No location hints (street names, signs blurred/hidden)
  - Navigation controls (look around, zoom)
- **Timer**: 3-minute countdown
- **UI Elements**:
  - City overview map (for guessing)
  - Timer display
  - Skip button
  - Submit guess button

### 5. Guessing Phase
- **Map Interaction**:
  - Click anywhere on city map to place guess marker
  - Drag marker to adjust position
  - Zoom in/out for precision
- **Actions Available**:
  - Submit guess (confirms location)
  - Skip location (0 points, new location)
  - Time expires (auto-submit current guess or 0 points)

### 6. Scoring Calculation
- **Distance Measurement**: Server calculates straight-line distance
- **Point System**:
  - 0-50 meters = 5 points
  - 50-100 meters = 4 points
  - 100-200 meters = 3 points
  - 200-500 meters = 2 points
  - 500-1000 meters = 1 point
  - Over 1000 meters = 0 points
- **Database Update**: Save guess, distance, points to user session

### 7. Results Display
- **Result Screen Shows**:
  - Your guess location (red marker)
  - Actual location (green marker)
  - Distance between points
  - Points earned this round
  - Total session score
  - Current leaderboard position
- **Location Exploration**:
  - Allow navigation around actual location
  - Show nearby landmarks/streets
  - Optional: Location facts/info

### 8. Continue Game
- **Next Round Button**: Continue to new location
- **End Session Button**: Finish and save final score
- **Play Again**: Start new session in same/different city

## Technical Implementation Details

### Security Measures
- **No Location Metadata**: API responses exclude lat/lng coordinates
- **Server-side Validation**: All distance calculations on backend
- **Session Management**: Secure session tokens prevent cheating

### Data Flow
1. Client requests location for city
2. Server selects random verified location
3. Server returns panorama data + session ID (no coordinates)
4. Client submits guess coordinates
5. Server calculates distance + points
6. Server returns results + updates database
7. Client displays results + continues

### Performance Considerations
- **Image Optimization**: Compress panoramic images
- **Caching**: Cache city bounds and common UI elements
- **Progressive Loading**: Load map tiles as needed
- **Mobile Responsiveness**: Touch-friendly controls

### Database Operations
- **Session Creation**: New record in user_sessions table
- **Guess Recording**: Each guess saved with metadata
- **Leaderboard Updates**: Real-time ranking calculations
- **Statistics Tracking**: Games played, average score, best streaks