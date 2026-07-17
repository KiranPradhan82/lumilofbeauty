'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Shield, CheckCircle2, Trash2 } from 'lucide-react'

export default function SetupAdminPage() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setMessage({ type: 'error', text: 'All fields except phone are required.' })
      return
    }
    if (form.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()

      if (json.success) {
        setMessage({ type: 'success', text: `Admin "${form.email}" created! Go to /login to sign in.` })
        setForm({ email: '', password: '', firstName: '', lastName: '', phone: '' })
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to create admin.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Check your connection.' })
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete the current admin account? This cannot be undone.')) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/create-admin', { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setMessage({ type: 'success', text: json.message || 'Admin deleted. You can now create a new one.' })
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">Admin Setup</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Create or reset your admin account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delete existing admin */}
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Existing Admin
            </Button>
          </div>

          <div className="border-t" />

          {/* Create form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">First Name *</Label>
                <Input
                  placeholder="Kiran"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="mt-1 rounded-xl h-11"
                />
              </div>
              <div>
                <Label className="text-xs">Last Name *</Label>
                <Input
                  placeholder="Pradhan"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="mt-1 rounded-xl h-11"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="mt-1 rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-xs">Password * (min 6 chars)</Label>
              <Input
                type="password"
                placeholder="------"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="mt-1 rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-xs">Phone (optional)</Label>
              <Input
                type="tel"
                placeholder="+977-98xxxxxxxx"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="mt-1 rounded-xl h-11"
              />
            </div>
          </div>

          {message && (
            <div className={`flex items-start gap-2 text-sm rounded-xl p-3 ${
              message.type === 'success'
                ? 'text-green-700 bg-green-50 border border-green-100'
                : 'text-red-600 bg-red-50 border border-red-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : null}
              {message.text}
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl h-12 font-semibold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Shield className="w-4 h-4 mr-2" />Create Admin</>}
          </Button>

          <p className="text-xs text-center text-gray-400">
            After creating, go to <a href="/login" className="text-pink-500 underline">/login</a> to sign in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}