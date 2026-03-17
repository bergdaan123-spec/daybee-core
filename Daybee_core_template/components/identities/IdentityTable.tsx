'use client'

import React from 'react'
import type { Identity } from '@prisma/client'
import { Pencil, Trash2 } from 'lucide-react'

type Props = {
  identities: Identity[]
  onEdit:     (identity: Identity) => void
  onDelete:   (identity: Identity) => void
}

function TypeBadge({ type }: { type: string }) {
  const isPrivate = type === 'PRIVATE'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '100px',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.2px',
      backgroundColor: isPrivate ? '#F3F4F6' : '#EFF6FF',
      color:           isPrivate ? '#374151' : '#1D4ED8',
    }}>
      {isPrivate ? 'Privé' : 'BV'}
    </span>
  )
}

export default function IdentityTable({ identities, onEdit, onDelete }: Props) {
  if (identities.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: '14px' }}>
        Nog geen identiteiten — voeg uw eerste identiteit toe om te beginnen.
      </p>
    )
  }

  return (
    <div className="table-scroll-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse' }} className="table-min-width">
        <thead>
          <tr className="table-header-row" style={{ borderBottom: '1px solid #E5E7EB' }}>
            {['Naam', 'Type', 'E-mail', 'Plaats', ''].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '10px 12px',
                fontSize: '11px', fontWeight: 600, color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {identities.map(identity => (
            <tr key={identity.id} className="table-data-row" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <td style={{ padding: '13px 12px', fontSize: '14px', fontWeight: 500, color: '#111111' }}>
                {identity.name}
              </td>
              <td style={{ padding: '13px 12px' }}>
                <TypeBadge type={identity.type} />
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280' }}>
                {identity.email}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280' }}>
                {identity.city}
              </td>
              <td style={{ padding: '13px 12px' }}>
                <div className="table-row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onEdit(identity)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Pencil size={13} /> Bewerken
                  </button>
                  <button
                    onClick={() => onDelete(identity)}
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
