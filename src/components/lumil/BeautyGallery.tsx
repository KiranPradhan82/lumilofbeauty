'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useSiteSettings } from '@/lib/useSiteSettings'

// Default images and categories
const DEFAULT_GALLERY = [
  { src: 'https://sfile.chatglm.cn/images-ppt/cd15e385424d.jpg', alt: 'Colorful gel nail art design', span: 'row-span-2', category: 'Nail Art' },
  { src: 'https://sfile.chatglm.cn/images-ppt/35ef42d1b4a9.jpg', alt: 'Bridal makeup transformation', span: '', category: 'Bridal' },
  { src: 'https://sfile.chatglm.cn/images-ppt/60a81ddbb9ca.jpg', alt: 'Luxury nail polish collection', span: '', category: 'Products' },
  { src: 'https://sfile.chatglm.cn/images-ppt/7d36496e5190.jpg', alt: 'Creative nail art patterns', span: '', category: 'Nail Art' },
  { src: 'https://sfile.chatglm.cn/images-ppt/cff50f735055.jpg', alt: 'Professional bridal makeup session', span: 'row-span-2', category: 'Bridal' },
  { src: 'https://sfile.chatglm.cn/images-ppt/d6d6726093f5.jpg', alt: 'Elegant nail design', span: '', category: 'Nail Art' },
  { src: 'https://sfile.chatglm.cn/images-ppt/0f78ad409440.jpg', alt: 'Professional makeup brush kit', span: '', category: 'Products' },
  { src: 'https://sfile.chatglm.cn/images-ppt/11a7ecc0bd59.jpg', alt: 'Floral nail art design', span: '', category: 'Nail Art' },
  { src: 'https://sfile.chatglm.cn/images-ppt/dccdc27dabfe.jpg', alt: 'Bridal makeup artist at work', span: '', category: 'Bridal' },
  { src: 'https://sfile.chatglm.cn/images-ppt/497a47774493.jpg', alt: 'Makeup palette with cosmetics', span: '', category: 'Products' },
]

const GALLERY_KEYS = [
  'galleryImage1', 'galleryImage2', 'galleryImage3', 'galleryImage4',
  'galleryImage5', 'galleryImage6', 'galleryImage7', 'galleryImage8',
  'galleryImage9', 'galleryImage10',
]

export function BeautyGallery() {
  const settings = useSiteSettings()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')

  // Build gallery from settings or defaults
  const galleryImages = DEFAULT_GALLERY.map((item, i) => ({
    ...item,
    src: (settings as any)[GALLERY_KEYS[i]] || item.src,
  }))

  const categories = ['all', 'Nail Art', 'Bridal', 'Products']
  const filtered = filter === 'all' ? galleryImages : galleryImages.filter(img => img.category === filter)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filtered.length)
    }
  }

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length)
    }
  }

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-pink-600 tracking-wider uppercase mb-3">
            Our Work
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Beauty{' '}
            <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Gallery
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Browse our stunning nail art designs, bridal makeovers, and the premium
            products our artists bring to every appointment.
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === cat
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-200/50'
                  : 'bg-pink-50 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </motion.div>

        {/* Masonry grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] sm:auto-rows-[240px]">
          <AnimatePresence mode="popLayout">
            {filtered.map((img, index) => (
              <motion.div
                key={img.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer ${img.span}`}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block text-xs font-semibold text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
                      {img.category}
                    </span>
                    <p className="text-sm text-white font-medium line-clamp-2">{img.alt}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {filtered.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goNext() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-[90vw] max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filtered[lightboxIndex].src}
                alt={filtered[lightboxIndex].alt}
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
                <span className="inline-block text-xs font-semibold text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
                  {filtered[lightboxIndex].category}
                </span>
                <p className="text-sm text-white">{filtered[lightboxIndex].alt}</p>
              </div>
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {lightboxIndex + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}