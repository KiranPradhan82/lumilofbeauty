'use client'

import { motion } from 'framer-motion'
import { Sparkles, MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react'

const footerLinks = {
  services: [
    { label: 'Bridal Makeup', href: '#services' },
    { label: 'Party Makeup', href: '#services' },
    { label: 'Gel Manicure', href: '#services' },
    { label: 'Nail Art', href: '#services' },
    { label: 'Signature Facial', href: '#services' },
    { label: 'Hair Styling', href: '#services' },
  ],
  quickLinks: [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Book Now', href: '#services' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ],
}

export function Footer() {
  const handleNavClick = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      {/* Top CTA band */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Ready to Glow?</h3>
            <p className="text-pink-100 text-sm mt-1">Book your appointment today and experience the Lumil difference.</p>
          </div>
          <button
            onClick={() => handleNavClick('#services')}
            className="bg-white text-pink-600 hover:bg-pink-50 font-semibold rounded-full px-8 py-3 shadow-lg transition-colors shrink-0"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight">Lumil</div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-gray-500">of Beauty</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Your premier destination for professional beauty services in Nepal.
              Where artistry meets elegance, and every visit is a transformative experience.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-5">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm text-gray-400 hover:text-pink-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm text-gray-400 hover:text-pink-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Jhamsikhel, Lalitpur, Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-500 shrink-0" />
                <span className="text-sm text-gray-400">+977-9801234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-500 shrink-0" />
                <span className="text-sm text-gray-400">hello@lumilofbeauty.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-400">
                  <p>Sun - Fri: 9:00 AM - 7:00 PM</p>
                  <p>Saturday: 10:00 AM - 5:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Lumil of Beauty. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Crafted with love in Kathmandu
          </p>
        </div>
      </div>
    </footer>
  )
}
