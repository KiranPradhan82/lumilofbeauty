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
  // Website images
  heroImage1: string
  heroImage2: string
  heroImage3: string
  heroImage4: string
  galleryImage1: string
  galleryImage2: string
  galleryImage3: string
  galleryImage4: string
  galleryImage5: string
  galleryImage6: string
  galleryImage7: string
  galleryImage8: string
  galleryImage9: string
  galleryImage10: string
  hiwImage1: string
  hiwImage2: string
  hiwImage3: string
  hiwImage4: string
  parallaxNailArt: string
  parallaxBridal: string
  wcuImage1: string
  wcuImage2: string
  wcuImage3: string
  wcuImage4: string
  wcuImage5: string
  wcuImage6: string
  testimonialImage1: string
  testimonialImage2: string
  testimonialImage3: string
  testimonialImage4: string
  testimonialImage5: string
  testimonialImage6: string
  [key: string]: string
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
  heroImage1: '',
  heroImage2: '',
  heroImage3: '',
  heroImage4: '',
  galleryImage1: '',
  galleryImage2: '',
  galleryImage3: '',
  galleryImage4: '',
  galleryImage5: '',
  galleryImage6: '',
  galleryImage7: '',
  galleryImage8: '',
  galleryImage9: '',
  galleryImage10: '',
  hiwImage1: '',
  hiwImage2: '',
  hiwImage3: '',
  hiwImage4: '',
  parallaxNailArt: '',
  parallaxBridal: '',
  wcuImage1: '',
  wcuImage2: '',
  wcuImage3: '',
  wcuImage4: '',
  wcuImage5: '',
  wcuImage6: '',
  testimonialImage1: '',
  testimonialImage2: '',
  testimonialImage3: '',
  testimonialImage4: '',
  testimonialImage5: '',
  testimonialImage6: '',
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