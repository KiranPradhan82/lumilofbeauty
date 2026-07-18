'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard, Scissors, FolderOpen, CalendarDays, Settings,
  LogOut, Menu, X, Sparkles, ChevronRight, UserCircle, Image, ImageIcon
} from 'lucide-react'
import { useSiteSettings } from '@/lib/useSiteSettings'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Services', href: '/admin/services', icon: Scissors },
  { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
  { label: 'Website Images', href: '/admin/website-images', icon: ImageIcon },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Profile', href: '/admin/profile', icon: UserCircle },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const { logoUrl, companyName } = useSiteSettings()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (pathname === '/admin/login') {
      router.replace('/login')
      return
    }
    try {
      const stored = localStorage.getItem('lumil_customer')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.role === 'admin') {
          setAdminUser(user)
          return
        }
      }
    } catch {}
    // Not an admin — redirect to login
    router.replace('/login')
  }, [pathname, router])

  if (!mounted || !adminUser) return null

  const isActive = (href: string) => pathname === href

  const handleLogout = () => {
    localStorage.removeItem('lumil_customer')
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 h-16 border-b border-gray-800">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName || 'Lumil'} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <span className="font-bold text-white text-sm">{companyName?.split(' ').slice(0, -1).join(' ') || 'Lumil'}</span>
                <span className="text-[9px] tracking-widest text-gray-500 uppercase block leading-none">Admin</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Admin user info */}
          <div className="px-5 py-3 border-b border-gray-800">
            <p className="text-sm font-medium text-gray-200 truncate">{adminUser.firstName} {adminUser.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{adminUser.email}</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-pink-600/20 text-pink-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              )
            })}
          </nav>

          <div className="px-3 py-4 border-t border-gray-800 space-y-2">
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              View Website
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find(n => isActive(n.href))?.label || 'Admin'}
          </h2>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}