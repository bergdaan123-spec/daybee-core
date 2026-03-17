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
  const [settings, setSettings]       = useState<Settings>(defaultSettings)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [logoSaving, setLogoSaving]   = useState(false)
  const [logoError, setLogoError]     = useState<string | null>(null)

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

  async function saveLogo(logoUrl: string) {
    setLogoSaving(true)
    setLogoError(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setLogoError('Logo opslaan mislukt — probeer het opnieuw')
    } finally {
      setLogoSaving(false)
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoError(null)

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setLogoError('Alleen PNG- of JPG-bestanden zijn toegestaan')
      return
    }
    if (file.size > 1_000_000) {
      setLogoError('Logo is te groot (max 1 MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      update('logoUrl', dataUrl)
      saveLogo(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function handleRemoveLogo() {
    update('logoUrl', '')
    await saveLogo('')
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
      if (!res.ok) throw new Error('Instellingen opslaan mislukt')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Instellingen opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Instellingen">
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', padding: '40px 0', textAlign: 'center' }}>Laden…</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Instellingen">
      <div style={{ maxWidth: '640px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.4px', marginBottom: '6px' }}>
            Accountinstellingen
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Beheer uw profiel en voorkeuren</p>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {/* Logo */}
          <Card>
            <SectionTitle>Logo</SectionTitle>
            <Field label="Bedrijfslogo" hint="Verschijnt bovenaan gegenereerde documenten. Max 1 MB, PNG of JPG.">
              {settings.logoUrl && (
                <div style={{ marginBottom: '12px' }}>
                  <img
                    src={settings.logoUrl}
                    alt="Bedrijfslogo"
                    style={{ maxHeight: '60px', maxWidth: '200px', borderRadius: '4px', border: '1px solid var(--color-border)', padding: '8px', backgroundColor: '#F9FAFB', display: 'block' }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              )}
              <input
                type="file" accept="image/png,image/jpeg" onChange={handleLogoChange}
                disabled={logoSaving}
                style={{ ...inputStyle, padding: '8px 12px', cursor: logoSaving ? 'wait' : 'pointer' }}
              />
              {logoSaving && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '5px' }}>Logo opslaan…</p>
              )}
              {logoError && (
                <p style={{ fontSize: '12px', color: '#B91C1C', marginTop: '5px' }}>{logoError}</p>
              )}
              {settings.logoUrl && !logoSaving && (
                <button
                  type="button" onClick={handleRemoveLogo}
                  style={{ marginTop: '8px', fontSize: '12px', color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Logo verwijderen
                </button>
              )}
            </Field>
          </Card>

          {/* Bedrijfsgegevens */}
          <Card>
            <SectionTitle>Bedrijfsgegevens</SectionTitle>
            <Field label="Bedrijfsnaam">
              <input type="text" value={settings.companyName} onChange={(e) => update('companyName', e.target.value)}
                style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
            </Field>
          </Card>

          {/* Contactgegevens */}
          <Card>
            <SectionTitle>Contactgegevens</SectionTitle>
            <div className="form-stack">
              <div className="form-grid-2">
                <Field label="E-mailadres">
                  <input type="email" value={settings.email} onChange={(e) => update('email', e.target.value)}
                    style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
                </Field>
                <Field label="Telefoonnummer">
                  <input type="tel" value={settings.phone} onChange={(e) => update('phone', e.target.value)}
                    style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
                </Field>
              </div>
              <Field label="Adres">
                <input type="text" value={settings.address} onChange={(e) => update('address', e.target.value)}
                  placeholder="Straat en huisnummer" style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px' }}>
                <Field label="Postcode">
                  <input type="text" value={settings.postalCode} onChange={(e) => update('postalCode', e.target.value)}
                    style={inputStyle} onFocus={onFocusBorder} onBlur={onBlurBorder} />
                </Field>
                <Field label="Plaats">
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
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
            {saved  && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>✓ Instellingen opgeslagen</span>}
            {error  && <span style={{ fontSize: '13px', color: '#B91C1C' }}>{error}</span>}
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
