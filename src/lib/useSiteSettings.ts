'use client'

import { useState, useEffect } from 'react'

interface SiteSettings {
  companyName: string
  companyPhone: string
  companyEmail: string
  companyAddress: string
  logoUrl: string
  googleClientId: string
  parlourLat: string
  parlourLng: string
  deliveryRadiusKm: string
}

const defaultSettings: SiteSettings = {
  companyName: 'Lumil of Beauty',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',
  logoUrl: '',
  googleClientId: '',
  parlourLat: '',
  parlourLng: '',
  deliveryRadiusKm: '',
}

// Module-level cache so all components share one fetch
let cachedSettings: SiteSettings | null = null
let fetchPromise: Promise<SiteSettings> | null = null

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || defaultSettings)

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings)
      return
    }

    if (!fetchPromise) {
      fetchPromise = fetch('/api/public/settings')
        .then(r => r.json())
        .then(res => {
          const data = res.success ? res.data : {}
          cachedSettings = { ...defaultSettings, ...data }
          setSettings(cachedSettings)
          return cachedSettings
        })
        .catch(() => defaultSettings)
    }

    fetchPromise.then(s => setSettings(s))
  }, [])

  return settings
}