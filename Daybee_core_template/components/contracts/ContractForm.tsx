'use client'

import React, { useState } from 'react'
import {
  inputStyle, labelStyle, sectionTitleStyle, primaryButtonStyle,
  errorBoxStyle, onFocusBorder, onBlurBorder,
} from '@/styles/shared'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectOption    = { id: string; name: string }
export type IdentityOption  = { id: string; name: string; type: string }

export type ContractFormValues = {
  tenantId:          string
  propertyId:        string
  identityId:        string
  monthlyRent:       string   // numeric string, e.g. "1250.00"
  paymentDayOfMonth: string   // numeric string "1"–"31"
  startDate:         string   // YYYY-MM-DD
  endDate:           string   // YYYY-MM-DD or ''
  active:            boolean
}

const empty: ContractFormValues = {
  tenantId: '', propertyId: '', identityId: '',
  monthlyRent: '', paymentDayOfMonth: '1',
  startDate: '', endDate: '', active: true,
}

type Props = {
  tenants:      SelectOption[]
  properties:   SelectOption[]
  identities:   IdentityOption[]
  initial?:     Partial<ContractFormValues>
  onSubmit:     (values: ContractFormValues) => Promise<void>
  onCancel:     () => void
  loading:      boolean
  error:        string | null
  submitLabel?: string
}

// ─── Local helpers ────────────────────────────────────────────────────────────

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

function Section({ title }: { title: string }) {
  return <p style={{ ...sectionTitleStyle, marginTop: '4px', marginBottom: '12px' }}>{title}</p>
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  backgroundColor: '#FFFFFF',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContractForm({
  tenants, properties, identities,
  initial, onSubmit, onCancel, loading, error, submitLabel = 'Opslaan',
}: Props) {
  const [form, setForm] = useState<ContractFormValues>({ ...empty, ...initial })

  function set(field: keyof ContractFormValues, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ ...errorBoxStyle, marginBottom: '20px' }}>{error}</div>}

      <div className="form-stack">

        {/* ── Gerelateerde records ──────────────────────────────────────────── */}
        <Section title="Gerelateerde records" />

        <Field label="Huurder">
          <select
            style={selectStyle}
            value={form.tenantId}
            onChange={e => set('tenantId', e.target.value)}
            onFocus={onFocusBorder}
            onBlur={onBlurBorder}
          >
            <option value="">Selecteer een huurder…</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Pand">
          <select
            style={selectStyle}
            value={form.propertyId}
            onChange={e => set('propertyId', e.target.value)}
            onFocus={onFocusBorder}
            onBlur={onBlurBorder}
          >
            <option value="">Selecteer een pand…</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Afzenderidentiteit">
          <select
            style={selectStyle}
            value={form.identityId}
            onChange={e => set('identityId', e.target.value)}
            onFocus={onFocusBorder}
            onBlur={onBlurBorder}
          >
            <option value="">Selecteer een identiteit…</option>
            {identities.map(i => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.type === 'PRIVATE' ? 'Privé' : 'BV'})
              </option>
            ))}
          </select>
        </Field>

        {/* ── Financiële voorwaarden ────────────────────────────────────────── */}
        <Section title="Financiële voorwaarden" />

        <div className="form-grid-2">
          <Field label="Maandhuur (€)">
            <input
              style={inputStyle}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="1250.00"
              value={form.monthlyRent}
              onChange={e => set('monthlyRent', e.target.value)}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
          </Field>

          <Field label="Betaaldag van de maand">
            <input
              style={inputStyle}
              type="number"
              min="1"
              max="31"
              step="1"
              placeholder="1"
              value={form.paymentDayOfMonth}
              onChange={e => set('paymentDayOfMonth', e.target.value)}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
          </Field>
        </div>

        {/* ── Contractperiode ────────────────────────────────────────────────── */}
        <Section title="Contractperiode" />

        <div className="form-grid-2">
          <Field label="Startdatum">
            <input
              style={inputStyle}
              type="date"
              value={form.startDate}
              onChange={e => set('startDate', e.target.value)}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
          </Field>

          <Field label="Einddatum" optional>
            <input
              style={inputStyle}
              type="date"
              value={form.endDate}
              onChange={e => set('endDate', e.target.value)}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
          </Field>
        </div>

        {/* ── Status ────────────────────────────────────────────────────────── */}
        <Section title="Status" />

        <Field label="Contractstatus">
          <div style={{ display: 'flex', gap: '8px' }}>
            {([true, false] as const).map(val => {
              const active = form.active === val
              return (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => set('active', val)}
                  style={{
                    padding: '8px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', border: '1px solid', transition: 'all 0.15s ease',
                    borderColor:     active ? '#111111' : '#E5E7EB',
                    backgroundColor: active ? '#111111' : '#FFFFFF',
                    color:           active ? '#FFFFFF'  : '#374151',
                  }}
                >
                  {val ? 'Actief' : 'Inactief'}
                </button>
              )
            })}
          </div>
        </Field>

        {/* ── Acties ────────────────────────────────────────────────────────── */}
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
