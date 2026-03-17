'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { APP_NAME } from '@/lib/config'
import { inputStyle, errorBoxStyle, primaryButtonStyle, disabledButtonStyle, onFocusBorder, onBlurBorder } from '@/styles/shared'

export default function LoginPageClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === '1'

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
      setError('Ongeldig e-mailadres of wachtwoord')
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
            Inloggen op uw account
          </p>
        </div>

        {justRegistered && !error && (
          <div style={{ padding: '12px 14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '13px', color: '#065F46', marginBottom: '4px' }}>
            Account aangemaakt — log in om verder te gaan.
          </div>
        )}
        {error && <div style={errorBoxStyle}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              E-mailadres
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoFocus placeholder="u@voorbeeld.nl"
              style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Wachtwoord
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
            {loading ? 'Bezig met inloggen…' : 'Inloggen'}
          </button>
        </form>

        <p className="auth-footer">
          Nog geen account?{' '}
          <Link href="/register" style={{ color: 'var(--color-text-primary)', fontWeight: 500, textDecoration: 'underline' }}>
            Registreren
          </Link>
        </p>
      </div>
    </div>
  )
}
