# SaaS Boilerplate

A reusable Next.js 14 SaaS starter extracted from the **Daybee** time-tracking and invoicing application.

---

## What this boilerplate contains

### Infrastructure

| Area | Files |
|------|-------|
| **Authentication** | `auth.ts`, `auth.config.ts`, `middleware.ts` |
| **Session helpers** | `lib/session.ts` |
| **Database (Prisma)** | `lib/prisma.ts`, `prisma/schema.prisma` (User model only) |
| **API — Auth routes** | `app/api/auth/[...nextauth]/route.ts` |
| **API — Registration** | `app/api/register/route.ts` |
| **API — Settings** | `app/api/settings/route.ts` |
| **PDF generation** | `lib/pdf.ts` (generic helpers for pdf-lib) |

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/dashboard` |
| `/login` | Email + password sign-in |
| `/register` | New account registration |
| `/dashboard` | Placeholder dashboard with stats + quick-action grid |
| `/settings` | User profile / account settings with logo upload |

### UI components

| Component | Location |
|-----------|----------|
| `AppLayout` | `components/layout/AppLayout.tsx` |
| `Header` | `components/layout/Header.tsx` |
| `Sidebar` | `components/layout/Sidebar.tsx` |
| `Card` | `components/ui/Card.tsx` |
| `Modal` | `components/ui/Modal.tsx` |

### Design system

- `styles/globals.css` — CSS custom properties, layout classes, responsive grids, mobile sidebar behaviour, table → card patterns
- `theme/colors.ts` — typed colour tokens

### Config

- `next.config.js` — serverExternalPackages for Prisma + bcryptjs
- `tsconfig.json` — `@/*` path alias
- `package.json` — all required dependencies
- `.env.example` — required environment variables
- `types/next-auth.d.ts` — session type augmentation

---

## What was considered generic

- **Authentication system** — credentials-based NextAuth v5 with JWT sessions is universal across SaaS products.
- **User registration + hashed passwords** — standard for any multi-user app.
- **Sidebar + header layout** — the visual shell is entirely domain-agnostic; only navigation items were made generic.
- **Card + Modal components** — pure presentational primitives with no domain coupling.
- **Responsive CSS system** — the grid utilities, mobile sidebar, and table → card patterns work for any content.
- **Prisma singleton** — the hot-reload prevention pattern is universal.
- **Session helper** — `getAuthUserId()` is a one-liner that works for any API route.
- **Settings page + API** — profile fields (name, email, phone, address, logo) are standard for any B2B SaaS.
- **PDF utility** — the `pdf-lib` helpers (A4 page creation, font embedding, base64 image embedding, rule drawing) are reusable for any document type.
- **Design tokens** — the colour palette is brand-neutral and easy to override.

---

## What remains project-specific in the main project (`frontend/`)

| Feature | Routes / Files |
|---------|----------------|
| Client management | `app/klanten/`, `app/api/clients/` |
| Project management | `app/projecten/`, `app/api/projects/` |
| Time registration | `app/urenregistratie/`, `app/api/time-entries/` |
| Work types | `app/werkzaamheden/`, `app/api/worktypes/` |
| Invoice creation & detail | `app/facturen/`, `app/api/invoices/` |
| Invoice PDF (domain data) | `app/api/invoices/[id]/pdf/route.ts` |
| Domain Prisma models | `Client`, `Project`, `WorkType`, `TimeEntry`, `Invoice`, `InvoiceLine` |
| Dutch-specific labels | KVK, BTW, Factuur terminology throughout |
| Domain-specific dashboard stats | hours today, active projects, open invoices |

---

## How to start a new project using this boilerplate

### 1. Copy the boilerplate

```bash
cp -r saas-boilerplate my-new-app
cd my-new-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

```bash
cp .env.example .env
# Fill in DATABASE_URL and NEXTAUTH_SECRET
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 4. Customise the app name

Search for `MyApp` in:
- `app/layout.tsx` → update `metadata.title`
- `app/login/page.tsx` → update the `<h1>`
- `app/register/page.tsx` → update the `<h1>`
- `components/layout/Sidebar.tsx` → update `APP_NAME`

### 5. Set up the database

```bash
npx prisma db push
# or
npx prisma migrate dev --name init
```

### 6. Add your domain models

Edit `prisma/schema.prisma` — add your models below the `User` model, following the commented example.

### 7. Add navigation items

Edit `components/layout/Sidebar.tsx` — add entries to the `navItems` array.

### 8. Build your domain pages

Create folders under `app/` for each domain entity (e.g. `app/entities/`).
Create matching API routes under `app/api/`.

### 9. Run the dev server

```bash
npm run dev
```

---

## Tech stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.3 | Full-stack React framework |
| React | 18 | UI library |
| NextAuth v5 | beta | Authentication |
| Prisma | 5 | ORM + type-safe DB access |
| bcryptjs | 3 | Password hashing |
| pdf-lib | 1.17 | PDF generation |
| lucide-react | latest | Icon library |
| TypeScript | 5 | Type safety |
| PostgreSQL | — | Database (e.g. Neon) |
