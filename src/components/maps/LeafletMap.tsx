'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

interface LeafletMapProps {
  center: [number, number] // [lat, lng]
  zoom?: number
  onGuessPlaced?: (lat: number, lng: number) => void
  guessLocation?: { lat: number, lng: number } | null
  actualLocation?: { lat: number, lng: number } | null
  showResults?: boolean
  className?: string
}

export default function LeafletMap({
  center,
  zoom = 10,
  onGuessPlaced,
  guessLocation,
  actualLocation,
  showResults = false,
  className = ''
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const guessMarkerRef = useRef<L.Marker | null>(null)
  const actualMarkerRef = useRef<L.Marker | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView(center, zoom)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom]) // Include center and zoom dependencies

  // Handle map events separately
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Remove existing click handlers
    map.off('click')

    // Add click events for guessing
    if (onGuessPlaced && !showResults) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        onGuessPlaced(lat, lng)
      })
    }
  }, [onGuessPlaced, showResults])

  // Update map view when center/zoom changes
  useEffect(() => {
    if (!mapInstanceRef.current) return

    mapInstanceRef.current.setView(center, zoom)
  }, [center, zoom])

  // Handle guess marker
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remove existing guess marker
    if (guessMarkerRef.current) {
      mapInstanceRef.current.removeLayer(guessMarkerRef.current)
      guessMarkerRef.current = null
    }

    // Add new guess marker
    if (guessLocation) {
      const redIcon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })

      guessMarkerRef.current = L.marker([guessLocation.lat, guessLocation.lng], {
        icon: redIcon,
        draggable: !showResults
      }).addTo(mapInstanceRef.current)

      // Handle marker drag
      if (!showResults && onGuessPlaced) {
        guessMarkerRef.current.on('dragend', (e) => {
          const marker = e.target as L.Marker
          const position = marker.getLatLng()
          onGuessPlaced(position.lat, position.lng)
        })
      }
    }
  }, [guessLocation, showResults, onGuessPlaced])

  // Handle actual location marker (results view)
  useEffect(() => {
    if (!mapInstanceRef.current || !showResults) return

    // Remove existing actual marker
    if (actualMarkerRef.current) {
      mapInstanceRef.current.removeLayer(actualMarkerRef.current)
      actualMarkerRef.current = null
    }

    // Add actual location marker
    if (actualLocation) {
      const greenIcon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })

      actualMarkerRef.current = L.marker([actualLocation.lat, actualLocation.lng], {
        icon: greenIcon
      }).addTo(mapInstanceRef.current)
    }
  }, [actualLocation, showResults])

  // Handle line between markers (results view)
  useEffect(() => {
    if (!mapInstanceRef.current || !showResults) return

    // Remove existing line
    if (lineRef.current) {
      mapInstanceRef.current.removeLayer(lineRef.current)
      lineRef.current = null
    }

    // Add line between guess and actual
    if (guessLocation && actualLocation) {
      lineRef.current = L.polyline([
        [guessLocation.lat, guessLocation.lng],
        [actualLocation.lat, actualLocation.lng]
      ], {
        color: '#ef4444',
        weight: 2,
        opacity: 0.8
      }).addTo(mapInstanceRef.current)

      // Fit map to show both markers
      const group = new L.FeatureGroup([
        L.marker([guessLocation.lat, guessLocation.lng]),
        L.marker([actualLocation.lat, actualLocation.lng])
      ])
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [guessLocation, actualLocation, showResults])

  return (
    <div
      ref={mapRef}
      className={`w-full h-full rounded-lg border ${className}`}
      style={{ minHeight: '300px' }}
    />
  )
}