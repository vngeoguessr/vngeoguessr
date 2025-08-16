# Tech Stack

## Frontend Framework
- **Next.js 15.4.6**: React-based full-stack framework with App Router
- **React 19.1.0**: Latest React version for component architecture
- **Tailwind CSS 4**: Utility-first CSS framework for styling

## Street View & Mapping
- **Mapillary API**: Panoramic street-level imagery provider (thumbnail URLs)
- **Leaflet**: Interactive mapping library for guess placement
- **OpenStreetMap**: Map tile provider for base maps
- **@photo-sphere-viewer/core**: 360° panorama viewer (planned integration)

## Geographic Processing
- **@turf/turf**: Spatial operations library for distance calculations and point processing
- **Bbox-based Location**: Pre-defined city bounding boxes for location generation
- **Server-side Calculations**: All geographic processing on backend

## Data Storage & Session Management
- **Redis**: Complete session and leaderboard storage
- **Redis Sorted Sets**: Leaderboard ranking with automatic trimming
- **UUID v4**: Session identifier generation
- **30-minute Session Expiry**: Automatic Redis-based cleanup

## UI Components & Styling
- **shadcn/ui**: Complete component library with "new-york" style
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge + clsx**: Dynamic class name handling

## Form Handling & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation

## Development & Analytics
- **ESLint**: Code linting with Next.js configuration
- **Turbopack**: Development server bundler
- **@vercel/analytics**: User analytics tracking
- **@vercel/speed-insights**: Performance monitoring

## Key Dependencies
- **uuid**: v11.1.0 for unique session identifier generation
- **redis**: v5.8.0 for data persistence
- **JavaScript Only**: No TypeScript - pure JavaScript implementation
- **Individual Parameters**: Functions use separate parameters instead of object destructuring