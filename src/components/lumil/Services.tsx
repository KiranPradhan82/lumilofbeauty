'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Sparkles, ArrowRight } from 'lucide-react'

interface Service {
  id: string
  name: string
  slug: string
  description: string
  price: number
  duration: number
  featured: boolean
  category: { name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { services: number }
}

export function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/categories'),
        ])
        const servicesData = await servicesRes.json()
        const categoriesData = await categoriesRes.json()
        if (servicesData.success) setServices(servicesData.data)
        if (categoriesData.success) setCategories(categoriesData.data)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category.slug === activeCategory)

  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-14"
        >
          <span className="inline-block text-sm font-semibold text-pink-600 tracking-wider uppercase mb-3">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Beauty That{' '}
            <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Inspires
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Explore our curated collection of premium beauty services,
            each delivered by skilled professionals who are passionate about
            making you look and feel your absolute best.
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-200/50'
                : 'bg-pink-50 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.slug
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-200/50'
                  : 'bg-pink-50 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-pink-50/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white rounded-2xl border border-pink-50 hover:border-pink-200 shadow-sm hover:shadow-xl hover:shadow-pink-100/20 transition-all duration-300 overflow-hidden"
                >
                  {service.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                        <Sparkles className="w-3 h-3" />
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="h-1.5 bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500" />

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                        {service.category.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {service.duration} min
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                      {service.name}
                    </h3>

                    <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-pink-50">
                      <span className="text-2xl font-bold text-gray-900">Rs. {service.price.toLocaleString()}</span>
                      <button
                        onClick={() => document.querySelector('#services')?.closest('main')?.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors group/btn"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No services found in this category.</p>
          </div>
        )}
      </div>
    </section>
  )
}
