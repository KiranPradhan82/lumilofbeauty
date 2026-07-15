'use client'

import { motion } from 'framer-motion'
import { Search, CalendarCheck, Truck, Heart, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: <Search className="w-7 h-7" />,
    title: 'Browse & Choose',
    description: 'Explore our curated services — bridal makeup, nail art, facials, hair styling, and more. Pick exactly what you need.',
    image: 'https://sfile.chatglm.cn/images-ppt/107c9e19e949.jpg',
    imageAlt: 'Browse beauty services and cosmetics',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
  },
  {
    icon: <CalendarCheck className="w-7 h-7" />,
    title: 'Pick Date & Location',
    description: 'Select a convenient date, time, and pin your location on the map. We will confirm your service area instantly.',
    image: 'https://sfile.chatglm.cn/images-ppt/d6d6726093f5.jpg',
    imageAlt: 'Schedule your beauty appointment',
    color: 'from-rose-500 to-fuchsia-500',
    bgColor: 'bg-rose-50',
  },
  {
    icon: <Truck className="w-7 h-7" />,
    title: 'Artist Arrives Home',
    description: 'Our certified artist arrives at your doorstep with a complete professional kit — brushes, palettes, nail supplies, and more.',
    image: 'https://sfile.chatglm.cn/images-ppt/91d7aa2f2f6c.jpg',
    imageAlt: 'Beauty artist with professional makeup kit',
    color: 'from-fuchsia-500 to-purple-500',
    bgColor: 'bg-fuchsia-50',
  },
  {
    icon: <Heart className="w-7 h-7" />,
    title: 'Look & Feel Amazing',
    description: 'Sit back and relax while we transform your look. Walk out feeling confident, glowing, and absolutely beautiful.',
    image: 'https://sfile.chatglm.cn/images-ppt/b4dd54b82d73.webp',
    imageAlt: 'Gorgeous bridal makeup result',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-pink-600 tracking-wider uppercase mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Booking your home beauty session is as easy as 1-2-3-4. No travel,
            no waiting rooms — just pure pampering at your place.
          </p>
        </motion.div>

        <div className="relative">
          {/* Desktop: horizontal timeline */}
          <div className="hidden lg:grid grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-pink-200 via-rose-200 to-purple-200" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative group"
              >
                {/* Step number circle on the line */}
                <div className="flex justify-center mb-6 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="w-14 h-14 rounded-2xl bg-white border-2 border-pink-200 flex items-center justify-center shadow-lg shadow-pink-100/30 group-hover:shadow-pink-200/50 transition-shadow"
                  >
                    <span className={`text-lg font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                      {index + 1}
                    </span>
                  </motion.div>
                </div>

                {/* Image with tilt effect */}
                <motion.div
                  whileHover={{ y: -8, rotateY: 5, rotateX: -5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl shadow-pink-100/20 mb-5 aspect-[4/3]"
                  style={{ perspective: '1000px' }}
                >
                  <img
                    src={step.image}
                    alt={step.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <div className={`text-pink-600`}>{step.icon}</div>
                  </div>
                </motion.div>

                {/* Text */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center group-hover:text-pink-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed text-center">
                  {step.description}
                </p>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="absolute top-16 -right-4 z-20 text-pink-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile: vertical cards */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex gap-5 items-start"
              >
                {/* Step indicator */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                    <div className="text-pink-600">{step.icon}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full bg-pink-100 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                      Step {index + 1}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    {step.description}
                  </p>
                  <div className="rounded-xl overflow-hidden aspect-[2/1] max-w-xs">
                    <img
                      src={step.image}
                      alt={step.imageAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA after steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-center mt-14"
        >
          <button
            onClick={() => document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-full px-8 py-3.5 font-semibold shadow-lg shadow-pink-200/40 transition-all hover:shadow-xl hover:shadow-pink-200/50"
          >
            Book Your Session Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}