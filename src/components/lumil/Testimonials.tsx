'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Bride',
    rating: 5,
    text: 'Lumil of Beauty made my wedding day absolutely magical. The bridal makeup was flawless and lasted the entire day through tears of joy and dancing. My photos look like they belong in a magazine!',
    avatar: 'PS',
  },
  {
    name: 'Sunita Thapa',
    role: 'Regular Client',
    rating: 5,
    text: 'I have been coming here for over a year now and the consistency is incredible. Every gel manicure is perfect, every facial leaves my skin glowing. The team truly cares about quality.',
    avatar: 'ST',
  },
  {
    name: 'Anjana Gurung',
    role: 'Model',
    rating: 5,
    text: 'As a model, my appearance is my career. The editorial makeup team at Lumil understands high-fashion beauty like no one else in Nepal. They are my go-to for every photoshoot.',
    avatar: 'AG',
  },
  {
    name: 'Rita Maharjan',
    role: 'Bride',
    rating: 5,
    text: 'The complete bridal package was worth every rupee. From the pre-bridal treatments to the final look, everything was perfectly coordinated. My guests kept asking who did my makeup!',
    avatar: 'RM',
  },
  {
    name: 'Dikshya KC',
    role: 'Skincare Enthusiast',
    rating: 4,
    text: 'The Signature Facial is hands down the best facial I have ever had. My skin felt transformed after just one session. The estheticians really know their craft and recommend the right treatments.',
    avatar: 'DK',
  },
  {
    name: 'Binita Rai',
    role: 'Nail Art Lover',
    rating: 5,
    text: 'The nail art designs here are absolutely stunning. I showed them a complex reference and they executed it perfectly. Every time I get compliments on my nails, I send them straight to Lumil!',
    avatar: 'BR',
  },
]

export function Testimonials() {
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
            Do not just take our word for it. Hear from the thousands of women
            who trust Lumil of Beauty for their most important moments.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative bg-gradient-to-b from-pink-50/50 to-white rounded-2xl p-6 sm:p-8 border border-pink-50 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/20 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-pink-200 mb-4" />
              <p className="text-gray-600 leading-relaxed text-sm mb-6">{t.text}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
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
                      className={`w-4 h-4 ${
                        i < t.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
