'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, UserPlus } from 'lucide-react'

export default function CustomerRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        router.push('/login')
      } else {
        setError(json.error || 'Registration failed')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Lumil of Beauty and book services at your doorstep</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl shadow-pink-100/20 border border-pink-50 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">First Name *</Label>
              <Input value={form.firstName} onChange={update('firstName')} placeholder="Sita" className="mt-1.5 rounded-xl border-pink-100 focus:border-pink-400 h-11" />
            </div>
            <div>
              <Label className="text-sm">Last Name *</Label>
              <Input value={form.lastName} onChange={update('lastName')} placeholder="Devi" className="mt-1.5 rounded-xl border-pink-100 focus:border-pink-400 h-11" />
            </div>
          </div>
          <div>
            <Label className="text-sm">Email *</Label>
            <Input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="mt-1.5 rounded-xl border-pink-100 focus:border-pink-400 h-11" />
          </div>
          <div>
            <Label className="text-sm">Phone (optional)</Label>
            <Input type="tel" value={form.phone} onChange={update('phone')} placeholder="+977-9800000000" className="mt-1.5 rounded-xl border-pink-100 focus:border-pink-400 h-11" />
          </div>
          <div>
            <Label className="text-sm">Password *</Label>
            <Input type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" className="mt-1.5 rounded-xl border-pink-100 focus:border-pink-400 h-11" />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !form.firstName || !form.lastName || !form.email || !form.password}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-11 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-pink-600 font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  )
}