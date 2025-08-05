'use client'

import { useEffect, useRef } from 'react'
import { MapillaryImage } from '@/lib/mapillary'

interface MapillaryViewerProps {
  image: MapillaryImage | null
  className?: string
}

export default function MapillaryViewer({ image, className = '' }: MapillaryViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!image || !containerRef.current) return

    // Clear previous content
    containerRef.current.innerHTML = ''

    // Create image element
    const imgElement = document.createElement('img')
    imgElement.src = image.thumb_1024_url
    imgElement.alt = 'Street view'
    imgElement.className = 'w-full h-full object-cover rounded-lg'
    imgElement.style.userSelect = 'none'
    imgElement.style.pointerEvents = 'none'
    
    // Prevent drag
    imgElement.draggable = false
    imgElement.addEventListener('dragstart', (e) => e.preventDefault())
    imgElement.addEventListener('contextmenu', (e) => e.preventDefault())

    containerRef.current.appendChild(imgElement)

    return () => {
      const container = containerRef.current
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [image])

  if (!image) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <p>Loading street view...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-gray-100 rounded-lg overflow-hidden ${className}`}
    />
  )
}