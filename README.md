# OXYGEN Fintech — Monorepo

Lending platform for India. Phase 1 MVP scope: Personal, Medical, Emergency loans + CUT-I (Loan Takeover).

This scaffold delivers **Sprint 1 + Sprint 2** of the 16-week MVP plan: foundations, auth, onboarding, and KYC, end-to-end across mobile, admin web, and backend.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

For a live demo URL in ~15 min, see **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)**.

## What's in here

```
oxygen/
├── backend/        NestJS + TypeScript + Prisma + PostgreSQL
├── admin-web/      React + Vite + TypeScript + Tailwind
├── mobile/         Flutter (Android + iOS)
├── docs/           Architecture, API contracts, sprint plan
├── docker-compose.yml   Postgres + Redis for local dev
└── .github/workflows/   CI for backend + admin
```

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 20 |
| npm | >= 10 |
| Docker + Docker Compose | latest |
| Flutter | >= 3.22 |
| PostgreSQL | 16 (via Docker) |

## Quick start (local dev)

```bash
# 1. Start Postgres + Redis
docker compose up -d

# 2. Backend
cd backend
cp ../.env.example .env
npm install
npx prisma migrate dev --name init
npm run seed              # creates a demo admin
npm run start:dev         # http://localhost:3000

# 3. Admin web (new terminal)
cd admin-web
npm install
npm run dev               # http://localhost:5173

# 4. Mobile (new terminal)
cd mobile
flutter pub get
flutter run               # pick Android emulator or iOS simulator
```

## Default credentials (dev only)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@oxygen.local | Admin@123 |

OTP for any phone in dev mode: **123456** (printed to backend logs).

## What's implemented (Sprint 1 + 2 done)

**Backend**
- Mobile OTP auth with JWT (access + refresh)
- Admin email/password auth
- User profile API
- KYC submission endpoints (PAN, Aadhaar, selfie)
- Audit log for every privileged action
- Rate limiting, helmet, CORS, request validation, global error filter
- Prisma migrations & seed
- Mock KYC vendor service (swap with Digio/IDfy in Sprint 3)

**Admin Web**
- Email/password login
- Dashboard with KPI cards
- User list with KYC status filter
- KYC verification queue with approve/reject + document viewer

**Mobile**
- Splash → phone entry → OTP verify
- Profile setup (name, email, DOB)
- KYC capture: PAN, Aadhaar, selfie
- Dashboard placeholder (loan products list — Sprint 3)
- Persistent auth via secure storage

## What's NOT yet implemented (next sprints)

- Loan application engine (Sprint 3)
- Bureau pull + bank statement analyzer (Sprint 3)
- eSign + NACH/UPI mandate (Sprint 4)
- Disbursement orchestration (Sprint 4)
- CUT-I (Sprint 6)
- VAPT hardening (Sprint 7)

See [`docs/sprint-plan.md`](docs/sprint-plan.md).

## Tech decisions

- **Modular monolith**, not microservices — faster to ship MVP, refactor later
- **Prisma** over TypeORM — simpler migrations, generated types
- **Mock vendor adapter pattern** — every external API (KYC, bureau, payments) goes through an `IVendorAdapter` interface so we can swap implementations without touching business logic
- **Audit log on every state change** — DPDP/RBI compliance from Day 1
- **JWT with short TTL + refresh** — access 15 min, refresh 7 days

## Compliance baked in

- All PII fields encrypted at rest (AES-256-GCM via `@common/crypto.service`)
- PII redacted in logs
- Audit log is append-only
- Consent capture before KYC

## Project conventions

- Conventional commits (`feat:`, `fix:`, `chore:`)
- Branches: `feature/<ticket>-short-name`
- PR template: see `.github/pull_request_template.md`
- Code style: Prettier + ESLint (backend, admin), `flutter analyze` (mobile)

## License

Proprietary — © OXYGEN Fintech Pvt Ltd
