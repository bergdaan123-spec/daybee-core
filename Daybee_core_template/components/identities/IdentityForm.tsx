'use client'

import React, { useState } from 'react'
import {
  inputStyle, labelStyle, primaryButtonStyle,
  errorBoxStyle, onFocusBorder, onBlurBorder,
} from '@/styles/shared'

export type IdentityFormValues = {
  name:      string
  type:      'PRIVATE' | 'BV'
  address:   string
  postalCode: string
  city:      string
  country:   string
  email:     string
  phone:     string
  kvkNumber: string
  btwNumber: string
  iban:      string
}

const empty: IdentityFormValues = {
  name: '', type: 'PRIVATE', address: '', postalCode: '',
  city: '', country: 'Nederland', email: '', phone: '',
  kvkNumber: '', btwNumber: '', iban: '',
}

type Props = {
  initial?:    Partial<IdentityFormValues>
  onSubmit:    (values: IdentityFormValues) => Promise<void>
  onCancel:    () => void
  loading:     boolean
  error:       string | null
  submitLabel?: string
}

// ─── Local helper ─────────────────────────────────────────────────────────────

function Field({ label, optional, children }: {
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {optional && <span style={{ color: '#9CA3AF', fontWeight: 400 }}> (optioneel)</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IdentityForm({
  initial, onSubmit, onCancel, loading, error, submitLabel = 'Opslaan',
}: Props) {
  const [form, setForm] = useState<IdentityFormValues>({ ...empty, ...initial })

  function set(field: keyof IdentityFormValues, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  function inp(key: keyof IdentityFormValues, placeholder = '') {
    return (
      <input
        style={inputStyle}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        onFocus={onFocusBorder}
        onBlur={onBlurBorder}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ ...errorBoxStyle, marginBottom: '20px' }}>{error}</div>}

      <div className="form-stack">

        {/* Type toggle */}
        <Field label="Type">
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['PRIVATE', 'BV'] as const).map(t => {
              const active = form.type === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  style={{
                    padding: '8px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', border: '1px solid', transition: 'all 0.15s ease',
                    borderColor:     active ? '#111111' : '#E5E7EB',
                    backgroundColor: active ? '#111111' : '#FFFFFF',
                    color:           active ? '#FFFFFF'  : '#374151',
                  }}
                >
                  {t === 'PRIVATE' ? 'Privé' : 'BV'}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="Naam">{inp('name', 'bijv. Jan de Vries')}</Field>
        <Field label="E-mailadres">{inp('email', 'bijv. jan@voorbeeld.nl')}</Field>
        <Field label="Adres">{inp('address', 'Straat en huisnummer')}</Field>

        <div className="form-grid-2">
          <Field label="Postcode">{inp('postalCode', '1234 AB')}</Field>
          <Field label="Plaats">{inp('city', 'Amsterdam')}</Field>
        </div>

        <Field label="Land">{inp('country')}</Field>
        <Field label="Telefoon" optional>{inp('phone', '+31 6 12345678')}</Field>
        <Field label="IBAN" optional>{inp('iban', 'NL00 BANK 0000 0000 00')}</Field>
        <Field label="KVK-nummer" optional>{inp('kvkNumber', '12345678')}</Field>
        <Field label="BTW-nummer" optional>{inp('btwNumber', 'NL123456789B01')}</Field>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: '6px', fontSize: '14px',
              background: 'none', border: '1px solid #E5E7EB', color: '#374151', cursor: 'pointer',
            }}
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ ...primaryButtonStyle, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Opslaan…' : submitLabel}
          </button>
        </div>

      </div>
    </form>
  )
}
