'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  videoUrl: string | null
  serviceId: string | null
  service?: { id: string; name: string; slug: string }
  linkUrl: string | null
}

export function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setBanners(res.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % Math.max(banners.length, 1))
  }, [banners.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % Math.max(banners.length, 1))
  }, [banners.length])

  // Auto-play every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [banners.length, next])

  if (loading) {
    return (
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-3xl bg-gray-100 animate-pulse" />
        </div>
      </section>
    )
  }

  if (!banners.length) return null

  const banner = banners[current]

  return (
    <section className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-pink-100/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="relative h-[300px] sm:h-[400px] lg:h-[500px]"
            >
              {/* Video or Image background */}
              {banner.videoUrl ? (
                <video
                  src={banner.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : null}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-end">
                <div className="p-6 sm:p-10 lg:p-14 max-w-2xl">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight"
                  >
                    {banner.title}
                  </motion.h3>
                  {banner.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm sm:text-base text-white/80 mb-4"
                    >
                      {banner.subtitle}
                    </motion.p>
                  )}
                  {(banner.service || banner.linkUrl) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={() => {
                          if (banner.linkUrl) {
                            window.open(banner.linkUrl, '_blank')
                          } else if (banner.service) {
                            document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                        className="bg-white text-pink-600 hover:bg-white/90 rounded-full px-6 shadow-lg"
                      >
                        {banner.linkUrl ? (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Learn More
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {banner.service?.name || 'Book This Service'}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Video indicator */}
              {banner.videoUrl && (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                  <Play className="w-3 h-3 text-white fill-white" />
                  <span className="text-xs text-white font-medium">Video</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}