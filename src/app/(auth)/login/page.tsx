'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, LogIn, Mail, ArrowLeft, ShieldCheck, Send, Loader2 } from 'lucide-react'

type Screen = 'login' | 'verify-email' | 'resend-later'

export default function CustomerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  // Fetch Google Client ID from settings
  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data.googleClientId) {
          setGoogleClientId(res.data.googleClientId)
        }
      })
      .catch(() => {})
  }, [])

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Load Google Identity Services script
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
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: response.credential }),
            })
            const json = await res.json()
            if (json.success) {
              localStorage.setItem('lumil_customer', JSON.stringify(json.data))
              router.push('/')
            } else {
              setGoogleError(json.error || 'Google sign-in failed')
            }
          } catch {
            setGoogleError('Failed to connect to server')
          }
          setGoogleLoading(false)
        },
      })

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleError('Google Sign-In popup was blocked or dismissed. Please try again.')
          setGoogleLoading(false)
        }
      })
    } catch {
      setGoogleError('Google Sign-In failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (json.success) {
        const userData = json.data
        if (!userData.emailVerified) {
          setPendingUser(userData)
          setScreen('verify-email')
        } else {
          localStorage.setItem('lumil_customer', JSON.stringify(userData))
          router.push('/')
        }
      } else {
        setError(json.error || 'Login failed')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const handleSendVerification = async () => {
    setResendLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUser?.email || email }),
      })
      const json = await res.json()
      if (json.success) {
        setScreen('verify-email')
        setResendCooldown(60)
      } else {
        setError(json.error || 'Failed to send verification')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setResendLoading(false)
  }

  const handleVerifyCode = async () => {
    if (!verifyCode || verifyCode.length !== 6) return
    setVerifyLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUser?.email || email, code: verifyCode }),
      })
      const json = await res.json()
      if (json.success) {
        if (pendingUser) {
          const updated = { ...pendingUser, emailVerified: true }
          localStorage.setItem('lumil_customer', JSON.stringify(updated))
          router.push('/')
        } else {
          setError('Please log in again after verification.')
          setScreen('login')
        }
      } else {
        setError(json.error || 'Verification failed')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setVerifyLoading(false)
  }

  const handleResendLater = () => {
    if (pendingUser) {
      localStorage.setItem('lumil_customer', JSON.stringify(pendingUser))
      router.push('/')
    }
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
          <h1 className="text-2xl font-bold text-gray-900">
            {screen === 'login' ? 'Welcome Back' : 'Verify Your Email'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {screen === 'login'
              ? 'Sign in to your Lumil of Beauty account'
              : screen === 'verify-email'
                ? `We sent a code to ${pendingUser?.email || email}`
                : 'You can verify later from your profile'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-pink-100/20 border border-pink-50 space-y-4">
          <AnimatePresence mode="wait">
            {/* ===== LOGIN SCREEN ===== */}
            {screen === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Google Sign-In */}
                {googleClientId && (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
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
                    {googleError && (
                      <p className="text-xs text-amber-600 text-center bg-amber-50 rounded-lg px-3 py-2">{googleError}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400">or sign in with email</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 rounded-xl border-pink-100 focus:border-pink-400 h-11"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1.5 rounded-xl border-pink-100 focus:border-pink-400 h-11"
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl px-3 py-2">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-11 rounded-xl font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </span>
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500">
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => router.push('/register')} className="text-pink-600 font-medium hover:underline">
                      Create one
                    </button>
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
                className="space-y-4"
              >
                <div className="text-center py-2">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-pink-100 flex items-center justify-center">
                    <Mail className="w-7 h-7 text-pink-600" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter the 6-digit code sent to your email. Check your spam folder if you don&apos;t see it.
                  </p>
                </div>

                <div>
                  <Label className="text-sm">Verification Code</Label>
                  <Input
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="mt-1.5 rounded-xl border-pink-100 focus:border-pink-400 h-14 text-center text-2xl tracking-[0.3em] font-mono"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl px-3 py-2">{error}</p>}

                <Button
                  onClick={handleVerifyCode}
                  disabled={verifyLoading || verifyCode.length !== 6}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-11 rounded-xl font-semibold disabled:opacity-50"
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

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-sm text-pink-600 hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1"
                  >
                    {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendLater}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Verify later
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setScreen('login'); setError(''); setVerifyCode('') }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}