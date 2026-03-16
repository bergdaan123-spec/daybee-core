'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { APP_NAME } from '@/lib/config'
import { inputStyle, errorBoxStyle, primaryButtonStyle, disabledButtonStyle, onFocusBorder, onBlurBorder } from '@/styles/shared'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid email address or password')
      setLoading(false)
    } else {
      router.push('/dashboard')
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
            Sign in to your account
          </p>
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoFocus placeholder="you@example.com"
              style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...(loading ? disabledButtonStyle : primaryButtonStyle), marginTop: '8px', width: '100%', padding: '12px' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--color-text-primary)', fontWeight: 500, textDecoration: 'underline' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
