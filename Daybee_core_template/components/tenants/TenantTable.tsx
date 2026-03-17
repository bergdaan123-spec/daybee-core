'use client'

import React from 'react'
import type { Tenant } from '@prisma/client'
import { Pencil, Trash2 } from 'lucide-react'

type Props = {
  tenants:  Tenant[]
  onEdit:   (tenant: Tenant) => void
  onDelete: (tenant: Tenant) => void
}

export default function TenantTable({ tenants, onEdit, onDelete }: Props) {
  if (tenants.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: '14px' }}>
        Nog geen huurders — voeg uw eerste huurder toe om te beginnen.
      </p>
    )
  }

  return (
    <div className="table-scroll-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse' }} className="table-min-width">
        <thead>
          <tr className="table-header-row" style={{ borderBottom: '1px solid #E5E7EB' }}>
            {['Naam', 'E-mail', 'Telefoon', 'Plaats', ''].map(h => (
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
          {tenants.map(tenant => (
            <tr key={tenant.id} className="table-data-row" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <td style={{ padding: '13px 12px', fontSize: '14px', fontWeight: 500, color: '#111111' }}>
                {tenant.name}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280' }}>
                {tenant.email}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280' }}>
                {tenant.phone ?? <span style={{ color: '#D1D5DB' }}>—</span>}
              </td>
              <td style={{ padding: '13px 12px', fontSize: '13px', color: '#6B7280' }}>
                {tenant.city}
              </td>
              <td style={{ padding: '13px 12px' }}>
                <div className="table-row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onEdit(tenant)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Pencil size={13} /> Bewerken
                  </button>
                  <button
                    onClick={() => onDelete(tenant)}
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
