import React from 'react'
import AppLayout from '@/components/layout/AppLayout'
import PageShell from '@/components/layout/PageShell'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import { getAuthUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Building2, Users, Home, FileText, Receipt } from 'lucide-react'

// ─── Quick-action cards ────────────────────────────────────────────────────────
type ActionCard = { title: string; description: string; icon: React.ElementType; href: string }

const actionCards: ActionCard[] = [
  { title: 'Identiteiten', description: 'Beheer uw privé- en BV-afzenderidentiteiten', icon: Building2, href: '/identities' },
  { title: 'Huurders',     description: 'Bekijk en beheer uw huurders',                icon: Users,     href: '/tenants' },
  { title: 'Panden',       description: 'Beheer uw verhuurpanden',                     icon: Home,      href: '/properties' },
  { title: 'Contracten',   description: 'Bekijk en beheer huurcontracten',             icon: FileText,  href: '/contracts' },
  { title: 'Facturen',     description: 'Maak huurrekeningen aan en volg ze op',       icon: Receipt,   href: '/invoices' },
]

// ─── Placeholder stats ────────────────────────────────────────────────────────
type Stat = { label: string; value: string | number; sub?: string }

const placeholderStats: Stat[] = [
  { label: 'Actieve contracten',     value: 0 },
  { label: 'Openstaande facturen',   value: 0 },
  { label: 'Achterstallige facturen', value: 0, sub: '€ 0,00 openstaand' },
]

export default async function DashboardPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  // TODO: replace placeholderStats with real Prisma queries, e.g.:
  // const activeContracts = await prisma.rentalContract.count({ where: { userId, active: true } })
  // const openInvoices    = await prisma.invoice.count({ where: { userId, status: { in: ['DRAFT', 'SENT'] } } })

  return (
    <AppLayout title="Dashboard">
      <PageShell title="Welkom terug" description="Hier is een overzicht van uw verhuurportfolio">

        {/* Stats */}
        <div className="stats-grid">
          {placeholderStats.map((stat) => (
            <Card key={stat.label}>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111111', lineHeight: 1 }}>
                {stat.value}
              </p>
              {stat.sub && (
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{stat.sub}</p>
              )}
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111111', marginBottom: '14px' }}>
            Modules
          </h3>
          <div className="actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
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

        {/* Recent activity */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111111', marginBottom: '14px' }}>
            Recente activiteit
          </h3>
          <Card>
            <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>
              Nog geen recente activiteit — maak uw eerste factuur aan om te beginnen.
            </p>
          </Card>
        </div>

      </PageShell>
    </AppLayout>
  )
}
