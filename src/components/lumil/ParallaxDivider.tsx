'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface ParallaxDividerProps {
  image: string
  alt: string
  overlayText?: string
  overlaySubtext?: string
  direction?: 'left' | 'right'
  height?: string
}

export function ParallaxDivider({
  image,
  alt,
  overlayText,
  overlaySubtext,
  direction = 'right',
  height = 'h-[300px] sm:h-[400px]',
}: ParallaxDividerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6])

  return (
    <div ref={ref} className={`relative ${height} overflow-hidden`}>
      <motion.div
        style={{ y }}
        className="absolute inset-0"
      >
        <img
          src={image}
          alt={alt}
          className="w-full h-[120%] object-cover"
          loading="lazy"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      {direction === 'left' && (
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Text overlay */}
      {overlayText && (
        <motion.div
          style={{ opacity }}
          className="relative z-10 h-full flex items-center"
        >
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${
            direction === 'right' ? 'ml-auto' : ''
          }`}>
            <div className={`max-w-md ${direction === 'right' ? 'text-right ml-auto' : 'text-left'}`}>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                {overlayText}
              </h3>
              {overlaySubtext && (
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  {overlaySubtext}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Pre-configured divider compositions
export function DividerNailArt() {
  return (
    <ParallaxDivider
      image="https://sfile.chatglm.cn/images-ppt/5b6c770a5f79.jpg"
      alt="Stunning nail art designs"
      overlayText="Nail Art That Tells Your Story"
      overlaySubtext="From elegant French tips to bold artistic designs, our nail artists create masterpieces on every fingertip."
      direction="left"
    />
  )
}

export function DividerBridal() {
  return (
    <ParallaxDivider
      image="https://sfile.chatglm.cn/images-ppt/3cd9f08f82de.jpg"
      alt="Bridal makeup session"
      overlayText="Your Dream Bridal Look, Delivered Home"
      overlaySubtext="Our bridal specialists arrive with complete kits to create the perfect look for your most special day."
      direction="right"
    />
  )
}