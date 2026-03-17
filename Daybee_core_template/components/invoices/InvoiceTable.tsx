'use client'

import React from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Eye, FileDown } from 'lucide-react'
import type { InvoiceRow } from './InvoicesClient'

type Props = {
  invoices: InvoiceRow[]
  onEdit:   (invoice: InvoiceRow) => void
  onDelete: (invoice: InvoiceRow) => void
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `€\u00A0${num.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type StatusConfig = { bg: string; color: string; label: string }

const STATUS_CONFIG: Record<string, StatusConfig> = {
  DRAFT:   { bg: '#F3F4F6', color: '#6B7280', label: 'Concept'      },
  SENT:    { bg: '#EFF6FF', color: '#1D4ED8', label: 'Verzonden'    },
  PAID:    { bg: '#ECFDF5', color: '#065F46', label: 'Betaald'      },
  OVERDUE: { bg: '#FEF2F2', color: '#DC2626', label: 'Achterstallig' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '100px',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.2px',
      backgroundColor: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoiceTable({ invoices, onEdit, onDelete }: Props) {
  if (invoices.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: '14px' }}>
        Nog geen facturen — maak uw eerste factuur aan om te beginnen.
      </p>
    )
  }

  return (
    <div className="table-scroll-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse' }} className="table-min-width">
        <thead>
          <tr className="table-header-row" style={{ borderBottom: '1px solid #E5E7EB' }}>
            {['Factuur #', 'Huurder', 'Pand', 'Bedrag', 'Factuurdatum', 'Vervaldatum', 'Status', ''].map((h, i) => (
              <th key={i} style={{
                textAlign: 'left', padding: '10px 12px',
                fontSize: '11px', fontWeight: 600, color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.id} className="table-data-row" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <td style={{ padding: '13px 12px', fontSize: '13px', fontWeight: 600, color: '#111111', whiteSpace: 'nowrap' }}>
                <Link
                  href={`/invoices/${invoice.id}`}
                  style={{ color: '#111111', textDecoration: 'none', borderBottom: '1px solid #E5E7EB' }}
                >
                  {invoice.invoiceNumber}
                </Link>
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>
                {invoice.tenant.name}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {invoice.rentalContract.property.name}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                {formatCurrency(invoice.amount)}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {formatDate(invoice.issueDate)}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {formatDate(invoice.dueDate)}
              </td>
              <td style={{ padding: '13px 12px', whiteSpace: 'nowrap' }}>
                <StatusBadge status={invoice.status} />
              </td>
              <td style={{ padding: '13px 12px' }}>
                <div className="table-row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Link
                    href={`/invoices/${invoice.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151', fontSize: '13px', textDecoration: 'none' }}
                  >
                    <Eye size={13} /> Bekijken
                  </Link>
                  <button
                    onClick={() => onEdit(invoice)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Pencil size={13} /> Bewerken
                  </button>
                  <a
                    href={`/api/invoices/${invoice.id}/pdf`}
                    title="PDF downloaden"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151', fontSize: '13px', textDecoration: 'none' }}
                  >
                    <FileDown size={13} /> PDF
                  </a>
                  <button
                    onClick={() => onDelete(invoice)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FFFFFF', color: '#DC2626', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} /> Verwijderen
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
