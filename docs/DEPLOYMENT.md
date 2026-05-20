# Deploying OXYGEN to Render (free tier)

This walks you through getting a live `https://...` URL for the backend and admin web in about 15 minutes. Total cost: **$0** for the demo. The Flutter mobile app is built locally and pointed at the deployed backend.

## What you'll have at the end

```
Backend (NestJS)        https://oxygen-backend.onrender.com
Admin web  (React SPA)  https://oxygen-admin.onrender.com
Postgres   (managed)    internal connection string, set automatically
Mobile app              built on your machine, points at backend URL
```

Demo OTP `123456` and admin login `admin@oxygen.local` / `Admin@123` work out of the box.

---

## Pre-requisites

1. A free GitHub account
2. A free Render account (https://render.com) — sign in with GitHub
3. (Optional, recommended) A free Neon account (https://neon.tech) for permanent Postgres — Render's free Postgres expires after 90 days

## Step 1 — Push the repo to GitHub

```bash
cd oxygen
git init -b main
git add .
git commit -m "chore: initial OXYGEN MVP scaffold"
gh repo create oxygen --private --source=. --remote=origin --push
# or, manually: create an empty private repo on github.com, then:
#   git remote add origin git@github.com:<you>/oxygen.git
#   git push -u origin main
```

## Step 2 — Deploy with the Render Blueprint

The repo includes `render.yaml` which provisions all three services in one shot.

1. In Render, click **New ▸ Blueprint**.
2. Connect the `oxygen` repo.
3. Render reads `render.yaml`, shows you the plan, and click **Apply**.
4. Render now creates:
   - `oxygen-backend` (Docker web service, free)
   - `oxygen-admin` (static site, free)
   - `oxygen-db` (Postgres, free for 90 days)
5. First deploy takes ~5-7 minutes. Watch logs in the dashboard.

**Once backend deploy succeeds**, copy its URL (e.g. `https://oxygen-backend.onrender.com`).

## Step 3 — Wire backend ↔ admin

The blueprint already sets `VITE_API_BASE_URL` on the admin to point at the backend. You just need to fill in CORS the other way:

1. Open the **oxygen-backend** service in Render ▸ **Environment** tab.
2. Edit `ADMIN_WEB_ORIGIN` and paste your admin URL: `https://oxygen-admin.onrender.com` (no trailing slash).
3. Save. The backend will redeploy in ~30 seconds.

## Step 4 — Smoke-test the live URLs

```bash
# Health check
curl https://oxygen-backend.onrender.com/health
# -> {"status":"ok","service":"oxygen-backend",...}

# Send OTP (printed to backend logs in dev mode)
curl -X POST https://oxygen-backend.onrender.com/api/auth/otp/send \
  -H 'content-type: application/json' \
  -d '{"phone":"+919876543210"}'
# -> {"requestId":"...","expiresInSeconds":300}

# Verify (OTP_DEV_FIXED is "123456" by default in render.yaml)
curl -X POST https://oxygen-backend.onrender.com/api/auth/otp/verify \
  -H 'content-type: application/json' \
  -d '{"requestId":"<id>","phone":"+919876543210","otp":"123456"}'
```

Open the admin in your browser and log in:

- URL: `https://oxygen-admin.onrender.com/login`
- Email: `admin@oxygen.local`
- Password: `Admin@123`

(The seed runs on every deploy via `start-prod.sh` and is idempotent.)

## Step 5 — Point the mobile app at the live backend

```bash
cd mobile
flutter pub get
flutter run --dart-define=MOBILE_API_BASE_URL=https://oxygen-backend.onrender.com
```

That's it. You now have a live OXYGEN demo end-to-end.

---

## Optional: switch from Render Postgres to Neon

Render's free Postgres expires 90 days after creation. For a permanent free Postgres:

1. Sign up at https://neon.tech, create a project named `oxygen` in **Singapore** (closest to India users).
2. From the project dashboard, copy the **Connection string (direct, with password)** — it looks like `postgresql://user:pass@ep-...neon.tech/oxygen?sslmode=require`.
3. In Render ▸ `oxygen-backend` ▸ Environment ▸ edit `DATABASE_URL` ▸ paste the Neon URL ▸ save.
4. Delete the `oxygen-db` block from `render.yaml`, commit, push.
5. In Render dashboard, delete the now-orphaned `oxygen-db` Postgres instance.

The next deploy applies migrations to the new Neon DB and seeds the admin.

---

## Going beyond demo (before real users)

Before exposing this to real customers, do all of:

1. **Remove `OTP_DEV_FIXED`** from the backend env. Wire `src/auth/otp.service.ts` ▸ `sendSms()` to MSG91/Gupshup.
2. **Rotate `JWT_*` and `PII_ENCRYPTION_KEY`** secrets. Render generated random ones; that's fine, but if the repo is shared, regenerate via dashboard.
3. **Change the seeded admin password.** Either set `ADMIN_SEED_PASSWORD` env before first deploy, or log in once and change via DB (`PATCH` admin row directly until Sprint 7 adds an admin password-reset flow).
4. **Move off Render free tier:** free web services sleep after 15 min idle (~30 s cold start). Upgrade `oxygen-backend` to Starter ($7/mo) for always-on.
5. **Run VAPT** with a CERT-In empanelled auditor before any real PAN/Aadhaar lands in the DB.
6. **Replace mock KYC vendor** in `KYC_VENDOR=mock` with `digio` / `idfy` / `hyperverge` (see `backend/src/kyc/vendors/`).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|--------|--------------|-----|
| Backend `prisma migrate deploy` fails on first boot | DB still provisioning | Wait 60 s, manual redeploy from dashboard |
| Admin login returns CORS error | `ADMIN_WEB_ORIGIN` missing or wrong | Set it on backend (Step 3) |
| Mobile app shows network error | Backend asleep (free tier) | First request takes 30 s; retry |
| `Error: PrismaClientInitializationError ... linux-musl` | Stale Prisma client | Trigger a fresh deploy (it runs `prisma generate` for `linux-musl-openssl-3.0.x`) |
| Selfie upload returns 413 | nginx proxy at Render | Files > 2 MB are blocked anyway by app rule; resize on client |
| Admin can't see new users | TanStack cache | Hard-refresh; we don't poll yet (Sprint 3 adds SSE) |

## Alternative hosts

The same Dockerfile works on:

- **Fly.io** — `fly launch` from `backend/`, attach a Fly Postgres
- **Railway** — connect repo, set env vars, attach Postgres add-on
- **AWS App Runner** — point at the Dockerfile
- **Google Cloud Run** — `gcloud run deploy` from `backend/`

The admin (static SPA) deploys to **Vercel**, **Netlify**, **Cloudflare Pages** without changes — just set `VITE_API_BASE_URL` in their build env vars.
