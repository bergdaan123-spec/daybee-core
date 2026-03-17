'use client'

import React, { useState } from 'react'
import {
  inputStyle, labelStyle, primaryButtonStyle,
  errorBoxStyle, onFocusBorder, onBlurBorder,
} from '@/styles/shared'

export type PropertyFormValues = {
  name:       string
  address:    string
  postalCode: string
  city:       string
  country:    string
  notes:      string
}

const empty: PropertyFormValues = {
  name: '', address: '', postalCode: '', city: '', country: 'Nederland', notes: '',
}

type Props = {
  initial?:     Partial<PropertyFormValues>
  onSubmit:     (values: PropertyFormValues) => Promise<void>
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

export default function PropertyForm({
  initial, onSubmit, onCancel, loading, error, submitLabel = 'Opslaan',
}: Props) {
  const [form, setForm] = useState<PropertyFormValues>({ ...empty, ...initial })

  function set(field: keyof PropertyFormValues, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  function inp(key: keyof PropertyFormValues, placeholder = '') {
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
        <Field label="Naam pand">{inp('name', 'bijv. Appartement Keizersgracht 12')}</Field>
        <Field label="Adres">{inp('address', 'Straat en huisnummer')}</Field>

        <div className="form-grid-2">
          <Field label="Postcode">{inp('postalCode', '1234 AB')}</Field>
          <Field label="Plaats">{inp('city', 'Amsterdam')}</Field>
        </div>

        <Field label="Land">{inp('country')}</Field>

        <Field label="Opmerkingen" optional>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Eventuele opmerkingen over dit pand…"
            onFocus={onFocusBorder}
            onBlur={onBlurBorder}
          />
        </Field>

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
