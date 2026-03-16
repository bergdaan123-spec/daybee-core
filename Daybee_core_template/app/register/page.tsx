'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { APP_NAME } from '@/lib/config'
import { inputStyle, errorBoxStyle, primaryButtonStyle, disabledButtonStyle, onFocusBorder, onBlurBorder } from '@/styles/shared'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Registration failed'); setLoading(false); return }

      // Auto sign-in after registration
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { router.push('/login') } else { router.push('/dashboard') }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            {APP_NAME}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
            Create your account
          </p>
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Name
            </label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              required autoFocus placeholder="Jane Smith"
              style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="you@example.com"
              style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="At least 8 characters"
              style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...(loading ? disabledButtonStyle : primaryButtonStyle), marginTop: '8px', width: '100%', padding: '12px' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-text-primary)', fontWeight: 500, textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
