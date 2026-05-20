# OXYGEN Backend

NestJS + TypeScript + Prisma + PostgreSQL.

## Run locally

```bash
docker compose up -d         # from repo root
cp ../.env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

API: `http://localhost:3000/api`
Health: `http://localhost:3000/health`

## Smoke test

```bash
# 1. Send OTP
curl -sX POST http://localhost:3000/api/auth/otp/send \
  -H 'content-type: application/json' \
  -d '{"phone":"+919876543210"}'
# -> { "requestId": "...", "expiresInSeconds": 300 }
# OTP is printed in backend logs (dev only): 123456

# 2. Verify OTP
curl -sX POST http://localhost:3000/api/auth/otp/verify \
  -H 'content-type: application/json' \
  -d '{"requestId":"<id>","phone":"+919876543210","otp":"123456"}'
# -> { "accessToken": "...", "refreshToken": "...", "user": {...} }

# 3. Get profile
curl -s http://localhost:3000/api/users/me -H "authorization: Bearer <accessToken>"

# 4. Submit PAN
curl -sX POST http://localhost:3000/api/kyc/pan \
  -H "authorization: Bearer <accessToken>" \
  -H 'content-type: application/json' \
  -d '{"panNumber":"ABCDE1234F","nameAsPerPan":"SIMBU R"}'

# 5. Admin login (use seeded admin)
curl -sX POST http://localhost:3000/api/auth/admin/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@oxygen.local","password":"Admin@123"}'

# 6. Admin: list pending KYC
curl -s "http://localhost:3000/api/admin/users?status=SUBMITTED" \
  -H "authorization: Bearer <adminAccessToken>"
```

## Module map

```
src/
├── main.ts                 bootstrap, global pipes, helmet, CORS
├── app.module.ts           wires all feature modules + throttler
├── health.controller.ts    public GET /health
├── config/                 env validation (class-validator)
├── common/                 CryptoService (AES-256-GCM), TraceIdMiddleware, HttpExceptionFilter
├── database/               PrismaService (global)
├── audit-log/              AuditLogService — every privileged action logged
├── auth/
│   ├── otp.service.ts      OTP issue + verify (dev OTP via env)
│   ├── token.service.ts    JWT pair issue + rotate + revoke
│   ├── auth.service.ts     mobile user OTP flow
│   ├── admin-auth.service  admin email/password flow
│   ├── strategies/         passport-jwt strategies (user + admin)
│   ├── guards/             JwtUserGuard, JwtAdminGuard, AdminRolesGuard
│   └── decorators/         @CurrentUser
├── users/
│   ├── users.service.ts    profile CRUD
│   ├── users.controller    GET/PATCH /users/me
│   └── admin-users         GET /admin/users, /admin/users/:id
└── kyc/
    ├── kyc.service.ts      PAN + Aadhaar + Selfie + status recompute
    ├── kyc.controller      mobile-facing endpoints
    ├── admin-kyc           admin approve/reject
    └── vendors/
        ├── kyc-vendor.interface   vendor adapter contract
        └── mock-kyc.vendor        dev/test stand-in
```

## Adding a new KYC vendor

1. Create `src/kyc/vendors/digio-kyc.vendor.ts` implementing `KycVendor`.
2. Register in `kyc.module.ts` factory:
   ```ts
   case 'digio': return new DigioKycVendor(config);
   ```
3. Set `KYC_VENDOR=digio` and `KYC_VENDOR_API_KEY=...` in env.
4. No business logic changes anywhere else.

## What's intentionally missing (Sprint 3+)

- Loan engine (`src/loans/`)
- Risk rules engine (`src/risk/`)
- Bureau + statement analyzer adapters (`src/integrations/`)
- eSign + NACH/UPI mandate (`src/payments/`)
- CUT-I orchestrator (`src/cut/`)
