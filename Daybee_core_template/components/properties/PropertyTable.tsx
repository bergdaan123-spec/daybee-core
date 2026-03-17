'use client'

import React from 'react'
import type { Property } from '@prisma/client'
import { Pencil, Trash2 } from 'lucide-react'

type Props = {
  properties: Property[]
  onEdit:     (property: Property) => void
  onDelete:   (property: Property) => void
}

export default function PropertyTable({ properties, onEdit, onDelete }: Props) {
  if (properties.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: '14px' }}>
        Nog geen panden — voeg uw eerste pand toe om te beginnen.
      </p>
    )
  }

  return (
    <div className="table-scroll-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse' }} className="table-min-width">
        <thead>
          <tr className="table-header-row" style={{ borderBottom: '1px solid #E5E7EB' }}>
            {['Naam', 'Adres', 'Plaats', 'Land', ''].map(h => (
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
          {properties.map(property => (
            <tr key={property.id} className="table-data-row" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <td style={{ padding: '13px 12px', fontSize: '14px', fontWeight: 500, color: '#111111' }}>
                {property.name}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280' }}>
                {property.address}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280' }}>
                {property.city}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280' }}>
                {property.country}
              </td>
              <td style={{ padding: '13px 12px' }}>
                <div className="table-row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onEdit(property)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Pencil size={13} /> Bewerken
                  </button>
                  <button
                    onClick={() => onDelete(property)}
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
