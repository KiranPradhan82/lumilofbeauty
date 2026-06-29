'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-pink-100/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#home" onClick={(e) => { e.preventDefault(); handleNavClick('#home') }} className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200/50">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-lg sm:text-xl font-bold tracking-tight leading-tight ${scrolled ? 'text-gray-900' : 'text-white'} group-hover:text-pink-600 transition-colors`}>
                Lumil
              </span>
              <span className={`text-[10px] sm:text-xs tracking-[0.25em] uppercase leading-tight ${scrolled ? 'text-gray-400' : 'text-white/70'} transition-colors`}>
                of Beauty
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-pink-50 hover:text-pink-600 ${
                  scrolled ? 'text-gray-600' : 'text-white/90 hover:text-pink-300 hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => handleNavClick('#services')}
              className="ml-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-200/50 rounded-full px-6"
            >
              Book Now
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className={scrolled ? 'text-gray-700' : 'text-white'}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-pink-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">Lumil</span>
                  </div>
                </div>
                <div className="flex-1 py-4">
                  {navLinks.map((link, i) => (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleNavClick(link.href)}
                      className="w-full text-left px-6 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium transition-colors"
                    >
                      {link.label}
                    </motion.button>
                  ))}
                </div>
                <div className="p-6 border-t border-pink-50">
                  <Button
                    onClick={() => handleNavClick('#services')}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-full"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}
