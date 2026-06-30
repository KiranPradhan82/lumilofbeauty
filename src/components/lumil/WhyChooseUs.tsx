'use client'

import { motion } from 'framer-motion'
import { Award, Shield, HeartHandshake, Clock, Sparkles, Users, MapPin, Home, Truck } from 'lucide-react'

const features = [
  {
    icon: <Home className="w-7 h-7" />,
    title: 'Beauty at Your Doorstep',
    description: 'No need to travel to a salon — our skilled beauty artists come directly to your home in Ilam and Jhapa. Relax in your own space while we transform your look with professional care and expertise.',
  },
  {
    icon: <Award className="w-7 h-7" />,
    title: 'Certified Home Artists',
    description: 'Every artist on our platform is vetted, trained, and certified. They bring their own professional kit and products, ensuring a salon-quality experience delivered right to your living room or venue.',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: 'Premium Products',
    description: 'We use only internationally acclaimed, cruelty-free beauty products from trusted brands. Our artists carry the finest cosmetics and skincare products to ensure safe, beautiful results every time.',
  },
  {
    icon: <HeartHandshake className="w-7 h-7" />,
    title: 'Personalized Consultation',
    description: 'Every service starts with a one-on-one consultation at your home. Our artists assess your skin type, preferences, and the occasion to deliver a truly customized beauty experience tailored to you.',
  },
  {
    icon: <MapPin className="w-7 h-7" />,
    title: 'Serving Ilam & Jhapa',
    description: 'We proudly serve communities across Eastern Nepal. Whether you are in Ilam Bazaar, Chandragadhi, Bhadrapur, Damak, or surrounding areas, our artists are ready to come to you.',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: '5,000+ Happy Homes',
    description: 'Join thousands of satisfied customers across Eastern Nepal who trust Lumil of Beauty for weddings, events, and everyday pampering — all without leaving their homes.',
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
            Home Beauty,{' '}
            <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Elevated
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Why travel to a salon when beauty can come to you? Lumil of Beauty brings
            professional artistry and premium products to your doorstep across
            Ilam and Jhapa.
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