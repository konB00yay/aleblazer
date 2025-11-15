"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import L from 'leaflet'

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Create numbered markers
const createNumberedIcon = (number) => {
  return L.divIcon({
    html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${number}</div>`,
    className: 'custom-numbered-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

export default function Map({ breweries = [] }) {
  // If no breweries, show default Seattle view
  if (breweries.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
        <p className="text-gray-500">Generate a crawl to see the map</p>
      </div>
    )
  }

  // Calculate center of map based on breweries
  const center = [
    breweries.reduce((sum, b) => sum + parseFloat(b.latitude), 0) / breweries.length,
    breweries.reduce((sum, b) => sum + parseFloat(b.longitude), 0) / breweries.length,
  ]

  // Create polyline coordinates for the route
  const routeCoordinates = breweries.map(b => [
    parseFloat(b.latitude),
    parseFloat(b.longitude)
  ])

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: '500px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Draw line connecting breweries */}
      <Polyline 
        positions={routeCoordinates} 
        color="#3b82f6" 
        weight={3}
        opacity={0.7}
        dashArray="10, 10"
      />

      {/* Add numbered markers for each brewery */}
      {breweries.map((brewery, index) => (
        <Marker
          key={brewery.id}
          position={[parseFloat(brewery.latitude), parseFloat(brewery.longitude)]}
          icon={createNumberedIcon(index + 1)}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-bold text-base mb-1">
                Stop {index + 1}: {brewery.name}
              </div>
              <div className="text-gray-600">{brewery.street}</div>
              <div className="text-gray-600">{brewery.city}, {brewery.state}</div>
              {brewery.phone && (
                <div className="text-gray-600 mt-1">📞 {brewery.phone}</div>
              )}
              {brewery.website_url && (
                <a 
                  href={brewery.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-1 block"
                >
                  Visit Website →
                </a>
              )}
              {brewery.distanceFromPrevious && (
                <div className="text-blue-600 font-semibold mt-2">
                  {brewery.distanceFromPrevious} miles from previous stop
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}