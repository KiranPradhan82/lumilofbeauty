'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Upload, ImageIcon, Mail, Phone, MapPin, Building2, Key, Shield, Eye, EyeOff, AlertCircle, Navigation, Ruler, Crosshair, CheckCircle2, XCircle } from 'lucide-react'

const FIELDS = [
  { key: 'companyName', label: 'Company Name', icon: Building2, type: 'text', placeholder: 'Lumil of Beauty' },
  { key: 'companyEmail', label: 'Notification Email', icon: Mail, type: 'email', placeholder: 'hello@lumilofbeauty.com' },
  { key: 'companyPhone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '+977-9801234567' },
] as const

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [geocoding, setGeocoding] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [geoSuccess, setGeoSuccess] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(res => {
      if (res.success) setForm(res.data)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setSaved(true)
        setLocalPreview(null) // Clear local preview, now using server URL
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(json.error || 'Failed to save settings')
      }
    } catch (e: any) {
      setError(e.message || 'Network error — please try again')
    }
    setSaving(false)
  }

  const handleTestEmail = async () => {
    setTestingEmail(true); setError('')
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 4000)
      } else {
        setError(json.error || 'Test email failed')
      }
    } catch (e: any) {
      setError(e.message || 'Network error')
    }
    setTestingEmail(false)
  }

  const handleGeocode = async () => {
    const addr = form.parlourAddress?.trim()
    if (!addr) { setGeoError('Enter a parlour address first'); return }
    setGeocoding(true); setGeoError(''); setGeoSuccess('')
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`)
      const json = await res.json()
      if (json.success) {
        const { lat, lng, displayName } = json.data
        setForm(f => ({
          ...f,
          parlourAddress: displayName || addr,
          parlourLat: lat.toFixed(6),
          parlourLng: lng.toFixed(6),
        }))
        setGeoSuccess(`Found: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      } else {
        setGeoError(json.error || 'Address not found. Try a more specific address.')
      }
    } catch {
      setGeoError('Geocoding failed. Check your internet and try again.')
    }
    setGeocoding(false)
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5 MB.')
      return
    }
    // Show instant local preview
    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    // Convert to base64 and resize (works offline, no server upload needed)
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 400 // max dimension for logo
        let w = img.width, h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/png', 0.9)
        setForm(f => ({ ...f, logoUrl: dataUrl }))
        setUploading(false)
      }
      img.onerror = () => {
        setError('Could not read the image file.')
        setLocalPreview(null)
        setUploading(false)
      }
      img.src = ev.target!.result as string
    }
    reader.onerror = () => {
      setError('Failed to read file. Please try again.')
      setLocalPreview(null)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const secretField = (key: string, label: string, description: string, placeholder: string) => {
    const val = form[key] || ''
    const shown = showSecrets[key]
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5">
          <Key className="w-4 h-4 text-gray-400" />
          {label}
        </Label>
        <div className="relative">
          <Input
            type={shown ? 'text' : 'password'}
            placeholder={placeholder}
            value={val}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            className="pr-20 rounded-xl font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => toggleSecret(key)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    )
  }

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => { if (localPreview) URL.revokeObjectURL(localPreview) }
  }, [localPreview])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>

  const addressVal = form.companyAddress || ''
  const addressHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, companyAddress: e.target.value })

  return (
    <div className="max-w-2xl space-y-6">
      {/* General Info */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="w-5 h-5" />General Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <Label className="flex items-center gap-1.5"><f.icon className="w-4 h-4 text-gray-400" />{f.label}</Label>
              <Input type={f.type} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="mt-1.5" />
            </div>
          ))}
          <div>
            <Label className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />Address</Label>
            <textarea placeholder="Ilam & Jhapa Districts, Eastern Nepal" value={addressVal} onChange={addressHandler} className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5" />Logo</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview area */}
            <div className="relative w-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 overflow-hidden" style={{ minHeight: '180px' }}>
              {(localPreview || form.logoUrl) ? (
                <>
                  <img
                    src={localPreview || form.logoUrl}
                    alt="Logo Preview"
                    className="max-h-48 max-w-full object-contain p-4"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm">No logo uploaded yet</p>
                  <p className="text-xs">Upload your brand logo below</p>
                </div>
              )}
            </div>
            {/* Actions */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <Input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                <Button variant="outline" asChild disabled={uploading}>
                  <span><Upload className="w-4 h-4 mr-2" />{uploading ? 'Uploading...' : localPreview ? 'Change Logo' : 'Upload Logo'}</span>
                </Button>
              </label>
              {(form.logoUrl || localPreview) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setForm(f => ({ ...f, logoUrl: '' }))
                    setLocalPreview(null)
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Supports JPEG, PNG, GIF, WebP, SVG. Max 5 MB. The logo will appear in the navbar, footer, and admin panel across the entire site.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Service Area & Delivery Radius */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="w-5 h-5 text-pink-500" />
            Service Area & Delivery Radius
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Set your parlour location and the maximum distance (in km) you are willing to travel. Customers will only be able to book if their location falls within this radius.
          </p>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              Parlour Address
            </Label>
            <textarea
              placeholder="e.g. Ilam Bazaar, Ilam Municipality, Province 1, Nepal"
              value={form.parlourAddress || ''}
              onChange={e => { setForm({ ...form, parlourAddress: e.target.value }); setGeoError(''); setGeoSuccess('') }}
              className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={2}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGeocode}
            disabled={geocoding || !form.parlourAddress?.trim()}
            className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            {geocoding ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting Coordinates...</>
            ) : (
              <><Crosshair className="w-4 h-4 mr-2" /> Auto-detect Latitude & Longitude</>
            )}
          </Button>
          {geoError && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {geoError}
            </div>
          )}
          {geoSuccess && (
            <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 rounded-xl p-3 border border-green-100">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              {geoSuccess}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Latitude</Label>
              <Input
                type="text"
                placeholder="26.900000"
                value={form.parlourLat || ''}
                onChange={e => setForm({ ...form, parlourLat: e.target.value })}
                className="mt-1 rounded-xl font-mono text-sm"
                readOnly
              />
              <p className="text-xs text-gray-400 mt-1">Auto-filled by geocoding</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Longitude</Label>
              <Input
                type="text"
                placeholder="87.900000"
                value={form.parlourLng || ''}
                onChange={e => setForm({ ...form, parlourLng: e.target.value })}
                className="mt-1 rounded-xl font-mono text-sm"
                readOnly
              />
              <p className="text-xs text-gray-400 mt-1">Auto-filled by geocoding</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-gray-400" />
              Delivery Radius (km)
            </Label>
            <Input
              type="number"
              min="1"
              max="200"
              placeholder="25"
              value={form.deliveryRadiusKm || ''}
              onChange={e => setForm({ ...form, deliveryRadiusKm: e.target.value })}
              className="rounded-xl"
            />
            <p className="text-xs text-gray-400">
              Maximum distance from parlour that artists will travel. Default is 25 km if not set.
            </p>
          </div>
          {form.parlourLat && form.parlourLng && form.deliveryRadiusKm && (
            <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
              <p className="text-xs text-pink-700">
                <strong>Service area configured:</strong> Centre at {form.parlourLat}, {form.parlourLng} with {form.deliveryRadiusKm} km radius.
                Customers outside this range will not be able to book.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Sign-In */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Sign-In
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {secretField(
            'googleClientId',
            'Google Client ID',
            'Create one at Google Cloud Console → Credentials → OAuth 2.0 Client ID (Web application). Add your domain to Authorized JavaScript Origins.',
            'xxxx.apps.googleusercontent.com'
          )}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                After setting the Client ID, also add your domain (e.g. <code className="bg-blue-100 px-1 rounded">https://your-domain.com</code>) to Google&apos;s <strong>Authorized JavaScript Origins</strong>. For localhost, use <code className="bg-blue-100 px-1 rounded">http://localhost:3000</code>.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Service (Gmail App Password) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#EA4335"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#4285F4"/>
            </svg>
            Email Service (Gmail)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-gray-400" />
              Gmail Address
            </Label>
            <Input
              type="email"
              placeholder="yourname@gmail.com"
              value={form.gmailAddress || ''}
              onChange={e => setForm({ ...form, gmailAddress: e.target.value })}
              className="mt-1.5 rounded-xl"
            />
            <p className="text-xs text-gray-400 mt-1">Your personal Gmail address that will send all notifications.</p>
          </div>
          {secretField(
            'gmailAppPassword',
            'Gmail App Password',
            'Go to Google Account → Security → 2-Step Verification → App passwords → Create. Select "Mail" and copy the 16-character password.',
            'abcd efgh ijkl mnop'
          )}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>How to create an App Password:</strong><br />
                1. Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline font-medium">myaccount.google.com/security</a><br />
                2. Enable <strong>2-Step Verification</strong> (required before app passwords)<br />
                3. Search for <strong>App passwords</strong> in the security page<br />
                4. Select &quot;Mail&quot; as the app, enter a name like &quot;Lumil Beauty&quot;, and click Create<br />
                5. Copy the 16-character password and paste it above
              </span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-500 flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>Security:</strong> Your app password is stored securely in the database and never exposed to the client. Emails are sent via Gmail SMTP. Daily limit is ~500 emails.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5" />
            Test Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Send a test email to verify your Gmail configuration is working correctly.
          </p>
          <Button
            variant="outline"
            onClick={handleTestEmail}
            disabled={testingEmail || !form.gmailAddress}
            className="rounded-xl"
          >
            {testingEmail ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              <>Send Test to {form.gmailAddress || 'your Gmail'}</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-pink-200 bg-pink-50/50">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <strong className="text-pink-700">Email Notifications:</strong> Verification codes, booking confirmations, and status updates will be sent from your <strong>Gmail address</strong> using the app password. No third-party email service needed.
          </p>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>}
      <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All Settings'}
      </Button>
    </div>
  )
}