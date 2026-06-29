'use client'

import { motion } from 'framer-motion'
import { Award, Shield, HeartHandshake, Clock, Sparkles, Users } from 'lucide-react'

const features = [
  {
    icon: <Award className="w-7 h-7" />,
    title: 'Expert Artists',
    description: 'Our team of certified beauty professionals brings years of experience and a genuine passion for helping you look your best. Every artist undergoes rigorous training.',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: 'Premium Products',
    description: 'We use only internationally acclaimed, cruelty-free beauty products from trusted brands. Your skin deserves nothing less than the finest ingredients available.',
  },
  {
    icon: <HeartHandshake className="w-7 h-7" />,
    title: 'Personalized Care',
    description: 'Every service begins with a personal consultation to understand your unique needs, skin type, and preferences for a truly tailored beauty experience.',
  },
  {
    icon: <Clock className="w-7 h-7" />,
    title: 'Flexible Scheduling',
    description: 'Book appointments at your convenience with our easy online system. We offer flexible time slots including weekends and early morning appointments.',
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: 'Trendsetting Styles',
    description: 'Stay ahead of the curve with our artists who are constantly trained on the latest global beauty trends, techniques, and innovative treatments.',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: '5000+ Happy Clients',
    description: 'Join our growing family of satisfied clients who trust us for their most important beauty moments, from everyday looks to once-in-a-lifetime celebrations.',
  },
]

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 sm:py-28 bg-gradient-to-b from-pink-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-pink-600 tracking-wider uppercase mb-3">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Beauty,{' '}
            <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Elevated
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            At Lumil of Beauty, we believe everyone deserves to feel beautiful.
            Here is what sets us apart from the rest and keeps our clients
            coming back time after time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full bg-white rounded-2xl p-8 border border-pink-50 hover:border-pink-200 shadow-sm hover:shadow-xl hover:shadow-pink-100/20 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}