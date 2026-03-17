import React from 'react'
import Link  from 'next/link'
import Card  from '@/components/ui/Card'
import PdfDownloadButton        from './PdfDownloadButton'
import InvoiceBrandingFooter    from './InvoiceBrandingFooter'
import { sectionTitleStyle }    from '@/styles/shared'
import { ArrowLeft }            from 'lucide-react'
import type { InvoiceViewModel } from '@/lib/invoice/types'
import { brandColorNeedsDarkText } from '@/lib/invoice/getBrandColor'

type Props = { invoice: InvoiceViewModel }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(date: Date): string {
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtCurrency(value: number): string {
  return `€\u00A0${value.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Section heading ──────────────────────────────────────────────────────────

function Section({ title }: { title: string }) {
  return (
    <p style={{ ...sectionTitleStyle, marginTop: '0', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>
      {title}
    </p>
  )
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', color: '#111827' }}>{value}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoiceDetail({ invoice }: Props) {
  const { sender, recipient, property, contract } = invoice
  const brandColor  = invoice.brandColor
  const onBrandText = brandColorNeedsDarkText(brandColor) ? '#111827' : '#ffffff'

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Back link + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link
          href="/invoices"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} /> Terug naar facturen
        </Link>
        <PdfDownloadButton invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
      </div>

      <Card padding="md">
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            {invoice.logoUrl && (
              <img
                src={invoice.logoUrl}
                alt="Bedrijfslogo"
                style={{ maxHeight: '48px', maxWidth: '160px', display: 'block', marginBottom: '12px', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: '#111827' }}>
              {invoice.invoiceNumber}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
              Factuurdatum {fmtDate(invoice.issueDate)} · Vervaldatum {fmtDate(invoice.dueDate)}
            </p>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
            {fmtCurrency(invoice.amount)}
          </span>
        </div>

        {/* ── Van / Aan ── */}
        <div className="form-grid-2" style={{ marginBottom: '28px' }}>
          <div>
            <Section title="Van" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Row label="Naam"    value={sender.name} />
              <Row label="Type"    value={sender.type === 'PRIVATE' ? 'Privé' : 'BV'} />
              <Row label="Adres"   value={`${sender.address}, ${sender.postalCode} ${sender.city}`} />
              <Row label="Land"    value={sender.country} />
              <Row label="E-mail"  value={sender.email} />
              {sender.phone     && <Row label="Telefoon" value={sender.phone} />}
              {sender.kvkNumber && <Row label="KVK"      value={sender.kvkNumber} />}
              {sender.btwNumber && <Row label="BTW"      value={sender.btwNumber} />}
              {sender.iban      && <Row label="IBAN"     value={sender.iban} />}
            </div>
          </div>

          <div>
            <Section title="Aan" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Row label="Naam"     value={recipient.name} />
              <Row label="Adres"    value={`${recipient.address}, ${recipient.postalCode} ${recipient.city}`} />
              <Row label="Land"     value={recipient.country} />
              <Row label="E-mail"   value={recipient.email} />
              {recipient.phone && <Row label="Telefoon" value={recipient.phone} />}
            </div>
          </div>
        </div>

        {/* ── Huurcontract ── */}
        <div style={{ marginBottom: '28px' }}>
          <Section title="Huurcontract" />
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <Row label="Maandhuur"  value={fmtCurrency(contract.monthlyRent)} />
            <Row label="Startdatum" value={fmtDate(contract.startDate)} />
            {contract.endDate && <Row label="Einddatum" value={fmtDate(contract.endDate)} />}
          </div>
        </div>

        {/* ── Factuurbedrag ── */}
        <div>
          <Section title="Bedrag" />

          {/* Description / base rent line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#F9FAFB', borderRadius: '8px 8px 0 0', border: '1px solid #E5E7EB', borderBottom: 'none' }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>{invoice.description}</span>
            <span style={{ fontSize: '15px', color: '#374151' }}>{fmtCurrency(invoice.totals.baseAmount)}</span>
          </div>

          {/* Extra charge lines */}
          {invoice.totals.extraCharges.map((charge, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderBottom: 'none' }}>
              <span style={{ fontSize: '14px', color: '#374151' }}>
                {charge.label}{charge.reference ? <span style={{ color: '#9CA3AF', fontSize: '13px' }}> ({charge.reference})</span> : null}
              </span>
              <span style={{ fontSize: '15px', color: '#374151' }}>{fmtCurrency(charge.amount)}</span>
            </div>
          ))}

          {/* Subtotal excl. VAT — only when VAT applies */}
          {invoice.totals.vatRate && invoice.totals.vatRate > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderBottom: 'none' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Subtotaal excl. BTW</span>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>{fmtCurrency(invoice.totals.subtotalExclVat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderBottom: 'none' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>BTW {invoice.totals.vatRate}%</span>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>{fmtCurrency(invoice.totals.vatAmount)}</span>
              </div>
            </>
          )}

          {/* Brand-color total bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: brandColor, borderRadius: '0 0 8px 8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.4px', color: onBrandText }}>
              TOTAAL TE BETALEN
            </span>
            <span style={{ fontSize: '17px', fontWeight: 700, color: onBrandText }}>
              {fmtCurrency(invoice.totals.totalAmount)}
            </span>
          </div>
        </div>
      </Card>

      <InvoiceBrandingFooter hidden={invoice.hideBranding} />
    </div>
  )
}
