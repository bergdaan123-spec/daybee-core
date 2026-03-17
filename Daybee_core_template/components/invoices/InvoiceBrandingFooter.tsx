// ─── Invoice branding footer ──────────────────────────────────────────────────
// Renders a "Powered by Daybee" line at the bottom-right of the invoice preview.
// Mirrors the branding drawn by lib/invoice/brandingFooter.ts in PDFs.
//
// To hide for premium users:
//   <InvoiceBrandingFooter hidden={user.isPremium} />

type Props = {
  /** Set to true to suppress the footer (e.g. for premium tenants). */
  hidden?: boolean
}

export default function InvoiceBrandingFooter({ hidden = false }: Props) {
  if (hidden) return null

  return (
    <div style={{
      display:        'flex',
      justifyContent: 'flex-end',
      alignItems:     'center',
      gap:            '7px',
      marginTop:      '16px',
    }}>
      <span style={{
        fontSize:      '12px',
        color:         '#111827',
        letterSpacing: '0.2px',
        lineHeight:    1,
      }}>
        Powered by
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/daybee-logo.svg"
        alt="Daybee"
        style={{ height: '18px', display: 'block' }}
      />
    </div>
  )
}
