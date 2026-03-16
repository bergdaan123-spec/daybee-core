'use client'

import React from 'react'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: number
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = 480,
}: ModalProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '28px',
          width: '100%', maxWidth, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111111', letterSpacing: '-0.3px' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer', lineHeight: 1, padding: '2px 8px' }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
