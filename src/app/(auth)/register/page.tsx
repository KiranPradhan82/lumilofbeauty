'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, UserPlus, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useSiteSettings } from '@/lib/useSiteSettings'

// Floating beauty items
const floatingItems = [
  { emoji: '🎨', x: '12%', y: '18%', size: 38, delay: 0, duration: 6 },
  { emoji: '💄', x: '78%', y: '15%', size: 42, delay: 1.2, duration: 7 },
  { emoji: '🌸', x: '85%', y: '65%', size: 30, delay: 0.5, duration: 5.5 },
  { emoji: '💖', x: '18%', y: '72%', size: 32, delay: 1.8, duration: 8 },
  { emoji: '✨', x: '55%', y: '8%', size: 22, delay: 2, duration: 4.5 },
  { emoji: '🪞', x: '70%', y: '40%', size: 28, delay: 0.8, duration: 6.5 },
  { emoji: '💅', x: '25%', y: '45%', size: 34, delay: 1.5, duration: 5 },
  { emoji: '💋', x: '60%', y: '80%', size: 26, delay: 0.3, duration: 7.5 },
  { emoji: '✨', x: '40%', y: '60%', size: 20, delay: 2.5, duration: 5 },
  { emoji: '🌸', x: '90%', y: '30%', size: 24, delay: 1, duration: 6 },
]

function FloatingItem({ emoji, x, y, size, delay, duration }: { emoji: string; x: string; y: string; size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y, fontSize: size }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.15, 0.5, 0.15],
        scale: [0.8, 1.1, 0.8],
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {emoji}
    </motion.div>
  )
}

