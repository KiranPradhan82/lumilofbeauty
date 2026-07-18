'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Star, Camera, X, CalendarDays, MessageSquare, CheckCircle2, ShoppingBag, LogOut, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BookingService {
  service: { id: string; name: string }
}

interface PendingBooking {
  id: string
  bookingDate: string
  bookingTime: string
  services: BookingService[]
}

interface SubmittedReview {
  id: string
  rating: number
  comment: string | null
  service: { name: string }
  createdAt: string
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([])
  const [myReviews, setMyReviews] = useState<SubmittedReview[]>([])
  const [loading, setLoading] = useState(true)

  // Review dialog state
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewBooking, setReviewBooking] = useState<PendingBooking | null>(null)
  const [reviewServiceIndex, setReviewServiceIndex] = useState(0)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => { setMounted(true) }, [])

  const fetchUserData = useCallback(async () => {
    try {
      const stored = localStorage.getItem('lumil_customer')
      if (!stored) { router.replace('/login'); return }
      const parsed = JSON.parse(stored)
      if (parsed.role === 'admin') { router.replace('/admin'); return }
      setUser(parsed)

      // Fetch pending reviews
      const pendingRes = await fetch(`/api/reviews?mode=pending&userId=${parsed.id}`)
      const pendingJson = await pendingRes.json()
      if (pendingJson.success) setPendingBookings(pendingJson.data)

      // Fetch user's reviews
      const reviewsRes = await fetch(`/api/bookings?userId=${parsed.id}`)
      const bookingsJson = await reviewsRes.json()
      if (bookingsJson.success) {
        // Extract reviews from bookings
        const allReviews: SubmittedReview[] = []
        for (const b of bookingsJson.data) {
          if (b.reviews && b.reviews.length > 0) {
            for (const r of b.reviews) {
              allReviews.push({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                service: r.service || { name: 'Unknown' },
                createdAt: r.createdAt,
              })
            }
          }
        }
        setMyReviews(allReviews)
      }
    } catch {
      router.replace('/login')
    }
    setLoading(false)
  }, [router])

  useEffect(() => { if (mounted) fetchUserData() }, [mounted, fetchUserData])

  const openReviewDialog = (booking: PendingBooking, serviceIdx: number) => {
    setReviewBooking(booking)
    setReviewServiceIndex(serviceIdx)
    setRating(0)
    setHoverRating(0)
    setComment('')
    setPhotos([])
    setReviewError('')
    setSubmitSuccess(false)
    setReviewOpen(true)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) return
      if (photos.length >= 3) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX = 600
          let w = img.width, h = img.height
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX }
            else { w = Math.round(w * MAX / h); h = MAX }
          }
          canvas.width = w; canvas.height = h
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          setPhotos(prev => [...prev, dataUrl])
        }
        img.src = ev.target!.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmitReview = async () => {
    if (!reviewBooking || rating === 0) return
    setSubmitting(true)
    setReviewError('')
    try {
      const serviceId = reviewBooking.services[reviewServiceIndex].service.id
      const stored = localStorage.getItem('lumil_customer')
      const parsed = stored ? JSON.parse(stored) : null

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parsed?.id,
          bookingId: reviewBooking.id,
          serviceId,
          rating,
          comment: comment.trim() || null,
          photos: photos.length > 0 ? photos : undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSubmitSuccess(true)
        // Refresh data after a short delay
        setTimeout(() => {
          setReviewOpen(false)
          fetchUserData()
        }, 1500)
      } else {
        setReviewError(json.error || 'Failed to submit review')
      }
    } catch {
      setReviewError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('lumil_customer')
    router.replace('/')
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const currentService = reviewBooking?.services[reviewServiceIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-gray-50">
      {/* Simple header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
            Lumil of Beauty
          </button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-500">
            <LogOut className="w-4 h-4 mr-1.5" />Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* User info card */}
        <Card className="border-pink-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews Section */}
        {pendingBookings.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Rate Your Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Your recent bookings have been completed! Please take a moment to share your experience and help other customers.
              </p>
              {pendingBookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays className="w-4 h-4" />
                    <span>{booking.bookingDate} at {booking.bookingTime}</span>
                  </div>
                  <div className="space-y-2">
                    {booking.services.map((bs, idx) => (
                      <div key={bs.service.id} className="flex items-center justify-between bg-pink-50/50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-pink-400" />
                          {bs.service.name}
                        </span>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs h-7 px-3"
                          onClick={() => openReviewDialog(booking, idx)}
                        >
                          <Star className="w-3 h-3 mr-1" />Rate
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No pending reviews message */}
        {pendingBookings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">All caught up!</h3>
              <p className="text-sm text-gray-500">
                No pending reviews. Once your bookings are completed, you will be prompted to share your experience here.
              </p>
            </CardContent>
          </Card>
        )}

        {/* My Reviews */}
        {myReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="w-5 h-5 text-pink-500" />
                My Reviews ({myReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myReviews.map(review => (
                <div key={review.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <div className="flex gap-0.5 shrink-0 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{review.service.name}</p>
                    {review.comment && <p className="text-sm text-gray-500 mt-0.5">&ldquo;{review.comment}&rdquo;</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={(open) => { if (!open) setReviewOpen(false) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Rate Your Experience
            </DialogTitle>
          </DialogHeader>

          {currentService && !submitSuccess && (
            <div className="space-y-5">
              <div className="bg-pink-50 rounded-lg p-3 text-sm text-gray-700">
                <span className="font-medium">{currentService.service.name}</span>
                <br />
                <span className="text-xs text-gray-500">{reviewBooking?.bookingDate} at {reviewBooking?.bookingTime}</span>
              </div>

              {/* Star rating */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">How was your experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-gray-400">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent!'}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <p className="text-sm text-gray-600">Your review (optional)</p>
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="resize-none rounded-xl"
                />
              </div>

              {/* Photo upload */}
              <div className="space-y-1.5">
                <p className="text-sm text-gray-600">
                  Add photos (optional, max 3)
                  {photos.length > 0 && <span className="text-gray-400 ml-1">({photos.length}/3)</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {photos.map((p, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 3 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/50 transition-colors">
                      <Camera className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-0.5">Add</span>
                      <input type="file" accept="image/*" className="hidden" multiple onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>
              </div>

              {reviewError && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg p-2">{reviewError}</p>
              )}

              <Button
                onClick={handleSubmitReview}
                disabled={rating === 0 || submitting}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl h-11"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          )}

          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-semibold text-gray-800">Thank you for your review!</p>
              <p className="text-sm text-gray-500">Your feedback helps us improve and helps other customers.</p>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}