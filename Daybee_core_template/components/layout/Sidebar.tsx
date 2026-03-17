'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Settings, LogOut, X, Building2, Users, Home, FileText, Receipt } from 'lucide-react'
import { APP_NAME } from '@/lib/config'

type NavItem = {
  label: string
  href: string
  Icon: React.ElementType
  exact?: boolean  // if true, only highlight on exact path match (not prefix match)
}

// ─── Navigation items ──────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',   Icon: LayoutDashboard, exact: true },
  { label: 'Identiteiten', href: '/identities',  Icon: Building2 },
  { label: 'Huurders',     href: '/tenants',     Icon: Users },
  { label: 'Panden',       href: '/properties',  Icon: Home },
  { label: 'Contracten',   href: '/contracts',   Icon: FileText },
  { label: 'Facturen',     href: '/invoices',    Icon: Receipt },
  { label: 'Instellingen', href: '/settings',    Icon: Settings },
]

type SidebarProps = {
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        {/* App name / logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.4px' }}>
            {APP_NAME}
          </span>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex', alignItems: 'center' }}
            aria-label="Menu sluiten"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '7px', marginBottom: '2px',
                  backgroundColor: active ? 'var(--color-sidebar-active)' : 'transparent',
                  color: active ? 'var(--color-sidebar-active-text)' : '#374151',
                  fontSize: '14px', fontWeight: active ? 500 : 400,
                  transition: 'background-color 0.1s ease', textDecoration: 'none',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <item.Icon size={16} strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '7px', color: 'var(--color-text-secondary)',
              fontSize: '14px', transition: 'background-color 0.1s ease',
              background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <LogOut size={16} strokeWidth={1.75} />
            <span>Uitloggen</span>
          </button>
        </div>
      </aside>
    </>
  )
}
