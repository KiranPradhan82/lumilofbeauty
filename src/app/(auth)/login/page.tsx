'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, LogIn, Mail, ArrowLeft, ShieldCheck, Send, Loader2, Eye, EyeOff } from 'lucide-react'
import { useSiteSettings } from '@/lib/useSiteSettings'

type Screen = 'login' | 'verify-email'

// Floating beauty items data
const floatingItems = [
  { emoji: '💄', x: '10%', y: '15%', size: 40, delay: 0, duration: 6 },
  { emoji: '💅', x: '80%', y: '20%', size: 36, delay: 1, duration: 7 },
  { emoji: '💋', x: '65%', y: '70%', size: 30, delay: 0.5, duration: 5 },
  { emoji: '🌸', x: '20%', y: '75%', size: 34, delay: 1.5, duration: 8 },
  { emoji: '✨', x: '50%', y: '10%', size: 24, delay: 2, duration: 4 },
  { emoji: '🪞', x: '85%', y: '50%', size: 32, delay: 0.8, duration: 6.5 },
  { emoji: '💖', x: '30%', y: '40%', size: 28, delay: 1.2, duration: 5.5 },
  { emoji: '🎨', x: '70%', y: '85%', size: 30, delay: 0.3, duration: 7.5 },
  { emoji: '🌸', x: '45%', y: '55%', size: 22, delay: 2.5, duration: 6 },
  { emoji: '✨', x: '15%', y: '50%', size: 20, delay: 1.8, duration: 5 },
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
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.div>
  )
}

