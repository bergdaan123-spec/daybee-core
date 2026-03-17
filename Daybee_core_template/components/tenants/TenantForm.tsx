'use client'

import React, { useState } from 'react'
import {
  inputStyle, labelStyle, primaryButtonStyle,
  errorBoxStyle, onFocusBorder, onBlurBorder,
} from '@/styles/shared'

export type TenantFormValues = {
  name:          string
  email:         string
  phone:         string
  address:       string
  postalCode:    string
  city:          string
  country:       string
  companyName:   string
  contactPerson: string
  kvkNumber:     string
  btwNumber:     string
}

const empty: TenantFormValues = {
  name: '', email: '', phone: '', address: '',
  postalCode: '', city: '', country: 'Nederland',
  companyName: '', contactPerson: '', kvkNumber: '', btwNumber: '',
}

type Props = {
  initial?:     Partial<TenantFormValues>
  onSubmit:     (values: TenantFormValues) => Promise<void>
  onCancel:     () => void
  loading:      boolean
  error:        string | null
  submitLabel?: string
}

function Field({ label, optional, children }: {
  label:     string
  optional?: boolean
  children:  React.ReactNode
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

export default function TenantForm({
  initial, onSubmit, onCancel, loading, error, submitLabel = 'Opslaan',
}: Props) {
  const [form, setForm] = useState<TenantFormValues>({ ...empty, ...initial })

  function set(field: keyof TenantFormValues, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  function inp(key: keyof TenantFormValues, placeholder = '') {
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
        <Field label="Volledige naam">{inp('name', 'bijv. Anna van Dam')}</Field>

        <div className="form-grid-2">
          <Field label="E-mailadres">{inp('email', 'bijv. anna@voorbeeld.nl')}</Field>
          <Field label="Telefoon" optional>{inp('phone', '+31 6 12345678')}</Field>
        </div>

        <Field label="Adres">{inp('address', 'Straat en huisnummer')}</Field>

        <div className="form-grid-2">
          <Field label="Postcode">{inp('postalCode', '1234 AB')}</Field>
          <Field label="Plaats">{inp('city', 'Amsterdam')}</Field>
        </div>

        <Field label="Land">{inp('country')}</Field>

        {/* ── Bedrijfsgegevens (optioneel) ── */}
        <div style={{ paddingTop: '4px', borderTop: '1px solid #F3F4F6' }}>
          <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Bedrijfsgegevens <span style={{ fontWeight: 400 }}>(optioneel)</span>
          </p>
          <div className="form-stack">
            <div className="form-grid-2">
              <Field label="Bedrijfsnaam" optional>{inp('companyName', 'bijv. Vastgoed BV')}</Field>
              <Field label="Contactpersoon" optional>{inp('contactPerson', 'bijv. Jan de Vries')}</Field>
            </div>
            <div className="form-grid-2">
              <Field label="KVK-nummer" optional>{inp('kvkNumber', '12345678')}</Field>
              <Field label="BTW-nummer" optional>{inp('btwNumber', 'NL123456789B01')}</Field>
            </div>
          </div>
        </div>

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
