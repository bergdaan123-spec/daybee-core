'use client'

import { Menu } from 'lucide-react'
import AvatarMenu from '@/components/ui/AvatarMenu'

type HeaderProps = {
  title: string
  onMenuClick?: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px 0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: 'var(--radius-sm)' }}
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <h1 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.2px' }}>
          {title}
        </h1>
      </div>

      <AvatarMenu />
    </header>
  )
}
