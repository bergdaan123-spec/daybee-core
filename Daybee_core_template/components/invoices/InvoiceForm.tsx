'use client'

import React, { useState } from 'react'
import {
  inputStyle, labelStyle, sectionTitleStyle, primaryButtonStyle,
  errorBoxStyle, onFocusBorder, onBlurBorder,
} from '@/styles/shared'
import { Plus, Trash2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectOption = { id: string; name: string }
export type IdentityOption = { id: string; name: string; type: string }

export type ContractOption = {
  id:          string
  label:       string   // "Tenant name — Property name"
  tenantId:    string
  identityId:  string
  monthlyRent: string   // Decimal as string
}

export type InvoiceChargeFormLine = {
  label:     string
  reference: string
  amount:    string   // numeric string
}

export type InvoiceFormValues = {
  rentalContractId: string
  tenantId:         string
  identityId:       string
  invoiceNumber:    string
  issueDate:        string   // YYYY-MM-DD
  dueDate:          string   // YYYY-MM-DD
  amount:           string   // base amount (numeric string)
  vatRate:          string   // '' = no VAT, else rate e.g. '21'
  charges:          InvoiceChargeFormLine[]
  status:           string   // 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  description:      string
}

const STATUSES = ['DRAFT', 'SENT', 'PAID', 'OVERDUE'] as const

const STATUS_LABELS: Record<string, string> = {
  DRAFT:   'Concept',
  SENT:    'Verzonden',
  PAID:    'Betaald',
  OVERDUE: 'Achterstallig',
}

type Props = {
  contracts:    ContractOption[]
  tenants:      SelectOption[]
  identities:   IdentityOption[]
  initial?:     Partial<InvoiceFormValues>
  onSubmit:     (values: InvoiceFormValues) => Promise<void>
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

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', backgroundColor: '#FFFFFF' }

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

function defaultDueDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().split('T')[0]
}

function parseNum(s: string): number {
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

// ─── Live totals preview ───────────────────────────────────────────────────────

function LiveTotals({ base, vatRate, charges }: {
  base:     string
  vatRate:  string
  charges:  InvoiceChargeFormLine[]
}) {
  const fmt = (n: number) =>
    `€\u00A0${n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const baseAmt      = parseNum(base)
  const chargesTotal = charges.reduce((s, c) => s + parseNum(c.amount), 0)
  const subtotal     = Math.round((baseAmt + chargesTotal) * 100) / 100
  const vat          = vatRate ? Math.round(subtotal * parseNum(vatRate) / 100 * 100) / 100 : 0
  const total        = Math.round((subtotal + vat) * 100) / 100

  const hasVat      = vat > 0
  const hasCharges  = charges.some(c => c.label.trim() && parseNum(c.amount) !== 0)
  const showDetails = hasVat || hasCharges

  if (!showDetails && baseAmt === 0) return null

  return (
    <div style={{ marginTop: '4px', padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px' }}>
      {showDetails && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', marginBottom: '4px' }}>
            <span>Huurrekening</span>
            <span>{fmt(baseAmt)}</span>
          </div>
          {charges.filter(c => c.label.trim()).map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', marginBottom: '4px' }}>
              <span>{c.label}{c.reference ? ` (${c.reference})` : ''}</span>
              <span>{fmt(parseNum(c.amount))}</span>
            </div>
          ))}
          {hasVat && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', marginBottom: '4px', paddingTop: '4px', borderTop: '1px solid #E5E7EB' }}>
              <span>Subtotaal excl. BTW</span>
              <span>{fmt(subtotal)}</span>
            </div>
          )}
          {hasVat && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', marginBottom: '8px' }}>
              <span>BTW {vatRate}%</span>
              <span>{fmt(vat)}</span>
            </div>
          )}
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#111827', borderTop: showDetails ? '1px solid #D1D5DB' : 'none', paddingTop: showDetails ? '8px' : '0' }}>
        <span>Totaal</span>
        <span>{fmt(total)}</span>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoiceForm({
  contracts, tenants, identities,
  initial, onSubmit, onCancel, loading, error, submitLabel = 'Opslaan',
}: Props) {
  const defaults: InvoiceFormValues = {
    rentalContractId: '',
    tenantId:         '',
    identityId:       '',
    invoiceNumber:    '',
    issueDate:        todayString(),
    dueDate:          defaultDueDateString(),
    amount:           '',
    vatRate:          '',
    charges:          [],
    status:           'DRAFT',
    description:      '',
  }

  const [form, setForm] = useState<InvoiceFormValues>({ ...defaults, ...initial })

  function set(field: keyof Omit<InvoiceFormValues, 'charges'>, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // ── Contract selection → prefill ──────────────────────────────────────────
  function handleContractChange(contractId: string) {
    const contract = contracts.find(c => c.id === contractId)
    if (contract) {
      setForm(prev => ({
        ...prev,
        rentalContractId: contractId,
        tenantId:         contract.tenantId,
        identityId:       contract.identityId,
        amount:           parseFloat(contract.monthlyRent).toFixed(2),
      }))
    } else {
      set('rentalContractId', contractId)
    }
  }

  // ── Extra charges ─────────────────────────────────────────────────────────
  function addCharge() {
    setForm(prev => ({ ...prev, charges: [...prev.charges, { label: '', reference: '', amount: '' }] }))
  }

  function removeCharge(index: number) {
    setForm(prev => ({ ...prev, charges: prev.charges.filter((_, i) => i !== index) }))
  }

  function setCharge(index: number, field: keyof InvoiceChargeFormLine, value: string) {
    setForm(prev => {
      const updated = [...prev.charges]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, charges: updated }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  function inp(key: keyof Omit<InvoiceFormValues, 'charges'>, type = 'text', placeholder = '', extra?: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <input
        style={inputStyle}
        type={type}
        value={form[key] as string}
        placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        onFocus={onFocusBorder}
        onBlur={onBlurBorder}
        {...extra}
      />
    )
  }

  const vatBtnBase: React.CSSProperties = {
    padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
    border: '1px solid #E5E7EB', cursor: 'pointer',
  }
  const vatBtnActive: React.CSSProperties = {
    ...vatBtnBase, backgroundColor: '#1F3A5F', color: '#FFFFFF', border: '1px solid #1F3A5F',
  }
  const vatBtnInactive: React.CSSProperties = {
    ...vatBtnBase, backgroundColor: '#FFFFFF', color: '#374151',
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ ...errorBoxStyle, marginBottom: '20px' }}>{error}</div>}

      <div className="form-stack">

        {/* ── Huurcontract ──────────────────────────────────────────────────── */}
        <Section title="Huurcontract" />

        <Field label="Huurcontract">
          <select
            style={selectStyle}
            value={form.rentalContractId}
            onChange={e => handleContractChange(e.target.value)}
            onFocus={onFocusBorder}
            onBlur={onBlurBorder}
          >
            <option value="">Selecteer een contract…</option>
            {contracts.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>

        {/* Prefilled read-only display */}
        {form.rentalContractId && (
          <div style={{ display: 'flex', gap: '12px', padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#6B7280' }}>
            <span>
              <strong style={{ color: '#374151' }}>Huurder:</strong>{' '}
              {tenants.find(t => t.id === form.tenantId)?.name ?? '—'}
            </span>
            <span style={{ color: '#D1D5DB' }}>|</span>
            <span>
              <strong style={{ color: '#374151' }}>Identiteit:</strong>{' '}
              {identities.find(i => i.id === form.identityId)?.name ?? '—'}
            </span>
          </div>
        )}

        {/* Override selects */}
        <div className="form-grid-2">
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
        </div>

        {/* ── Factuurgegevens ────────────────────────────────────────────────── */}
        <Section title="Factuurgegevens" />

        <div className="form-grid-2">
          <Field label="Factuurnummer" optional>
            {inp('invoiceNumber', 'text', 'Automatisch gegenereerd indien leeg')}
          </Field>
          <Field label="Basisbedrag huur (€)">
            {inp('amount', 'number', '1250.00', { min: '0.01', step: '0.01' })}
          </Field>
        </div>

        <div className="form-grid-2">
          <Field label="Factuurdatum">
            {inp('issueDate', 'date')}
          </Field>
          <Field label="Vervaldatum">
            {inp('dueDate', 'date')}
          </Field>
        </div>

        {/* ── BTW ────────────────────────────────────────────────────────────── */}
        <Section title="BTW" />

        <Field label="BTW-tarief" optional>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {([['', 'Geen btw'], ['21', '21% btw']] as [string, string][]).map(([rate, label]) => (
              <button
                key={rate}
                type="button"
                onClick={() => set('vatRate', rate)}
                style={form.vatRate === rate ? vatBtnActive : vatBtnInactive}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        {/* ── Extra kosten ───────────────────────────────────────────────────── */}
        <Section title="Extra kosten" />

        {form.charges.length === 0 && (
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#9CA3AF' }}>
            Geen extra kosten. Klik op &quot;Regel toevoegen&quot; om een kostenregel toe te voegen.
          </p>
        )}

        {form.charges.map((charge, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <Field label={i === 0 ? 'Omschrijving' : ''}>
                <input
                  style={inputStyle}
                  type="text"
                  value={charge.label}
                  placeholder="bijv. OZBG 2026"
                  onChange={e => setCharge(i, 'label', e.target.value)}
                  onFocus={onFocusBorder}
                  onBlur={onBlurBorder}
                />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label={i === 0 ? 'Kenmerk' : ''} optional>
                <input
                  style={inputStyle}
                  type="text"
                  value={charge.reference}
                  placeholder="optioneel"
                  onChange={e => setCharge(i, 'reference', e.target.value)}
                  onFocus={onFocusBorder}
                  onBlur={onBlurBorder}
                />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label={i === 0 ? 'Bedrag (€)' : ''}>
                <input
                  style={inputStyle}
                  type="number"
                  value={charge.amount}
                  placeholder="0.00"
                  step="0.01"
                  onChange={e => setCharge(i, 'amount', e.target.value)}
                  onFocus={onFocusBorder}
                  onBlur={onBlurBorder}
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => removeCharge(i)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB', background: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', marginBottom: '1px' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addCharge}
          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', border: '1px dashed #D1D5DB', background: 'none', fontSize: '13px', color: '#6B7280', cursor: 'pointer' }}
        >
          <Plus size={14} /> Regel toevoegen
        </button>

        {/* Live totals preview */}
        <LiveTotals base={form.amount} vatRate={form.vatRate} charges={form.charges} />

        {/* ── Status ────────────────────────────────────────────────────────── */}
        <Section title="Status" />

        <Field label="Factuurstatus">
          <select
            style={selectStyle}
            value={form.status}
            onChange={e => set('status', e.target.value)}
            onFocus={onFocusBorder}
            onBlur={onBlurBorder}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </Field>

        <Field label="Omschrijving" optional>
          <textarea
            style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="bijv. Huur maart 2025 — Appartement Keizersgracht 12"
            onFocus={onFocusBorder}
            onBlur={onBlurBorder}
          />
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
