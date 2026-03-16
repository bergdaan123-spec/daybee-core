# Example App Structure

This document describes how to structure a new SaaS product built on top of this boilerplate.
Use it as a reference when planning a new domain.

---

## Domain models

Every domain model should follow this pattern in `prisma/schema.prisma`:

```prisma
model Entity {
  id          String   @id @default(cuid())
  userId      String                          // always scope to a user
  name        String
  description String?
  status      EntityStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  records Record[] // child relations
}
```

**Rules:**
- Every model must have `userId` + a `User` relation (for row-level security in API routes).
- Use `onDelete: Cascade` on relations to the User so data is cleaned up automatically.
- Status enums keep string queries out of application code.
- Always include `createdAt` / `updatedAt` for auditing.

### Typical hierarchy for a B2B SaaS

```
User
 └── Entity  (e.g. Client, Customer, Organisation)
      └── Resource  (e.g. Project, Subscription, Case)
           └── Record  (e.g. TimeEntry, Activity, Event)
                └── Document  (e.g. Invoice, Report, Receipt)
```

---

## Modules

Each domain module lives in its own folder under `app/` and `app/api/`:

```
app/
  entities/
    page.tsx              ← list view (server component)
    [id]/
      page.tsx            ← detail view (server component)
    EntityClient.tsx      ← client-side interactive parts

app/api/
  entities/
    route.ts              ← GET (list) + POST (create)
    [id]/
      route.ts            ← PATCH (update) + DELETE
```

### Server components vs client components

| Component type | When to use |
|----------------|-------------|
| `page.tsx` (server) | Fetch data with Prisma directly; no `useState` |
| `*Client.tsx` (client) | Forms, modals, interactive tables with `useState` |
| API routes | All mutations; also data fetching from client components |

---

## Routes

### Naming conventions

| Route pattern | Purpose |
|---------------|---------|
| `/entities` | List all records |
| `/entities/new` | Create form (or open modal on list page) |
| `/entities/[id]` | Detail / edit page |
| `/api/entities` | GET + POST |
| `/api/entities/[id]` | PATCH + DELETE |
| `/api/entities/[id]/export` | Domain-specific actions (PDF, CSV, etc.) |

### API route template

```typescript
// app/api/entities/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entities = await prisma.entity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(entities)
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const entity = await prisma.entity.create({
    data: { ...body, userId },
  })
  return NextResponse.json(entity, { status: 201 })
}
```

---

## Database extensions

When extending the base schema, add your models **below** the `User` model in `prisma/schema.prisma`, then add the inverse relation to `User`:

```prisma
// In the User model:
model User {
  // ...existing fields...
  entities Entity[]   // ← add this line
}

// New model:
model Entity {
  id     String @id @default(cuid())
  userId String
  name   String
  // ...
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Run after changes:
```bash
npx prisma migrate dev --name add-entity
```

---

## UI modules

### Page template (list + modal create)

```tsx
// app/entities/page.tsx  (server component)
import AppLayout from '@/components/layout/AppLayout'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import EntitiesClient from './EntitiesClient'

export default async function EntitiesPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  const entities = await prisma.entity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AppLayout title="Entities">
      <EntitiesClient initialData={entities} />
    </AppLayout>
  )
}
```

```tsx
// app/entities/EntitiesClient.tsx  (client component)
'use client'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'

export default function EntitiesClient({ initialData }: { initialData: Entity[] }) {
  const [items, setItems]         = useState(initialData)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="page-header">
        <h2>Entities</h2>
        <button onClick={() => setModalOpen(true)}>New entity</button>
      </div>

      {items.map(item => (
        <Card key={item.id}>{item.name}</Card>
      ))}

      <Modal open={modalOpen} title="New entity" onClose={() => setModalOpen(false)}>
        {/* create form */}
      </Modal>
    </>
  )
}
```

---

## Adding a PDF export

Use the helpers from `lib/pdf.ts`:

```typescript
// app/api/entities/[id]/export/route.ts
import { createA4Document, drawRule, savePDF, pdfResponseHeaders, fromTop, BLACK } from '@/lib/pdf'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { doc, page, regular, bold, width, height } = await createA4Document()

  // Draw content
  page.drawText('My Document', { x: 50, y: fromTop(60, height), font: bold, size: 18, color: BLACK })
  drawRule(page, fromTop(80, height))

  const buffer = await savePDF(doc)
  return new Response(buffer, {
    status: 200,
    headers: pdfResponseHeaders(`document-${params.id}.pdf`, buffer.byteLength),
  })
}
```

---

## Checklist for a new domain module

- [ ] Add Prisma model(s) + run `prisma migrate dev`
- [ ] Add API routes: `GET`, `POST`, `PATCH`, `DELETE`
- [ ] Add `page.tsx` (server component, data fetch)
- [ ] Add `*Client.tsx` (client component, interactive UI)
- [ ] Add nav item in `components/layout/Sidebar.tsx`
- [ ] Add quick-action card in `app/dashboard/page.tsx`
- [ ] Write domain types in `types/` if needed
- [ ] Add PDF export in `app/api/.../export/route.ts` (if needed)
