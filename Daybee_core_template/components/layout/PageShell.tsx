import React from 'react'

type PageShellProps = {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

/**
 * PageShell
 * Consistent inner-page structure: heading row + optional CTA + content area.
 * Wrap your page body with this inside AppLayout.
 */
export default function PageShell({ title, description, action, children }: PageShellProps) {
  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111111', letterSpacing: '-0.4px', marginBottom: description ? '4px' : 0 }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '13px', color: '#6B7280' }}>{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {children}
    </>
  )
}
