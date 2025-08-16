# Project Overview

VNGeoGuessr is a GeoGuessr clone focused on Vietnamese locations, supporting 5 major cities with bbox-based location generation and anti-cheat security. Built with Next.js 15.4.6, React 19, and Tailwind CSS 4.

## Key Characteristics

- **Location Coverage**: 5 Vietnamese locations - Ha Noi, Da Nang, Ho Chi Minh, Da Lat, Duc Hoa (Long An)
- **Bbox-based Location Generation**: Pre-defined bounding boxes for accurate city area targeting
- **Anti-Cheat Security**: Redis-based session management, server-side coordinate storage
- **Persistent Storage**: Redis-based leaderboards with top 200 players
- **Interactive Gameplay**: Click-to-guess map interface

## Game Mechanics

- **Street View**: Mapillary panoramic images using city bbox filtering
- **360° Viewer**: Thumbnail images with planned PhotoSphere Viewer integration
- **Interactive Maps**: Leaflet + OpenStreetMap for guess placement
- **Distance-based Scoring**: 0-5 point scale based on accuracy (Turf.js calculations)
- **Session Isolation**: Redis-stored sessions with 30-minute expiry for security