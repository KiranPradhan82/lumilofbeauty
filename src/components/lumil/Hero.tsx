'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowDown, Sparkles, Star, MapPin } from 'lucide-react'

// Beauty product images for floating effect
const floatingImages = [
  {
    src: 'https://sfile.chatglm.cn/images-ppt/497a47774493.jpg',
    alt: 'Makeup palette',
    className: 'top-[12%] right-[5%] w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48',
    delay: 0,
    duration: 6,
    rotate: 12,
  },
  {
    src: 'https://sfile.chatglm.cn/images-ppt/60a81ddbb9ca.jpg',
    alt: 'Nail polish collection',
    className: 'bottom-[15%] left-[3%] w-32 h-24 sm:w-44 sm:h-32 lg:w-56 lg:h-40',
    delay: 1,
    duration: 7,
    rotate: -8,
  },
  {
    src: 'https://sfile.chatglm.cn/images-ppt/f4550df2907e.jpg',
    alt: 'Makeup kit',
    className: 'top-[55%] right-[8%] w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36',
    delay: 2,
    duration: 5.5,
    rotate: 15,
  },
  {
    src: 'https://sfile.chatglm.cn/images-ppt/302de3c55820.jpg',
    alt: 'Nail polish bottles',
    className: 'top-[8%] left-[5%] w-16 h-24 sm:w-20 sm:h-32 lg:w-24 lg:h-40',
    delay: 0.5,
    duration: 8,
    rotate: -6,
  },
]

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-white/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full border border-white/10"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl"
        />

        {/* Floating beauty product images */}
        {floatingImages.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [0.95, 1.05, 0.95],
              y: [0, -12, 0],
            }}
            transition={{
              duration: img.duration,
              repeat: Infinity,
              delay: img.delay,
              ease: 'easeInOut',
            }}
            className={`absolute ${img.className} hidden md:block`}
          >
            <div
              className="w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border-2 border-white/20 backdrop-blur-sm"
              style={{ transform: `rotate(${img.rotate}deg)` }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
        ))}

        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute text-white/20"
            style={{
              top: `${20 + i * 12}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-white/90 text-sm font-medium">Home Beauty Services in Eastern Nepal</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
        >
          Beauty Comes{' '}
          <span className="relative">
            <span className="relative z-10">To You</span>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 1 }}
              className="absolute bottom-2 left-0 h-3 bg-white/30 rounded-full -z-0"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Professional beauty artists travel to your doorstep in Ilam and Jhapa.
          From bridal makeup to spa treatments, experience salon-quality beauty
          in the comfort of your home.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={() => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="bg-white text-pink-600 hover:bg-white/90 rounded-full px-8 h-14 text-base font-semibold shadow-2xl shadow-black/10"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Explore Services
          </Button>
          <Button
            onClick={() => document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-base font-medium backdrop-blur-sm"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Book at Your Location
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
        >
          {[
            { value: '5000+', label: 'Happy Clients' },
            { value: '50+', label: 'Expert Artists' },
            { value: '4.9', label: 'Star Rating' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className="w-6 h-6 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}