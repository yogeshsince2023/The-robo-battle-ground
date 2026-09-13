# RoboWar Arena — Business Website & Management Dashboard

A full-stack website for a Robowar arena / robotics training / CNC-VMC-3D printing machining
business, plus a private admin dashboard with enquiry management, content management, and a
4-partner accounting system.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma ORM · SQLite (dev) ·
custom cookie/JWT auth (bcryptjs + jose) · react-hook-form + zod · recharts.

> **Why SQLite instead of PostgreSQL?** This environment has no Postgres server available, so the
> Prisma schema uses SQLite for a zero-setup local database. Every model, relation, and query is
> written in a Postgres-compatible way — switching later is a two-line change (see
> [Switching to PostgreSQL](#switching-to-postgresql) below), no application code changes needed.
>
> **Why not NextAuth?** NextAuth's current major version (v5/beta) has peer-dependency conflicts
> with React 19 / Next 16 that caused the install to hang. Since this app only needs simple
> email+password admin auth (no OAuth providers), a small custom auth layer
> (`lib/auth.ts` + `proxy.ts`) using `bcryptjs` for password hashing and `jose` for signed,
> httpOnly-cookie JWT sessions is simpler, has zero dependency risk, and is easy to audit.

---

## 1. Project Structure

```
app/
  (site)/              Public marketing pages (Navbar+Footer layout)
    page.tsx            Home
    arena/               Arena info + "Send Arena Enquiry" form
    training/            Training programs + registration form
    machining/           CNC/VMC/3D Printing + quotation form (with file upload)
    projects/            Portfolio list + [slug] detail pages
    about/               About us + Owner profile
    contact/             Contact info + message form
    certificate-verification/   Public certificate lookup
  admin/
    login/               Admin login (not linked from public nav)
    (dashboard)/         Protected admin area (sidebar layout)
      dashboard/         Overview: stat cards, revenue/expense chart, recent activity
      enquiries/         Arena / Training / Machining / Contact management
      training/          Course CRUD, registrations
      machining/         Service CRUD, quotation requests + file downloads
      projects/          Project CRUD + image gallery uploads
      certificates/      Certificate issuance/management (CRUD)
      content/           Hero / Business info / About / Owner / FAQs (CMS)
      accounts/          Income, Expenses, Balance (charts), Partners (private!)
      settings/          Change password, add-admin instructions
  api/
    arena-enquiries, training-enquiries, contact-messages, machining-requests,
    certificates/verify        Public write/read endpoints (rate-limited, validated)
    admin/...                  Protected endpoints (session + defense-in-depth checks)
components/
  layout/     Navbar, Footer
  forms/      Public-facing forms (arena, training, contact, machining, certificate)
  admin/      Sidebar, generic EnquiryManager + CrudManager (reused across list pages)
  ui/         Container, SectionHeading, StatusBadge
lib/          prisma client, auth, validations (zod), rate-limit, file-storage,
              reference-number generator, settings (CMS key/value store), notify (stub)
prisma/       schema.prisma, seed.ts, migrations/
scripts/      create-admin.ts
proxy.ts      Route protection for /admin/* and /api/admin/* (Next.js 16's renamed "middleware")
```

---

## 2. Installation

```bash
npm install
cp .env.example .env
```

Edit `.env` — at minimum set a strong `SESSION_SECRET` (32+ random characters):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Database Setup

```bash
npm run db:migrate     # creates prisma/dev.db and applies the schema
npm run db:seed        # seeds a demo admin user, 4 partner slots, training courses,
                        # machining services, demo projects, a demo certificate, and FAQs
                        # (all demo records are prefixed "[DEMO]" and safe to delete)
```

The seed script prints the demo admin login it created:

```
Admin user ready: admin@example.com / ChangeMe123! (CHANGE THIS PASSWORD)
```

**Change this password immediately** via Admin → Settings after your first login, or create a
fresh admin and remove the seeded one (see [§7](#7-creating-admins)).

## 4. Run Locally

```bash
npm run dev
```

Visit:
- Public site: http://localhost:3000
- Admin login: http://localhost:3000/admin/login (not linked anywhere in the public nav)

## 5. Verify It Actually Works

- Submit an Arena Enquiry (`/arena`), Training Enquiry (`/training`), Contact message
  (`/contact`), and a Machining Quotation with a file (`/machining`) — each returns a reference
  number (e.g. `ARENA-2026-0001`) and appears in the matching Admin → Enquiries page.
- Look up certificate `RB-TRAIN-2026-00125` at `/certificate-verification` (seeded demo cert).
- Log into `/admin/login` with the seeded credentials, confirm the Dashboard shows real counts,
  and that `/admin/accounts/*` (financial data) is inaccessible without logging in.

## 6. Environment Variables

See `.env.example` for the full list with descriptions. Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma connection string (SQLite file by default) |
| `SESSION_SECRET` | Signs admin session JWTs — must be kept secret and be long/random |
| `NEXT_PUBLIC_SITE_URL` | Used in metadata, Open Graph, sitemap |
| `UPLOAD_DIR` | Where private CAD/design uploads are stored (outside `public/`) |
| `NOTIFY_EMAIL_*` / `NOTIFY_WHATSAPP_*` | Optional; see [§10](#10-wiring-up-notifications) |

## 7. Creating Admins

```bash
npm run create-admin -- "Full Name" "email@example.com" "StrongPassword123!" ADMIN
```

Role is one of `ADMIN`, `SUPER_ADMIN`, `STAFF`. Admins can also change their own password from
Admin → Settings.

## 8. Changing Business Information (Placeholders)

All public-facing placeholders (`[BUSINESS NAME]`, `[OWNER NAME]`, `[PHONE]`, `[EMAIL]`,
`[ADDRESS]`, `[WHATSAPP]`, `[GOOGLE MAPS URL]`, hero heading/subheading, about-us text, owner
bio/skills/achievements) are edited from **Admin → Website Content** — no code changes required.
They're stored as JSON in the `SiteSetting` table (`lib/settings.ts` has the defaults/shape).

## 9. Managing Content

- **Training courses**: Admin → Training → Courses (add/edit/delete; shown live on `/training`)
- **Machining services**: Admin → Machining → Services (CNC/VMC/3D Printing descriptions)
- **Projects**: Admin → Projects (add/edit/delete + upload gallery images per project)
- **Certificates**: Admin → Certificates (issue/revoke; publicly verifiable by Certificate ID)
- **FAQs**: Admin → Website Content → FAQs tab

## 10. Wiring Up Notifications

`lib/notify.ts` is a stub that currently just logs to the server console when a new enquiry
arrives. To wire up real email/WhatsApp notifications:

1. Set `NOTIFY_EMAIL_ENABLED=true` (or `NOTIFY_WHATSAPP_ENABLED=true`) in `.env`.
2. Add your provider's API key to `NOTIFY_EMAIL_PROVIDER_API_KEY` / `NOTIFY_WHATSAPP_PROVIDER_API_KEY`.
3. Implement the two `TODO`-marked provider calls inside `lib/notify.ts`.

## 11. Accounting: Income, Expenses, Balance

Admin → Accounts → Income / Expenses: add entries with date, amount, category/source, payment
method, reference number, and notes. **Admin → Accounts → Balance** shows:
`Current Balance = Total Income − Total Expenses`, with Revenue vs Expense, Net Balance trend,
Income/Expense-by-category charts, and a partner-withdrawals chart — filterable by This Month /
Last Month / This Year / Custom Range. All amounts are in ₹ (INR).

These pages, and their underlying `/api/admin/accounts/*` routes, are **never** linked from or
reachable by the public site, and every accounts API route re-checks the admin session itself
(defense in depth on top of route-level protection in `proxy.ts`).

## 12. Managing the 4 Partners

Admin → Accounts → Partners shows 4 fixed partner cards (seeded as "Partner 1"–"Partner 4" —
rename them via the pencil icon once you know the real names). Each card shows total withdrawn,
last transaction, and full history; "Add Transaction" records a new withdrawal
(date, amount, reason, payment method, reference, notes). Totals are computed automatically from
`PartnerTransaction` rows — never hardcoded.

## 13. Security Notes

- Passwords hashed with bcrypt (cost 12); sessions are signed JWTs in an httpOnly, `SameSite=Lax`
  cookie (`Secure` in production).
- `proxy.ts` (Next.js 16's renamed `middleware.ts`) blocks all `/admin/*` and `/api/admin/*`
  routes except `/admin/login` and its login API for anyone without a valid session.
- Every accounts (financial) API route independently re-verifies the session server-side.
- Login is rate-limited (5 attempts / 5 minutes per IP); public enquiry endpoints are rate-limited
  too.
- Uploaded CAD files are stored outside `public/` (`private-uploads/`, configurable via
  `UPLOAD_DIR`) and are served only via the authenticated `/api/admin/files/[id]` route — there is
  no predictable public URL for them. File type and size are validated server-side, not just in
  the browser.
- Project gallery images (meant to be public) are stored under `public/uploads/projects/`.
- All forms are validated both client-side (zod + react-hook-form) and server-side (the same zod
  schemas re-run in the API route) — never trust the client.
- No secrets are ever sent to the browser; `.env` holds `SESSION_SECRET`, notification provider
  keys, etc., all read only in server-side code.

## 14. Switching to PostgreSQL

1. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` in `.env` to your Postgres connection string.
3. Run `npm run db:migrate` again to create fresh migrations against Postgres (SQLite migrations
   aren't directly portable — this is expected for a provider switch).

## 15. Deployment

1. Provision a Postgres database (see §14) and a persistent volume/bucket for `UPLOAD_DIR` and
   `public/uploads` (a serverless platform's filesystem is ephemeral — swap `lib/file-storage.ts`
   for an S3/GCS-backed implementation before going to production on such a platform; the storage
   functions are already isolated behind that one module for exactly this reason).
2. Set all variables from `.env.example` in your hosting platform's environment settings.
3. `npm run build && npm run start`, or deploy to a Next.js-compatible host (Vercel, a Node
   server, Docker, etc.).
4. Run `npm run db:migrate` (or `prisma migrate deploy` in CI/CD) against the production database,
   then `npm run create-admin -- ...` to create your first real admin (skip `db:seed` in
   production — it's demo data).

## 16. Planned Extensibility (architected for, not built yet)

The codebase is structured so these can be added later without a rewrite: online payments,
WhatsApp/email notifications (stub already in `lib/notify.ts`), customer accounts, online
quotation approval, invoice/GST invoice generation, certificate PDF generation, paid training
registration, an arena booking calendar, machine availability, and inventory/employee management.
