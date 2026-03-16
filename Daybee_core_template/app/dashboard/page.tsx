import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import { getAuthUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Settings, Users } from 'lucide-react'

// ─── Quick-action cards ──────────────────────────────────────────────────────
// Replace these with your domain-specific actions.
type ActionCard = { title: string; description: string; icon: React.ElementType; href: string }

const actionCards: ActionCard[] = [
  { title: 'Entities',  description: 'Manage your core records',    icon: Users,           href: '/entities' },
  { title: 'Settings',  description: 'Configure your account',      icon: Settings,        href: '/settings' },
  { title: 'Dashboard', description: 'Back to the main overview',   icon: LayoutDashboard, href: '/dashboard' },
]

// ─── Placeholder stat type ────────────────────────────────────────────────────
type Stat = { label: string; value: string | number; sub?: string }

// Replace these with real data fetched from your domain models.
const placeholderStats: Stat[] = [
  { label: 'Total records',  value: 0 },
  { label: 'Active items',   value: 0 },
  { label: 'Pending tasks',  value: 0, sub: '0 open' },
]

export default async function DashboardPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  // TODO: replace placeholderStats with real Prisma queries, e.g.:
  // const count = await prisma.entity.count({ where: { userId } })

  return (
    <AppLayout title="Dashboard">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#111111', letterSpacing: '-0.5px', marginBottom: '6px' }}>Welcome back</h2>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Here is an overview of your account</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {placeholderStats.map((stat) => (
          <Card key={stat.label}>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#111111', lineHeight: 1 }}>{stat.value}</p>
            {stat.sub && <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{stat.sub}</p>}
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111111', marginBottom: '14px' }}>Quick actions</h3>
        <div className="actions-grid">
          {actionCards.map((card) => (
            <Link key={card.href} href={card.href} style={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Card padding="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#374151' }}>
                  <card.icon size={18} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#111111', marginBottom: '4px' }}>{card.title}</p>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>{card.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111111', marginBottom: '14px' }}>Recent activity</h3>
        <Card>
          <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>
            No recent activity — add your domain data here
          </p>
        </Card>
      </div>
    </AppLayout>
  )
}
