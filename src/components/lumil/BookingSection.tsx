'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, User, MessageSquare, Sparkles, CheckCircle2, MapPin, Navigation, Search, Loader2, XCircle, CheckCircle } from 'lucide-react'
import { MapPicker } from '@/components/lumil/MapPicker'

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM',
]

interface CoverageResult {
  covered: boolean
  distance: number
  radius: number
}

export function BookingSection() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<{ id: string; name: string; price: number; category?: { name: string } }[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customer, setCustomer] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    notes: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [loading, setLoading] = useState(false)

  // Service availability state
  const [coverage, setCoverage] = useState<CoverageResult | null>(null)
  const [checkingCoverage, setCheckingCoverage] = useState(false)
  const [serviceAreaConfigured, setServiceAreaConfigured] = useState(true)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [manualAddress, setManualAddress] = useState('')
  const [checkingManualAddress, setCheckingManualAddress] = useState(false)

  // Load services and check if user is logged in
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(json => { if (json.success) setServices(json.data || []) })
      .catch(() => {})

    try {
      const stored = localStorage.getItem('lumil_customer')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.role === 'customer' || user.role === 'admin') {
          setCustomer(user)
          setFormData(prev => ({
            ...prev,
            name: `${user.firstName} ${user.lastName}`.trim(),
            phone: user.phone || '',
            email: user.email || '',
          }))
        }
      }
    } catch {}
  }, [])

  // Auto-detect location when entering Step 2
  useEffect(() => {
    if (step !== 2) return
    if (formData.latitude && formData.longitude) {
      // Already have coordinates, check coverage
      checkCoverage(formData.latitude, formData.longitude)
      return
    }
    // Auto-detect customer's location
    if (!navigator.geolocation) return
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
        checkCoverage(lat, lng)
        setDetectingLocation(false)
      },
      () => {
        setDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [step])

  const checkCoverage = async (lat: number, lng: number) => {
    setCheckingCoverage(true)
    try {
      const res = await fetch('/api/check-coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      })
      const json = await res.json()
      if (json.success) {
        setCoverage(json.data)
        setServiceAreaConfigured(true)
      } else if (json.error && json.error.includes('not configured')) {
        setServiceAreaConfigured(false)
        setCoverage(null)
      }
    } catch {
      // Network error - allow booking if coverage check fails
      setServiceAreaConfigured(false)
    }
    setCheckingCoverage(false)
  }

  const handleLocationChange = (lat: number, lng: number, addr: string) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, address: addr }))
    setCoverage(null)
    if (lat && lng) checkCoverage(lat, lng)
  }

  const handleAddressChange = (addr: string) => {
    setFormData(prev => ({ ...prev, address: addr }))
  }

  const handleManualAddressCheck = async () => {
    if (!manualAddress.trim()) return
    setCheckingManualAddress(true)
    setError('')
    try {
      // First geocode the address
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(manualAddress)}`)
      const geoJson = await geoRes.json()
      if (!geoJson.success) {
        setError(geoJson.error || 'Address not found. Try a more specific address.')
        setCheckingManualAddress(false)
        return
      }
      const { lat, lng, displayName } = geoJson.data
      setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, address: displayName || manualAddress }))
      // Then check coverage
      await checkCoverage(lat, lng)
    } catch {
      setError('Could not look up this address. Please try again.')
    }
    setCheckingManualAddress(false)
  }

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const selectedTotal = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  const canProceedFromLocation = !serviceAreaConfigured || (coverage?.covered === true)

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.date || !formData.time) return
    setLoading(true)
    setError('')

    try {
      const payload: Record<string, any> = {
        bookingDate: formData.date,
        bookingTime: formData.time,
        serviceIds: selectedServices,
        notes: formData.notes,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }

      if (customer) {
        payload.userId = customer.id
      } else {
        // Guest booking
        payload.guestName = formData.name
        payload.guestPhone = formData.phone
        payload.guestEmail = formData.email
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (json.success) {
        setSubmitted(true)
      } else {
        setError(json.error || 'Failed to submit booking')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <section id="booking" className="py-20 sm:py-28 bg-gradient-to-b from-white to-pink-50/30">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Booking Request Sent!</h3>
            <p className="text-gray-500 mb-6">
              Thank you, {formData.name}! Our artist will arrive at your location
              in Ilam/Jhapa on the scheduled date. We will confirm your booking
              via phone or message within 2 hours.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false)
                setStep(1)
                setSelectedServices([])
                setError('')
                setCoverage(null)
                setManualAddress('')
                setFormData({ name: customer ? `${customer.firstName} ${customer.lastName}`.trim() : '', phone: customer?.phone || '', email: customer?.email || '', date: '', time: '', notes: '', address: '', latitude: null, longitude: null })
              }}
              variant="outline"
              className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Book Another Service
            </Button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="booking" className="py-20 sm:py-28 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-pink-600 tracking-wider uppercase mb-3">
            Book Home Service
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Book Beauty at{' '}
            <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Your Doorstep
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Pick your location on the map, choose services, and our artist will
            arrive at your home in Ilam or Jhapa. No account needed!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/20 border border-pink-50 p-6 sm:p-10">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
              {[
                { num: 1, label: 'Details', icon: <User className="w-4 h-4" /> },
                { num: 2, label: 'Location', icon: <MapPin className="w-4 h-4" /> },
                { num: 3, label: 'Schedule', icon: <Clock className="w-4 h-4" /> },
                { num: 4, label: 'Confirm', icon: <CheckCircle2 className="w-4 h-4" /> },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        step >= s.num
                          ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-200/50'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                    </div>
                    <span className={`text-xs mt-2 hidden sm:block ${step >= s.num ? 'text-pink-600 font-medium' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`w-8 sm:w-16 h-0.5 rounded ${step > s.num ? 'bg-pink-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Details + Services */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Show logged-in status or guest fields */}
                {customer && (
                  <div className="bg-pink-50 rounded-xl p-3 flex items-center gap-2 text-sm text-pink-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Signed in as <strong>{customer.firstName} {customer.lastName}</strong>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-pink-100 focus:border-pink-400 h-12"
                    disabled={!!customer}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <Input
                    placeholder="+977-9800000000"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl border-pink-100 focus:border-pink-400 h-12"
                    disabled={!!customer}
                  />
                </div>
                {!customer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional — for booking updates)</label>
                    <Input
                      placeholder="you@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-pink-100 focus:border-pink-400 h-12"
                    />
                  </div>
                )}
                {services.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Services (optional — choose from list or mention in notes)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {services.filter(s => s.isActive).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleService(s.id)}
                          className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                            selectedServices.includes(s.id)
                              ? 'border-pink-300 bg-pink-50 text-pink-700'
                              : 'border-gray-100 text-gray-600 hover:border-pink-200 hover:bg-pink-50/50'
                          }`}
                        >
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs mt-0.5 opacity-70">Rs. {s.price.toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                    {selectedServices.length > 0 && (
                      <p className="text-sm text-pink-600 font-medium mt-2">
                        Selected: {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} — Rs. {selectedTotal.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                  <Textarea
                    placeholder="Any special requests or notes for our artist..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="rounded-xl border-pink-100 focus:border-pink-400 min-h-[100px] resize-none"
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl px-3 py-2">{error}</p>}

                <Button
                  onClick={() => { setError(''); setStep(2) }}
                  disabled={!formData.name || !formData.phone}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl h-12 font-semibold disabled:opacity-50"
                >
                  Continue to Location
                </Button>
              </motion.div>
            )}

            {/* Step 2: Location + Service Availability */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Auto-detection status */}
                {detectingLocation && (
                  <div className="flex items-center gap-2 text-sm text-pink-600 bg-pink-50 rounded-xl p-3 border border-pink-100">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Detecting your current location...
                  </div>
                )}

                {/* Manual address entry */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Search className="w-4 h-4 inline mr-1.5 text-pink-500" />
                    Enter Your Address Manually
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Ilam Bazaar, Ilam, Nepal"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleManualAddressCheck() } }}
                      className="flex-1 rounded-xl border-pink-100 focus:border-pink-400 h-12"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleManualAddressCheck}
                      disabled={checkingManualAddress || !manualAddress.trim()}
                      className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50 h-12 px-4"
                    >
                      {checkingManualAddress ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Type your address and click search to find your location on the map.
                  </p>
                </div>

                {/* Map picker */}
                <MapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  address={formData.address}
                  onLocationChange={handleLocationChange}
                  onAddressChange={handleAddressChange}
                />

                {/* Coverage check status */}
                {checkingCoverage && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Checking service availability at your location...
                  </div>
                )}

                {!checkingCoverage && coverage && (
                  coverage.covered ? (
                    <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 rounded-xl p-3 border border-green-100">
                      <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <strong>Service available!</strong> Your location is {coverage.distance} km away from our parlour (within {coverage.radius} km delivery radius).
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
                      <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <strong>Service not available at this location.</strong> Your location is {coverage.distance} km away from our parlour. Our delivery radius is {coverage.radius} km. Please select a different location within the service area.
                      </div>
                    </div>
                  )
                )}

                {!checkingCoverage && !coverage && !detectingLocation && serviceAreaConfigured && formData.latitude && formData.longitude && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <Navigation className="w-4 h-4 shrink-0" />
                    Select or confirm your location on the map to check service availability.
                  </div>
                )}

                {!serviceAreaConfigured && (
                  <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <Navigation className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      Service area check is not configured yet. You can proceed with your booking. Please select a location within Ilam & Jhapa districts.
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl h-12 border-pink-200 text-gray-600"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => { setError(''); setStep(3) }}
                    disabled={!canProceedFromLocation}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl h-12 font-semibold disabled:opacity-50"
                    title={!canProceedFromLocation ? 'Please select a location within our service area' : undefined}
                  >
                    Continue to Schedule
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1.5 text-pink-500" />
                    Select Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="rounded-xl border-pink-100 focus:border-pink-400 h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-1.5 text-pink-500" />
                    Select Time
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setFormData({ ...formData, time: slot })}
                        className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all ${
                          formData.time === slot
                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-200/50'
                            : 'bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-xl h-12 border-pink-200 text-gray-600"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!formData.date || !formData.time}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl h-12 font-semibold disabled:opacity-50"
                  >
                    Review Booking
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-pink-50 rounded-2xl p-6 space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pink-500" />
                    Booking Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium text-gray-900">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-gray-900">{formData.phone}</span>
                    </div>
                    {formData.email && !customer && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-900">{formData.email}</span>
                      </div>
                    )}
                    {formData.address && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium text-gray-900 text-right max-w-[60%] text-xs">{formData.address}</span>
                      </div>
                    )}
                    {coverage && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Distance</span>
                        <span className="font-medium text-green-600">{coverage.distance} km from parlour</span>
                      </div>
                    )}
                    {selectedServices.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Services</span>
                        <span className="font-medium text-pink-600">{selectedServices.length} selected — Rs. {selectedTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium text-gray-900">
                        {formData.date && new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium text-gray-900">{formData.time}</span>
                    </div>
                    {formData.notes && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Notes</span>
                        <span className="font-medium text-gray-900 text-right max-w-[60%]">{formData.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                {!customer && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-700">
                      <strong>No account?</strong> No problem! Your booking will be submitted as a guest.
                      {formData.email && ' You\'ll receive updates at your email.'}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400 text-center">
                  Our artist will arrive at your selected location. You can also
                  mention additional services during the visit.
                </p>

                {error && <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl px-3 py-2">{error}</p>}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1 rounded-xl h-12 border-pink-200 text-gray-600"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl h-12 font-semibold shadow-lg shadow-pink-200/50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Confirm Booking
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}