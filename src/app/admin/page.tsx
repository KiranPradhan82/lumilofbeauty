'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, Clock, Scissors, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Booking {
  id: string
  bookingDate: string
  bookingTime: string
  status: string
  totalAmount: number
  paymentStatus: string
  user: { firstName: string; lastName: string; email: string }
  services: { service: { name: string } }[]
  createdAt: string
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending:   { color: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  completed: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [serviceCount, setServiceCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/bookings').then(r => r.json()),
      fetch('/api/admin/services').then(r => r.json()),
    ]).then(([bRes, sRes]) => {
      if (bRes.success) setBookings(bRes.data)
      if (sRes.success) setServiceCount(sRes.data.length)
    }).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.bookingDate === today)
  const pendingBookings = bookings.filter(b => b.status === 'pending')

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: CalendarDays, color: 'from-pink-500 to-rose-500' },
    { label: "Today's Bookings", value: todayBookings.length, icon: Clock, color: 'from-violet-500 to-purple-500' },
    { label: 'Pending', value: pendingBookings.length, icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
    { label: 'Services', value: serviceCount, icon: Scissors, color: 'from-emerald-500 to-teal-500' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h3>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Services</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.slice(0, 10).map(b => {
                  const sc = statusConfig[b.status] || statusConfig.pending
                  const StatusIcon = sc.icon
                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{b.user?.firstName} {b.user?.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{b.bookingDate}</td>
                      <td className="px-4 py-3 text-gray-600">{b.bookingTime}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{b.services.map(s => s.service.name).join(', ')}</td>
                      <td className="px-4 py-3 font-medium">Rs. {b.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={`${sc.color} gap-1`}>
                          <StatusIcon className="w-3 h-3" />{b.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
                {bookings.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}