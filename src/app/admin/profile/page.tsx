'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Shield, Mail, KeyRound, User, Send, CheckCircle2, ArrowLeft } from 'lucide-react'

interface AdminProfile {
  id: string; email: string; firstName: string; lastName: string; phone: string | null
}

type OtpStep = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified'
type FieldToEdit = 'email' | 'password' | null

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editing, setEditing] = useState<FieldToEdit>(null)
  const [newValue, setNewValue] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [otpStep, setOtpStep] = useState<OtpStep>('idle')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [countdown, setCountdown] = useState(0)

  const fetchProfile = useCallback(async () => {
    const res = await fetch('/api/admin/profile').then(r => r.json())
    if (res.success) setProfile(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const showMsg = (type: 'success' | 'error', text: string) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000) }

  const sendOtp = async () => {
    const identifier = editing === 'email' ? newValue : profile?.email
    if (!identifier) return
    setOtpStep('sending'); setOtpCode(['', '', '', '', '', '']); setOtpError('')
    const res = await fetch('/api/admin/otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', identifier, purpose: editing === 'email' ? 'change_email' : 'change_password' }),
    }).then(r => r.json())
    if (res.success) { setOtpStep('sent'); setCountdown(60); setTimeout(() => inputRefs.current[0]?.focus(), 100) }
    else { setOtpStep('idle'); showMsg('error', res.error) }
  }

  const verifyOtp = async () => {
    const code = otpCode.join('')
    if (code.length !== 6) { setOtpError('Enter 6-digit code'); return }
    setOtpStep('verifying')
    const identifier = editing === 'email' ? newValue : profile?.email
    const res = await fetch('/api/admin/otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', identifier, purpose: editing === 'email' ? 'change_email' : 'change_password', code }),
    }).then(r => r.json())
    if (res.success) { setOtpStep('verified'); setTimeout(() => handleSubmit(), 300) }
    else { setOtpStep('sent'); setOtpError(res.error) }
  }

  const handleOtpInput = (i: number, v: string) => {
    if (v.length > 1) v = v[0]
    if (!/\d/.test(v) && v !== '') return
    const n = [...otpCode]; n[i] = v; setOtpCode(n); setOtpError('')
    if (v && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const n = [...otpCode]; for (let i = 0; i < t.length; i++) n[i] = t[i]; setOtpCode(n)
    inputRefs.current[Math.min(t.length, 5)]?.focus()
  }

  const startEdit = (f: FieldToEdit) => { setEditing(f); setNewValue(''); setCurrentPassword(''); setOtpStep('idle'); setOtpCode(['', '', '', '', '', '']); setOtpError('') }
  const cancelEdit = () => { setEditing(null); setNewValue(''); setCurrentPassword(''); setOtpStep('idle') }

  const handleSubmit = async () => {
    if (otpStep !== 'verified') return
    setSaving(true)
    const res = await fetch('/api/admin/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: editing, value: newValue, currentPassword, otpVerified: true }),
    }).then(r => r.json())
    if (res.success) { showMsg('success', editing === 'password' ? 'Password updated' : 'Email updated'); cancelEdit(); fetchProfile() }
    else { showMsg('error', res.error); setOtpStep('sent') }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      {message && <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5" />Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[['Name', profile?.firstName + ' ' + profile?.lastName], ['Email (Login)', profile?.email], ['Password', '••••••••']].map(([label, val]) => (
            <div key={label as string} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><p className="text-xs text-gray-400">{label as string}</p><p className="font-medium">{val as string}</p></div>
              <Button variant="outline" size="sm" onClick={() => startEdit(label === 'Password' ? 'password' : 'email')}>{label === 'Password' ? 'Change' : 'Edit'}</Button>
            </div>
          ))}
        </CardContent>
      </Card>
      {editing && (
        <Card className="border-pink-200">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg">{editing === 'email' ? <Mail className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}{editing === 'email' ? 'Change Email' : 'Change Password'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {editing === 'email' ? (
              <div><Label>New Email</Label><Input type="email" placeholder="new@email.com" value={newValue} onChange={e => setNewValue(e.target.value)} className="mt-1.5" /></div>
            ) : (<>
              <div><Label>Current Password</Label><Input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1.5" /></div>
              <div><Label>New Password</Label><Input type="password" placeholder="New password" value={newValue} onChange={e => setNewValue(e.target.value)} className="mt-1.5" /></div>
            </>)}
            {otpStep === 'idle' && (
              <Button onClick={sendOtp} disabled={editing === 'email' ? !newValue : (!currentPassword || !newValue)} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white"><Send className="w-4 h-4 mr-2" />Send OTP to {editing === 'email' ? newValue : profile?.email}</Button>
            )}
            {(otpStep === 'sent' || otpStep === 'verifying') && (
              <div className="space-y-4">
                <div><Label className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-pink-500" />Enter 6-digit OTP</Label><p className="text-xs text-gray-400 mt-1">Sent to {editing === 'email' ? newValue : profile?.email}</p>
                  <div className="flex gap-2 mt-3 justify-center" onPaste={handlePaste}>{otpCode.map((d, i) => (
                    <input key={i} ref={el => { inputRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleOtpInput(i, e.target.value)} onKeyDown={e => handleKey(i, e)} className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none" />
                  ))}</div>
                  {otpError && <p className="text-red-500 text-xs text-center mt-2">{otpError}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={cancelEdit}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
                  <Button onClick={verifyOtp} disabled={otpCode.join('').length !== 6 || saving} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white">{otpStep === 'verifying' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Verify</>}</Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-gray-400" onClick={sendOtp} disabled={countdown > 0}>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}</Button>
              </div>
            )}
            {otpStep === 'verified' && <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg text-green-700"><Loader2 className="w-4 h-4 animate-spin" />Saving...</div>}
            {otpStep === 'sending' && <div className="flex items-center justify-center gap-2 p-4 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Sending OTP...</div>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
