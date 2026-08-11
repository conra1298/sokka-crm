# Sokka CRM — B2B Sales Management Platform

> A focused, reliable, production-ready alternative to HubSpot CRM designed for small B2B sales teams. Built with Next.js 15 App Router, TypeScript, PostgreSQL, Drizzle ORM, and the Sokka Estudio design system.

---

## Features & Capabilities

1. **Contacts & Companies**: Searchable directories, domain & email normalization (`johndoe@acme.com` matching), duplicate detection, and explicit side-by-side admin merge flow.
2. **Deal Pipeline**: Drag-and-drop pipeline board (`@dnd-kit`), stage totals, monetary values, expected close dates, and no-JS table fallback.
3. **Transactional Stage Move**: Single database transaction service that records old stage, new stage, actor, timestamp, and updates pipeline metrics only after commit. Reopening closed deals requires Manager or Admin authorization.
4. **Immutable Activity Timeline**: Append-only activity log for notes, calls, email summaries, stage changes, and merges. Explicit corrections create a new record pointing to the original with reason and timestamp.
5. **Tasks & Overdue Tracking**: Tasks assigned to users, linked to deals/contacts, with highlighted overdue views (`due_date < today AND !is_completed`).
6. **Metrics & Admin CSV Exports**: Dashboard pipeline value, stage conversion, win rate calculation, and role-authorized CSV export with audit logging.
7. **Email Inbound BCC Capture**: Deduplicates inbound emails by RFC Message-ID and automatically matches them to contact records.

---

## Prerequisites

- **Node.js**: `v20.0.0` or higher (Tested on `v24.14.1`)
- **Docker & Docker Compose**: For local PostgreSQL 16 and MinIO object storage
- **npm**: `v10.0.0` or higher

---

## Local Setup & Quickstart

### 1. Start Infrastructure Services
```bash
docker compose up -d
```
This starts:
- **PostgreSQL 16** on `localhost:5432` (`user: sokka`, `password: sokka`, `db: sokka_crm`)
- **MinIO S3 Storage** on `localhost:9000` (`user: minioadmin`, `password: minioadmin`)

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Generate & Run Database Migrations
```bash
npm run db:push
```
Or generate and apply migrations:
```bash
npm run db:generate
npm run db:migrate
```

### 4. Seed Representative Data
```bash
npm run db:seed
```
This provisions:
- **3 Seed Users** (Password for all: `sokka2024`):
  - Admin: `admin@sokka.com`
  - Manager: `manager@sokka.com`
  - Salesperson: `sales@sokka.com`
- **6 Pipeline Stages**: Lead → Qualified → Proposal → Negotiation → Closed Won / Closed Lost
- **10 Companies**, **20 Contacts** (including intentional duplicates), **8 Deals**, activities, and overdue tasks.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing

```bash
# Run unit & logic tests (Vitest)
npm run test:unit

# Run all test suites
npm test
```

---

## Environment Variables Reference

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://sokka:sokka@localhost:5432/sokka_crm` |
| `S3_ENDPOINT` | S3 API endpoint URL | `http://localhost:9000` |
| `S3_BUCKET` | S3 bucket name | `sokka-crm` |
| `S3_ACCESS_KEY` | S3 access key ID | `minioadmin` |
| `S3_SECRET_KEY` | S3 secret access key | `minioadmin` |
| `S3_REGION` | S3 region | `us-east-1` |
| `SESSION_SECRET` | Secret key for JWT cookie signing | `32+ char secret string` |
| `EMAIL_WEBHOOK_SECRET` | Inbound email webhook signature secret | `webhook secret` |

---

## Design System & Branding

Integrated with the **Sokka Estudio** design system tokens:
- **Primary Color**: `#274283` (Azul oscuro institucional)
- **Secondary Color**: `#5CB2D4` (Azul celeste)
- **Accent-1**: `#EDA143` (Dorado/Amarillo)
- **Accent-2**: `#EB7638` (Naranja CTAs)
- **Background**: `#F8FAFC`
- **Typography**: Display headlines in `Garet`, Body in `Outfit`
- **Shapes**: `rounded-full` buttons, `rounded-2xl` cards

---

## Security & Architecture Decisions

1. **Role Enforcement**: `requireAuth(role)` is evaluated on every Server Action and API Route Handler server-side, not merely hidden in UI components.
2. **Audit Logging**: Sensitive operations (CSV exports, contact merges, stage moves) create permanent records in `audit_log`.
3. **Immutability**: Activities cannot be updated or deleted; corrections append a new row referencing `correctsId`.
4. **Idempotency**: Inbound emails are deduplicated by `messageId`, CSV imports use `idempotencyKey`.

---

## Backup and Restore

### Backup Database
```bash
docker exec -t sokka_crm_postgres pg_dump -U sokka -d sokka_crm > backup.sql
```

### Restore Database
```bash
docker exec -i sokka_crm_postgres psql -U sokka -d sokka_crm < backup.sql
```
