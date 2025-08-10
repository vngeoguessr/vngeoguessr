# Project Overview

VNGeoGuessr is a GeoGuessr clone focused on Vietnamese locations, supporting 6 major cities with accurate boundary detection and anti-cheat security. Built with Next.js 15.4.6, React 19, and Tailwind CSS 4.

## Key Characteristics

- **Location Coverage**: 5 Vietnamese locations - Ha Noi, Da Nang, Ho Chi Minh, Da Lat, Duc Hoa (Long An)
- **Accurate Location Generation**: Nominatim API + Turf.js for precise city boundary detection
- **Anti-Cheat Security**: Server-side session management, no client-side target coordinates
- **Persistent Storage**: Redis-based leaderboards with top 200 players
- **Interactive Gameplay**: Click-to-guess map interface

## Game Mechanics

- **Street View**: Mapillary panoramic images with 3-tier search fallback
- **360° Viewer**: PhotoSphere Viewer with zoom and fullscreen controls
- **Interactive Maps**: Leaflet + OpenStreetMap for guess placement
- **Distance-based Scoring**: 0-5 point scale based on accuracy
- **Session Isolation**: Server-side target coordinates for security