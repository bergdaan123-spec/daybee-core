'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Settings, LogOut } from 'lucide-react'

/**
 * AvatarMenu — user avatar button with a dropdown for common account actions.
 *
 * Renders:
 *   [username] [initials circle] → click → dropdown with profile info,
 *   a Settings link, and a Sign out button.
 *
 * To add more items, extend the `menuItems` array or add JSX inside the
 * dropdown content block.
 */
export default function AvatarMenu() {
  const { data: session } = useSession()
  const [open, setOpen]       = useState(false)
  const [initials, setInitials] = useState('?')
  const containerRef = useRef<HTMLDivElement>(null)

  const displayName = session?.user?.name || session?.user?.email || 'User'
  const email       = session?.user?.email ?? ''

  // Derive initials from display name
  useEffect(() => {
    setInitials(
      displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    )
  }, [displayName])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Username label */}
      <span className="header-username" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        {displayName}
      </span>

      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-sidebar-active)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 600,
          flexShrink: 0,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            minWidth: '192px',
            zIndex: 50,
            padding: '6px',
          }}
        >
          {/* Profile info */}
          <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #F3F4F6', marginBottom: '4px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{displayName}</p>
            {email && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{email}</p>
            )}
          </div>

          {/* Settings link */}
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#374151', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Settings size={14} strokeWidth={1.75} />
            Settings
          </Link>

          {/* Divider + Sign out */}
          <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '4px', paddingTop: '4px' }}>
            <button
              role="menuitem"
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/login' }) }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <LogOut size={14} strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
