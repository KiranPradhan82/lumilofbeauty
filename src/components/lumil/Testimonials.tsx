'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Bride',
    rating: 5,
    text: 'Lumil of Beauty made my wedding day absolutely magical. The bridal makeup was flawless and lasted the entire day through tears of joy and dancing. My photos look like they belong in a magazine!',
    avatar: 'PS',
    image: 'https://sfile.chatglm.cn/images-ppt/35ef42d1b4a9.jpg',
  },
  {
    name: 'Sunita Thapa',
    role: 'Nail Art Lover',
    rating: 5,
    text: 'I have been getting gel manicures here for over a year and the consistency is incredible. Every gel manicure is perfect, every time. The nail art designs are absolutely stunning and unique.',
    avatar: 'ST',
    image: 'https://sfile.chatglm.cn/images-ppt/cd15e385424d.jpg',
  },
  {
    name: 'Anjana Gurung',
    role: 'Model',
    rating: 5,
    text: 'As a model, my appearance is my career. The editorial makeup team at Lumil understands high-fashion beauty like no one else in Nepal. They are my go-to for every photoshoot.',
    avatar: 'AG',
    image: 'https://sfile.chatglm.cn/images-ppt/3cd9f08f82de.jpg',
  },
  {
    name: 'Rita Maharjan',
    role: 'Bride',
    rating: 5,
    text: 'The complete bridal package was worth every rupee. From the pre-bridal treatments to the final look, everything was perfectly coordinated. My guests kept asking who did my makeup!',
    avatar: 'RM',
    image: 'https://sfile.chatglm.cn/images-ppt/cff50f735055.jpg',
  },
  {
    name: 'Dikshya KC',
    role: 'Skincare Enthusiast',
    rating: 4,
    text: 'The Signature Facial is hands down the best facial I have ever had. My skin felt transformed after just one session. The estheticians really know their craft and recommend the right treatments.',
    avatar: 'DK',
    image: 'https://sfile.chatglm.cn/images-ppt/0124ad50d2c9.jpg',
  },
  {
    name: 'Binita Rai',
    role: 'Nail Art Lover',
    rating: 5,
    text: 'The nail art designs here are absolutely stunning. I showed them a complex reference and they executed it perfectly. Every time I get compliments on my nails, I send them straight to Lumil!',
    avatar: 'BR',
    image: 'https://sfile.chatglm.cn/images-ppt/7d36496e5190.jpg',
  },
]

// Featured testimonials for the large hero-style cards
const featuredIndices = [0, 2, 4]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const goNext = () => setActiveIndex((i) => (i + 1) % testimonials.length)
  const goPrev = () => setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length)

  const active = testimonials[activeIndex]

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-14"
        >
          <span className="inline-block text-sm font-semibold text-pink-600 tracking-wider uppercase mb-3">
            Client Love
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Clients{' '}
            <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Say
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Hear from the thousands of women who trust Lumil of Beauty
            for their most important moments.
          </p>
        </motion.div>

        {/* Featured large testimonial card */}
        <div className="mb-12">
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-pink-100/20 bg-gradient-to-br from-pink-50 to-white border border-pink-100">
            <div className="grid md:grid-cols-2">
              {/* Image side */}
              <div className="relative h-64 md:h-auto">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={active.image}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    src={active.image}
                    alt={active.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-pink-50/80 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-50/80 to-transparent md:hidden" />
              </div>

              {/* Text side */}
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <Quote className="w-10 h-10 text-pink-200 mb-4" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-700 leading-relaxed mb-6 text-base sm:text-lg italic">
                      &ldquo;{active.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold">
                        {active.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{active.name}</div>
                        <div className="text-sm text-pink-600">{active.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < active.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-3 pb-6">
              <button
                onClick={goPrev}
                className="w-10 h-10 rounded-full bg-white border border-pink-100 hover:border-pink-300 flex items-center justify-center text-gray-400 hover:text-pink-600 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'w-8 bg-pink-500' : 'w-2 bg-pink-200 hover:bg-pink-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={goNext}
                className="w-10 h-10 rounded-full bg-white border border-pink-100 hover:border-pink-300 flex items-center justify-center text-gray-400 hover:text-pink-600 transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Small testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredIndices.map((tIndex) => {
            const t = testimonials[tIndex]
            return (
              <motion.div
                key={tIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: tIndex * 0.1 }}
                className="group relative bg-gradient-to-b from-pink-50/50 to-white rounded-2xl overflow-hidden border border-pink-50 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/20 transition-all duration-300 cursor-pointer"
                onClick={() => setActiveIndex(tIndex)}
              >
                {/* Small preview image */}
                <div className="h-28 overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-50 via-transparent to-transparent" />
                </div>
                <div className="p-5 pt-3">
                  <Quote className="w-6 h-6 text-pink-200 mb-2" />
                  <p className="text-gray-600 leading-relaxed text-sm mb-4 line-clamp-3">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {t.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.role}</div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}