'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Eastern Nepal bounds (Ilam & Jhapa)
const DEFAULT_CENTER: [number, number] = [26.8, 87.9]
const DEFAULT_ZOOM = 10
const BOUNDS: [[number, number], [number, number]] = [[26.4, 87.5], [27.1, 88.2]]

interface MapPickerProps {
  latitude: number | null
  longitude: number | null
  address: string
  onLocationChange: (lat: number, lng: number, address: string) => void
  onAddressChange: (address: string) => void
}

export function MapPicker({ latitude, longitude, address, onLocationChange, onAddressChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [detecting, setDetecting] = useState(false)
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const lastExternalCoords = useRef<string>('')

  // Update map when parent sets coordinates (e.g. from manual address search or auto-detect)
  useEffect(() => {
    if (!latitude || !longitude || !mapInstanceRef.current) return
    const key = `${latitude.toFixed(6)},${longitude.toFixed(6)}`
    if (key === lastExternalCoords.current) return
    lastExternalCoords.current = key
    mapInstanceRef.current.setView([latitude, longitude], 15)
    ;(async () => {
      const L = (await import('leaflet')).default
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude])
      } else {
        markerRef.current = L.marker([latitude, longitude], { icon }).addTo(mapInstanceRef.current)
      }
    })()
  }, [latitude, longitude])

  useEffect(() => {
    setMapLoaded(false)
    const loadMap = async () => {
      const L = (await import('leaflet')).default
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      if (!mapRef.current || mapInstanceRef.current) {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
        setMapLoaded(true)
        return
      }

      const map = L.map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        maxBounds: BOUNDS,
        maxBoundsViscosity: 1.0,
        minZoom: 9,
        maxZoom: 18,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      if (latitude && longitude) {
        const m = L.marker([latitude, longitude], { icon }).addTo(map)
        markerRef.current = m
        map.setView([latitude, longitude], 14)
        lastExternalCoords.current = `${latitude.toFixed(6)},${longitude.toFixed(6)}`
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
        }
        reverseGeocode(lat, lng)
      })

      mapInstanceRef.current = map
      setMapLoaded(true)
    }
    loadMap()
  }, [])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      const data = await res.json()
      const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onAddressChange(addr)
      onLocationChange(lat, lng, addr)
    } catch {
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onAddressChange(fallback)
      onLocationChange(lat, lng, fallback)
    }
  }

  const handleDetect = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        if (lat >= 26.4 && lat <= 27.1 && lng >= 87.5 && lng <= 88.2) {
          mapInstanceRef.current?.setView([lat, lng], 15)
          const L = require('leaflet').default
          if (markerRef.current) markerRef.current.setLatLng([lat, lng])
          else {
            const icon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })
            markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current)
          }
          reverseGeocode(lat, lng)
        } else {
          alert('Please select a location within our service area (Ilam & Jhapa)')
        }
        setDetecting(false)
      },
      () => { alert('Could not detect location. Click on the map instead.'); setDetecting(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleGoToCoords = () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (isNaN(lat) || isNaN(lng)) return
    if (lat >= 26.4 && lat <= 27.1 && lng >= 87.5 && lng <= 88.2) {
      mapInstanceRef.current?.setView([lat, lng], 15)
      reverseGeocode(lat, lng)
      setManualLat(''); setManualLng('')
    } else {
      alert('Coordinates must be within Ilam & Jhapa region')
    }
  }

  const clearLocation = () => {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }
    lastExternalCoords.current = ''
    onLocationChange(0, 0, '')
    onAddressChange('')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        <MapPin className="w-4 h-4 inline mr-1.5 text-pink-500" />
        Your Location (Ilam & Jhapa)
      </label>
      <div
        ref={mapRef}
        className="w-full h-[300px] rounded-xl border border-pink-100 overflow-hidden z-0"
        style={{ background: '#f3f4f6' }}
      />
      <p className="text-xs text-gray-400">
        Click on the map to select your location. We serve Ilam and Jhapa districts.
      </p>
      <div className="relative">
        <Input
          placeholder="Your address will appear here..."
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="rounded-xl border-pink-100 focus:border-pink-400 h-12 pr-10"
        />
        {address && (
          <button onClick={clearLocation} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleDetect} disabled={detecting}
          className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50 flex-1">
          <Navigation className="w-4 h-4 mr-2" />
          {detecting ? 'Detecting...' : 'Detect My Location'}
        </Button>
        <div className="flex items-center gap-1 flex-1">
          <Input placeholder="Lat" value={manualLat} onChange={(e) => setManualLat(e.target.value)} className="rounded-xl border-pink-100 h-9 text-xs w-24" />
          <Input placeholder="Lng" value={manualLng} onChange={(e) => setManualLng(e.target.value)} className="rounded-xl border-pink-100 h-9 text-xs w-24" />
          <Button type="button" variant="outline" size="sm" onClick={handleGoToCoords} disabled={!manualLat || !manualLng}
            className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50 h-9">Go</Button>
        </div>
      </div>
    </div>
  )
}