function GlowInput({ icon, label, id, type = 'text', value, onChange, placeholder, autoFocus = false, className = '' }: {
  icon: React.ReactNode; label: string; id: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; autoFocus?: boolean; className?: string;
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      <div className={`relative mt-1.5 rounded-2xl transition-all duration-300 ${focused ? 'shadow-lg shadow-pink-200/50' : 'shadow-sm'}`}>
        <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${focused ? 'from-pink-400 via-rose-400 to-fuchsia-400 opacity-100' : 'from-gray-200 via-gray-100 to-gray-200 opacity-0'} transition-opacity duration-300`} />
        <div className="relative">
          <Input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="rounded-2xl border-0 bg-white h-12 px-4 text-sm focus-visible:ring-0"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus={autoFocus}
          />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [screen, setScreen] = useState<Screen>('login')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleClientId, setGoogleClientId] = useState('')
  const [googleError, setGoogleError] = useState('')
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { logoUrl, companyName } = useSiteSettings()

  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data.googleClientId) setGoogleClientId(res.data.googleClientId)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (!googleClientId) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [googleClientId])

  const handleGoogleLogin = () => {
    if (!googleClientId) {
      setGoogleError('Google Sign-In is not configured yet. Please use email/password.')
      return
    }
    setGoogleError('')
    setGoogleLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const google = (window as any).google
      if (!google?.accounts?.id) {
        setGoogleError('Google script not loaded. Please refresh and try again.')
        setGoogleLoading(false)
        return
      }
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          try {
            const res = await fetch('/api/auth/google', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: response.credential }),
            })
            const json = await res.json()
            if (json.success) {
              localStorage.setItem('lumil_customer', JSON.stringify(json.data))
              router.push('/')
            } else { setGoogleError(json.error || 'Google sign-in failed') }
          } catch { setGoogleError('Failed to connect to server') }
          setGoogleLoading(false)
        },
      })
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleError('Google Sign-In popup was blocked or dismissed.')
          setGoogleLoading(false)
        }
      })
    } catch { setGoogleError('Google Sign-In failed.'); setGoogleLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!email || !password) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (json.success) {
        const userData = json.data
        if (userData.role === 'admin') {
          localStorage.setItem('lumil_customer', JSON.stringify(userData))
          router.push('/admin'); setLoading(false); return
        }
        if (!userData.emailVerified) {
          setPendingUser(userData); setScreen('verify-email')
        } else {
          localStorage.setItem('lumil_customer', JSON.stringify(userData))
          router.push('/')
        }
      } else { setError(json.error || 'Login failed') }
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  const handleSendVerification = async () => {
    setResendLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUser?.email || email }),
      })
      const json = await res.json()
      if (json.success) { setScreen('verify-email'); setResendCooldown(60) }
      else { setError(json.error || 'Failed to send verification') }
    } catch { setError('Network error. Please try again.') }
    setResendLoading(false)
  }

  const handleVerifyCode = async () => {
    if (!verifyCode || verifyCode.length !== 6) return
    setVerifyLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUser?.email || email, code: verifyCode }),
      })
      const json = await res.json()
      if (json.success) {
        if (pendingUser) {
          const updated = { ...pendingUser, emailVerified: true }
          localStorage.setItem('lumil_customer', JSON.stringify(updated))
          router.push('/')
        } else { setError('Please log in again.'); setScreen('login') }
      } else { setError(json.error || 'Verification failed') }
    } catch { setError('Network error. Please try again.') }
    setVerifyLoading(false)
  }

  const handleResendLater = () => {
    if (pendingUser) {
      localStorage.setItem('lumil_customer', JSON.stringify(pendingUser))
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative beauty panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-fuchsia-600">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-white/10 blur-3xl"
          style={{ top: '-10%', left: '-10%' }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-fuchsia-400/20 blur-3xl"
          style={{ bottom: '-5%', right: '-5%' }}
          animate={{ x: [0, -40, 0], y: [0, -30, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
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
            {/* Animated makeup kit illustration */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <motion.span
                  className="text-7xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  💄
                </motion.span>
              </div>
              {/* Orbiting items */}
              <motion.div
                className="absolute w-10 h-10 flex items-center justify-center text-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                style={{ top: 0, left: '50%', marginLeft: -20 }}
              >
                💅
              </motion.div>
              <motion.div
                className="absolute w-8 h-8 flex items-center justify-center text-xl"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                style={{ bottom: 10, right: 0 }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute w-9 h-9 flex items-center justify-center text-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                style={{ top: '50%', left: 0, marginTop: -18 }}
              >
                💋
              </motion.div>
            </div>

            <h2 className="text-3xl font-bold mb-3">
              {companyName?.split(' ').slice(0, -1).join(' ') || 'Lumil'}
            </h2>
            <p className="text-white/80 text-lg max-w-xs mx-auto leading-relaxed">
              Your beauty, delivered to your doorstep across Eastern Nepal
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['Bridal Makeup', 'Nail Art', 'Facials', 'Hair Styling'].map((service, i) => (
                <motion.span
                  key={service}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm border border-white/20"
                >
                  {service}
                </motion.span>
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

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <motion.a
                href="/"
                onClick={(e) => { e.preventDefault(); router.push('/') }}
                className="inline-flex items-center gap-3 mb-5 group"
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
                {screen === 'login' ? 'Welcome Back ✨' : 'Verify Your Email 📬'}
              </motion.h1>
              <motion.p
                className="text-gray-500 text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {screen === 'login'
                  ? 'Sign in to your beauty account'
                  : `We sent a code to ${pendingUser?.email || email}`}
              </motion.p>
            </div>

            {/* Card */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/30 border border-pink-100/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <AnimatePresence mode="wait">
                {/* ===== LOGIN SCREEN ===== */}
                {screen === 'login' && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Google Sign-In */}
                    {googleClientId && (
                      <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading}
                            className="w-full h-12 rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm"
                          >
                            {googleLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                            )}
                            Continue with Google
                          </Button>
                        </motion.div>
                        {googleError && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-amber-600 text-center bg-amber-50 rounded-xl px-4 py-2.5 border border-amber-100">{googleError}</motion.p>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
                          <span className="text-xs text-gray-400 font-medium">or</span>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
                        </div>
                      </div>
                    )}

                    {/* Email with icon */}
                    <GlowInput
                      icon={<Mail className="w-3.5 h-3.5 text-pink-500" />}
                      label="Email Address"
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoFocus
                    />

                    {/* Password with show/hide toggle */}
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                        <span className="text-pink-500">🔒</span> Password
                      </Label>
                      <div className="relative mt-1.5">
                        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 opacity-0 peer-focus-within:opacity-100 transition-opacity" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="rounded-2xl border border-pink-100 focus:border-pink-400 h-12 px-4 pr-12 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm text-center bg-red-50 rounded-2xl px-4 py-3 border border-red-100">
                        {error}
                      </motion.p>
                    )}

                    {/* Submit button with shimmer */}
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-12 rounded-2xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-pink-200/50 relative overflow-hidden"
                      >
                        {loading ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span className="flex items-center gap-2">
                            <LogIn className="w-4 h-4" />
                            Sign In
                          </span>
                        )}
                      </Button>
                    </motion.div>

                    <div className="flex items-center justify-between text-sm pt-1">
                      <p className="text-gray-500">
                        New here?{' '}
                        <motion.button
                          type="button"
                          onClick={() => router.push('/register')}
                          className="text-pink-600 font-semibold hover:text-pink-700 inline-flex items-center gap-1"
                          whileHover={{ x: 2 }}
                        >
                          Create Account →
                        </motion.button>
                      </p>
                    </div>
                  </motion.form>
                )}

                {/* ===== VERIFY EMAIL SCREEN ===== */}
                {screen === 'verify-email' && (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="text-center py-2">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-3xl">📬</span>
                      </motion.div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Enter the 6-digit code sent to your email. Check spam if you don&apos;t see it.
                      </p>
                    </div>

                    {/* OTP Input boxes */}
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={verifyCode[i] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '')
                              if (!val) return
                              const newCode = verifyCode.split('')
                              newCode[i] = val[0]
                              setVerifyCode(newCode.join('').slice(0, 6))
                              // Auto-focus next
                              const next = e.target.nextElementSibling as HTMLInputElement
                              if (next && val) next.focus()
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !verifyCode[i]) {
                                const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement
                                if (prev) prev.focus()
                              }
                            }}
                            className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white"
                            autoFocus={i === 0}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center bg-red-50 rounded-2xl px-4 py-3 border border-red-100">{error}</motion.p>
                    )}

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        onClick={handleVerifyCode}
                        disabled={verifyLoading || verifyCode.length !== 6}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-12 rounded-2xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-pink-200/50"
                      >
                        {verifyLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Verify Email
                          </span>
                        )}
                      </Button>
                    </motion.div>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={handleSendVerification}
                        disabled={resendLoading || resendCooldown > 0}
                        className="text-pink-600 hover:text-pink-700 disabled:text-gray-400 font-medium flex items-center gap-1.5"
                      >
                        {resendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                      <button
                        type="button"
                        onClick={handleResendLater}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Verify later
                      </button>
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => { setScreen('login'); setError(''); setVerifyCode('') }}
                      className="w-full text-sm text-gray-400 hover:text-pink-500 flex items-center justify-center gap-1.5 font-medium transition-colors py-1"
                      whileHover={{ x: -3 }}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Bottom sparkle decoration */}
            <motion.div
              className="flex justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {['💄', '💅', '💋', '✨'].map((e, i) => (
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