// Password strength meter
function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' }
    if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-amber-400' }
    return { level: 3, label: 'Strong', color: 'bg-emerald-400' }
  }
  const { level, label, color } = getStrength()
  if (!password) return null
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-1.5 mt-2"
    >
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${color}`}
              initial={{ width: 0 }}
              animate={{ width: i <= level ? '100%' : '0%' }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </motion.div>
  )
}

export default function CustomerRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { logoUrl, companyName } = useSiteSettings()

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields'); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) { router.push('/login') }
      else { setError(json.error || 'Registration failed') }
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  const inputFields = [
    { key: 'firstName', label: 'First Name', placeholder: 'Sita', icon: '👩', type: 'text', half: true, required: true },
    { key: 'lastName', label: 'Last Name', placeholder: 'Devi', icon: '👩‍🦰', type: 'text', half: true, required: true },
    { key: 'email', label: 'Email Address', placeholder: 'you@example.com', icon: '💌', type: 'email', half: false, required: true },
    { key: 'phone', label: 'Phone Number', placeholder: '+977-9800000000', icon: '📱', type: 'tel', half: false, required: false },
    { key: 'password', label: 'Password', placeholder: 'Min 6 characters', icon: '🔒', type: 'password', half: false, required: true },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative beauty panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-fuchsia-600 via-pink-500 to-rose-500">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-white/10 blur-3xl"
          style={{ top: '5%', right: '-5%' }}
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-pink-300/15 blur-3xl"
          style={{ bottom: '-10%', left: '-10%' }}
          animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-fuchsia-400/10 blur-2xl"
          style={{ top: '40%', left: '30%' }}
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating beauty items */}
        {floatingItems.map((item, i) => (
          <FloatingItem key={i} {...item} />
        ))}

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            {/* Animated beauty kit illustration */}
            <div className="relative w-52 h-52 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm rotate-6"
                animate={{ rotate: [6, 10, 6] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-3 rounded-3xl bg-white/15 backdrop-blur-sm -rotate-3 flex items-center justify-center"
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.span
                  className="text-8xl"
                  animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🎨
                </motion.span>
              </motion.div>
              {/* Orbiting items */}
              <motion.div
                className="absolute flex items-center justify-center text-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                style={{ top: -5, left: '50%', marginLeft: -16 }}
              >
                💄
              </motion.div>
              <motion.div
                className="absolute flex items-center justify-center text-2xl"
                animate={{ rotate: -360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                style={{ bottom: 5, right: -5 }}
              >
                💅
              </motion.div>
              <motion.div
                className="absolute flex items-center justify-center text-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ top: '50%', left: -8, marginTop: -14 }}
              >
                💋
              </motion.div>
              <motion.div
                className="absolute flex items-center justify-center text-xl"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                style={{ top: '50%', right: -8, marginTop: -14 }}
              >
                ✨
              </motion.div>
            </div>

            <h2 className="text-3xl font-bold mb-3">
              Join the Beauty Family
            </h2>
            <p className="text-white/80 text-lg max-w-xs mx-auto leading-relaxed">
              Create your account and get exclusive access to premium home beauty services
            </p>

            {/* Benefits */}
            <div className="space-y-3 mt-8 w-full max-w-xs mx-auto">
              {[
                { emoji: '🏠', text: 'Beauty services at your doorstep' },
                { emoji: '📅', text: 'Easy online booking' },
                { emoji: '⭐', text: 'Verified expert artists' },
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10"
                >
                  <span className="text-xl">{benefit.emoji}</span>
                  <span className="text-sm font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
        {/* Mobile floating items */}
        <div className="lg:hidden">
          {floatingItems.slice(0, 5).map((item, i) => (
            <FloatingItem key={i} {...item} />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Logo & Header */}
            <div className="text-center mb-6">
              <motion.a
                href="/"
                onClick={(e) => { e.preventDefault(); router.push('/') }}
                className="inline-flex items-center gap-3 mb-4 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={companyName || 'Lumil'} className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-pink-200/50" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200/50">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                )}
              </motion.a>
              <motion.h1
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Create Account 💅
              </motion.h1>
              <motion.p
                className="text-gray-500 text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Join {companyName || 'Lumil of Beauty'} and book services at your doorstep
              </motion.p>
            </div>

            {/* Form Card */}
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/30 border border-pink-100/50 space-y-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                {inputFields.filter(f => f.half).map((field) => (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + inputFields.indexOf(field) * 0.05 }}
                  >
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                      <span className="text-xs">{field.icon}</span> {field.label} {field.required && <span className="text-pink-400">*</span>}
                    </Label>
                    <div className="relative mt-1.5">
                      <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r transition-opacity duration-300 ${focusedField === field.key ? 'from-pink-400 via-rose-400 to-fuchsia-400 opacity-100' : 'from-gray-200 via-gray-100 to-gray-200 opacity-0'}`} />
                      <Input
                        type={field.type}
                        value={form[field.key as keyof typeof form]}
                        onChange={update(field.key)}
                        placeholder={field.placeholder}
                        className="relative rounded-2xl border-0 bg-white h-12 px-4 text-sm focus-visible:ring-0"
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                        autoFocus={field.key === 'firstName'}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Full width fields */}
              {inputFields.filter(f => !f.half).map((field, idx) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                >
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                    <span className="text-xs">{field.icon}</span> {field.label} {field.required && <span className="text-pink-400">*</span>}
                    {!field.required && <span className="text-gray-400 font-normal text-xs">(optional)</span>}
                  </Label>
                  <div className="relative mt-1.5">
                    <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r transition-opacity duration-300 ${focusedField === field.key ? 'from-pink-400 via-rose-400 to-fuchsia-400 opacity-100' : 'from-gray-200 via-gray-100 to-gray-200 opacity-0'}`} />
                    {field.key === 'password' ? (
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={update('password')}
                          placeholder={field.placeholder}
                          className="relative rounded-2xl border-0 bg-white h-12 px-4 pr-12 text-sm focus-visible:ring-0"
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <Input
                        type={field.type}
                        value={form[field.key as keyof typeof form]}
                        onChange={update(field.key)}
                        placeholder={field.placeholder}
                        className="relative rounded-2xl border-0 bg-white h-12 px-4 text-sm focus-visible:ring-0"
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                      />
                    )}
                  </div>
                  {field.key === 'password' && <PasswordStrength password={form.password} />}
                </motion.div>
              ))}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center bg-red-50 rounded-2xl px-4 py-3 border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              {/* Animated success hints */}
              <div className="flex flex-wrap gap-2">
                {[
                  { check: form.firstName.length > 0, text: 'Name' },
                  { check: form.email.includes('@'), text: 'Valid email' },
                  { check: form.password.length >= 6, text: 'Strong password' },
                ].map((item) => (
                  <motion.span
                    key={item.text}
                    animate={{
                      backgroundColor: item.check ? 'rgb(254 226 226)' : 'rgb(243 244 246)',
                      color: item.check ? 'rgb(225 29 72)' : 'rgb(156 163 175)',
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                  >
                    {item.check ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current opacity-40" />}
                    {item.text}
                  </motion.span>
                ))}
              </div>

              {/* Submit button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={loading || !form.firstName || !form.lastName || !form.email || !form.password}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-12 rounded-2xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-pink-200/50 relative overflow-hidden"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </span>
                  )}
                </Button>
              </motion.div>

              <p className="text-center text-sm text-gray-500 pt-1">
                Already have an account?{' '}
                <motion.button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-pink-600 font-semibold hover:text-pink-700 inline-flex items-center gap-1"
                  whileHover={{ x: 2 }}
                >
                  Sign In →
                </motion.button>
              </p>
            </motion.form>

            {/* Bottom sparkle decoration */}
            <motion.div
              className="flex justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {['🎨', '💄', '💅', '💖'].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-lg opacity-40"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}