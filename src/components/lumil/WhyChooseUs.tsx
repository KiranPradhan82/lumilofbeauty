'use client'

import { motion } from 'framer-motion'
import { Award, Shield, HeartHandshake, Sparkles, Users, MapPin } from 'lucide-react'

const features = [
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: 'Beauty at Your Doorstep',
    description: 'No need to travel to a salon — our skilled beauty artists come directly to your home in Ilam and Jhapa. Relax in your own space while we transform your look.',
    image: 'https://sfile.chatglm.cn/images-ppt/0124ad50d2c9.jpg',
    imageAlt: 'Premium beauty products for home service',
  },
  {
    icon: <Award className="w-7 h-7" />,
    title: 'Certified Home Artists',
    description: 'Every artist is vetted, trained, and certified. They bring their own professional kit ensuring a salon-quality experience delivered right to your living room.',
    image: 'https://sfile.chatglm.cn/images-ppt/91d7aa2f2f6c.jpg',
    imageAlt: 'Professional makeup kit and tools',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: 'Premium Products',
    description: 'We use internationally acclaimed, cruelty-free beauty products from trusted brands. The finest cosmetics for safe, beautiful results every time.',
    image: 'https://sfile.chatglm.cn/images-ppt/f4550df2907e.jpg',
    imageAlt: 'Luxury cosmetics and makeup products',
  },
  {
    icon: <HeartHandshake className="w-7 h-7" />,
    title: 'Personalized Consultation',
    description: 'Every service starts with a one-on-one consultation. Our artists assess your skin type, preferences, and occasion to deliver a truly customized experience.',
    image: 'https://sfile.chatglm.cn/images-ppt/e6525a3c519e.jpg',
    imageAlt: 'Personalized beauty consultation at home',
  },
  {
    icon: <MapPin className="w-7 h-7" />,
    title: 'Serving Ilam & Jhapa',
    description: 'Whether you are in Ilam Bazaar, Chandragadhi, Bhadrapur, Damak, or surrounding areas, our artists are ready to come to you.',
    image: 'https://sfile.chatglm.cn/images-ppt/cff50f735055.jpg',
    imageAlt: 'Beauty services across Eastern Nepal',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: '5,000+ Happy Homes',
    description: 'Join thousands of satisfied customers across Eastern Nepal who trust Lumil of Beauty for weddings, events, and everyday pampering.',
    image: 'https://sfile.chatglm.cn/images-ppt/e41bebea0ee8.jpg',
    imageAlt: 'Happy beauty service clients',
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
            professional artistry and premium products to your doorstep.
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
              <div className="h-full bg-white rounded-2xl overflow-hidden border border-pink-50 hover:border-pink-200 shadow-sm hover:shadow-xl hover:shadow-pink-100/20 transition-all duration-500">
                {/* Image area with hover zoom */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  {/* Floating icon badge */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="absolute bottom-4 left-5 w-12 h-12 rounded-xl bg-white shadow-lg shadow-pink-100/30 flex items-center justify-center text-pink-600"
                  >
                    {feature.icon}
                  </motion.div>
                </div>

                {/* Text content */}
                <div className="p-6 pt-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}