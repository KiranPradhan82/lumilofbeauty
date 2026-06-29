'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface Booking {
  id: string
  bookingDate: string
  bookingTime: string
  status: string
  totalAmount: number
  paymentStatus: string
  paymentMethod: string | null
  notes: string | null
  createdAt: string
  user: { firstName: string; lastName: string; email: string; phone: string | null }
  services: { service: { name: string; price: number } }[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

const paymentColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)

  const fetchBookings = useCallback(async () => {
    const res = await fetch('/api/admin/bookings').then(r => r.json())
    if (res.success) setBookings(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/bookings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchBookings()
  }

  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter)

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">All Bookings ({filtered.length})</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Services</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetailBooking(b)}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{b.user?.firstName} {b.user?.lastName}</div>
                    <div className="text-xs text-gray-400">{b.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.bookingDate}<br /><span className="text-xs text-gray-400">{b.bookingTime}</span></td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{b.services.map(s => s.service.name).join(', ')}</td>
                  <td className="px-4 py-3 font-medium">Rs. {b.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className={paymentColors[b.paymentStatus] || ''}>{b.paymentStatus}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="secondary" className={statusColors[b.status] || ''}>{b.status}</Badge></td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    {b.status === 'pending' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-7" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</Button>
                    )}
                    {b.status === 'confirmed' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7" onClick={() => updateStatus(b.id, 'completed')}>Complete</Button>
                    )}
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <Button size="sm" variant="outline" className="text-red-600 text-xs h-7 ml-1" onClick={() => updateStatus(b.id, 'cancelled')}>Cancel</Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailBooking} onOpenChange={() => setDetailBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {detailBooking && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-400">Customer</span><p className="font-medium">{detailBooking.user.firstName} {detailBooking.user.lastName}</p></div>
                <div><span className="text-gray-400">Email</span><p className="font-medium">{detailBooking.user.email}</p></div>
                <div><span className="text-gray-400">Phone</span><p className="font-medium">{detailBooking.user.phone || 'N/A'}</p></div>
                <div><span className="text-gray-400">Date</span><p className="font-medium">{detailBooking.bookingDate}</p></div>
                <div><span className="text-gray-400">Time</span><p className="font-medium">{detailBooking.bookingTime}</p></div>
                <div><span className="text-gray-400">Payment</span><p className="font-medium">{detailBooking.paymentMethod || 'N/A'}</p></div>
              </div>
              <div>
                <span className="text-gray-400">Services</span>
                <ul className="mt-1 space-y-1">{detailBooking.services.map((s, i) => (
                  <li key={i} className="flex justify-between"><span>{s.service.name}</span><span className="font-medium">Rs. {s.service.price.toLocaleString()}</span></li>
                ))}</ul>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total</span><span className="text-pink-600">Rs. {detailBooking.totalAmount.toLocaleString()}</span>
              </div>
              {detailBooking.notes && <div><span className="text-gray-400">Notes</span><p className="mt-1 text-gray-700">{detailBooking.notes}</p></div>}
              <div className="flex gap-2 pt-2">
                <Badge className={statusColors[detailBooking.status]}>{detailBooking.status}</Badge>
                <Badge className={paymentColors[detailBooking.paymentStatus]}>{detailBooking.paymentStatus}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}