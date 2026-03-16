'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import { inputStyle, labelStyle, sectionTitleStyle, primaryButtonStyle, disabledButtonStyle, onFocusBorder, onBlurBorder } from '@/styles/shared'

type Settings = {
  companyName: string; email: string; phone: string
  address: string; postalCode: string; city: string
  logoUrl: string
}

const defaultSettings: Settings = {
  companyName: '', email: '', phone: '', address: '', postalCode: '', city: '', logoUrl: '',
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '5px' }}>{hint}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p style={sectionTitleStyle}>{children}</p>
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings({ ...defaultSettings, ...data, logoUrl: data.logoUrl ?? '' }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function update(key: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1_000_000) { setError('Logo is too large (max 1 MB)'); return }
    const reader = new FileReader()
    reader.onload = () => update('logoUrl', reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Settings">
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', padding: '40px 0', textAlign: 'center' }}>Loading…</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Settings">
      <div style={{ maxWidth: '640px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.4px', marginBottom: '6px' }}>
            Account settings
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Manage your profile and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {/* Logo */}
          <Card>
            <SectionTitle>Logo</SectionTitle>
            <Field label="Company logo" hint="Appears at the top of generated documents. Max 1 MB, PNG or JPG.">
              {settings.logoUrl && (
                <div style={{ marginBottom: '12px' }}>
                  <img
                    src={settings.logoUrl}
                    alt="Company logo"
                    style={{ maxHeight: '60px', maxWidth: '200px', borderRadius: '4px', border: '1px solid var(--color-border)', padding: '8px', backgroundColor: '#F9FAFB', display: 'block' }}
                  />
                </div>
              )}
              <input
                type="file" accept="image/png,image/jpeg" onChange={handleLogoChange}
                style={{ ...inputStyle, padding: '8px 12px', cursor: 'pointer' }}
              />
              {settings.logoUrl && (
                <button
                  type="button" onClick={() => update('logoUrl', '')}
                  style={{ marginTop: '8px', fontSize: '12px', color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Remove logo
                </button>
              )}
            </Field>
          </Card>

          {/* Company details */}
          <Card>
            <SectionTitle>Company details</SectionTitle>
            <Field label="Company name">
              <input type="text" value={settings.companyName} onChange={(e) => update('companyName', e.target.value)}
                style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
            </Field>
          </Card>

          {/* Contact details */}
          <Card>
            <SectionTitle>Contact details</SectionTitle>
            <div className="form-stack">
              <div className="form-grid-2">
                <Field label="Email address">
                  <input type="email" value={settings.email} onChange={(e) => update('email', e.target.value)}
                    style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
                </Field>
                <Field label="Phone number">
                  <input type="tel" value={settings.phone} onChange={(e) => update('phone', e.target.value)}
                    style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
                </Field>
              </div>
              <Field label="Address">
                <input type="text" value={settings.address} onChange={(e) => update('address', e.target.value)}
                  placeholder="Street and number" style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px' }}>
                <Field label="Postal code">
                  <input type="text" value={settings.postalCode} onChange={(e) => update('postalCode', e.target.value)}
                    style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
                </Field>
                <Field label="City">
                  <input type="text" value={settings.city} onChange={(e) => update('city', e.target.value)}
                    style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
                </Field>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="submit"
              disabled={saving}
              style={saving ? disabledButtonStyle : primaryButtonStyle}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#1F2937' }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = 'var(--color-text-primary)' }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {saved && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>✓ Settings saved</span>}
            {error && <span style={{ fontSize: '13px', color: '#B91C1C' }}>{error}</span>}
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
