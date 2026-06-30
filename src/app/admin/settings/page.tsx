'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Upload, ImageIcon, Mail, Phone, MapPin, Building2 } from 'lucide-react'

const FIELDS = [
  { key: 'companyName', label: 'Company Name', icon: Building2, type: 'text', placeholder: 'Lumil of Beauty' },
  { key: 'companyEmail', label: 'Notification Email', icon: Mail, type: 'email', placeholder: 'hello@lumilofbeauty.com' },
  { key: 'companyPhone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '+977-9801234567' },
] as const

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(res => {
      if (res.success) setForm(res.data)
      setLoading(false)
    })
  }, [])

  const [error, setError] = useState('')

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
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(json.error || 'Failed to save settings')
      }
    } catch (e: any) {
      setError(e.message || 'Network error — please try again')
    }
    setSaving(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const data = await res.json()
      if (data.success) setForm(f => ({ ...f, logoUrl: data.url }))
    }
    setUploading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>

  const addressVal = form.companyAddress || ''
  const addressHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, companyAddress: e.target.value })

  return (
    <div className="max-w-2xl space-y-6">
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

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5" />Logo</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>
            )}
            <div className="space-y-2">
              <label className="cursor-pointer">
                <Input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <Button variant="outline" asChild disabled={uploading}>
                  <span><Upload className="w-4 h-4 mr-2" />{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                </Button>
              </label>
              {form.logoUrl && <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setForm(f => ({ ...f, logoUrl: '' }))}>Remove</Button>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-pink-200 bg-pink-50/50">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <strong className="text-pink-700">Email Notifications:</strong> Booking confirmations, status updates, and payment receipts will be sent using the <strong>Notification Email</strong> above.
          </p>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>}
      <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </Button>
    </div>
  )
}
