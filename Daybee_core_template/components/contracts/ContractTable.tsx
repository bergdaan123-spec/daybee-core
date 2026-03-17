'use client'

import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { ContractRow } from './ContractsClient'

type Props = {
  contracts: ContractRow[]
  onEdit:    (contract: ContractRow) => void
  onDelete:  (contract: ContractRow) => void
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

function ordinal(n: number): string {
  return `${n}e`
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '100px',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.2px',
      backgroundColor: active ? '#ECFDF5' : '#F3F4F6',
      color:           active ? '#065F46' : '#6B7280',
    }}>
      {active ? 'Actief' : 'Inactief'}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const isPrivate = type === 'PRIVATE'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 7px', borderRadius: '100px',
      fontSize: '10px', fontWeight: 600,
      backgroundColor: isPrivate ? '#F3F4F6' : '#EFF6FF',
      color:           isPrivate ? '#374151' : '#1D4ED8',
    }}>
      {isPrivate ? 'Privé' : 'BV'}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContractTable({ contracts, onEdit, onDelete }: Props) {
  if (contracts.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: '14px' }}>
        Nog geen contracten — voeg uw eerste huurcontract toe om te beginnen.
      </p>
    )
  }

  return (
    <div className="table-scroll-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse' }} className="table-min-width">
        <thead>
          <tr className="table-header-row" style={{ borderBottom: '1px solid #E5E7EB' }}>
            {['Huurder', 'Pand', 'Identiteit', 'Huur', 'Betaaldag', 'Startdatum', 'Status', ''].map(h => (
              <th key={h} style={{
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
          {contracts.map(contract => (
            <tr key={contract.id} className="table-data-row" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <td style={{ padding: '13px 12px', fontSize: '14px', fontWeight: 500, color: '#111111', whiteSpace: 'nowrap' }}>
                {contract.tenant.name}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {contract.property.name}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                <span style={{ marginRight: '6px' }}>{contract.identity.name}</span>
                <TypeBadge type={contract.identity.type} />
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                {formatCurrency(contract.monthlyRent)}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {ordinal(contract.paymentDayOfMonth)}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {formatDate(contract.startDate)}
              </td>
              <td style={{ padding: '13px 12px', whiteSpace: 'nowrap' }}>
                <StatusBadge active={contract.active} />
              </td>
              <td style={{ padding: '13px 12px' }}>
                <div className="table-row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onEdit(contract)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Pencil size={13} /> Bewerken
                  </button>
                  <button
                    onClick={() => onDelete(contract)}
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
