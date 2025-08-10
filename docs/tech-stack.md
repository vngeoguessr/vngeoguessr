# Tech Stack

## Frontend Framework
- **Next.js 15.4.6**: React-based full-stack framework with App Router
- **React 19**: Latest React version for component architecture
- **Tailwind CSS 4**: Utility-first CSS framework for styling

## Street View & Mapping
- **Mapillary API**: Panoramic street-level imagery provider
- **PhotoSphere Viewer**: 360° panorama viewer with zoom and fullscreen
- **Leaflet**: Interactive mapping library
- **OpenStreetMap**: Map tile provider for base maps

## Geographic Processing
- **Nominatim API**: OpenStreetMap geocoding service for city boundaries
- **Turf.js**: Spatial operations library for point-in-polygon detection and distance calculations
- **Geospatial Logic**: Server-side coordinate validation and boundary checking

## Data Storage & Session Management
- **Redis**: Persistent leaderboard storage with automatic trimming
- **In-Memory Map**: Server-side session storage with 30-minute expiry
- **Session Isolation**: Secure target coordinate storage per game session

## UI Components & Styling
- **shadcn/ui**: Component library with "new-york" style
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge + clsx**: Dynamic class name handling
- **CSS Variables**: Theme-based styling system

## Development & Analytics
- **ESLint**: Code linting with Next.js configuration
- **Turbopack**: Development server bundler
- **Vercel Analytics**: User analytics tracking
- **Vercel Speed Insights**: Performance monitoring

## Key Dependencies
- **UUID**: Unique session identifier generation
- **JavaScript Only**: No TypeScript - pure JavaScript implementation
- **Individual Parameters**: Functions use separate parameters instead of object destructuring