'use client'

import React, { useState } from 'react'
import { FileDown } from 'lucide-react'
import { primaryButtonStyle } from '@/styles/shared'

type Props = {
  invoiceId:     string
  invoiceNumber: string
}

/**
 * Triggers a PDF download via the /api/invoices/[id]/pdf route.
 * Shows a loading state while the PDF is being generated.
 */
export default function PdfDownloadButton({ invoiceId, invoiceNumber }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'PDF genereren mislukt')
      }
      const blob     = await res.blob()
      const url      = URL.createObjectURL(blob)
      const anchor   = document.createElement('a')
      anchor.href     = url
      anchor.download = `factuur-${invoiceNumber}.pdf`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          ...primaryButtonStyle,
          display: 'flex', alignItems: 'center', gap: '7px',
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        <FileDown size={15} strokeWidth={2.5} />
        {loading ? 'Genereren…' : 'PDF downloaden'}
      </button>
      {error && (
        <p style={{ marginTop: '6px', fontSize: '12px', color: '#DC2626' }}>{error}</p>
      )}
    </div>
  )
}
