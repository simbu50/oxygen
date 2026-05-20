# OXYGEN Admin Web

React + Vite + TypeScript + Tailwind. Connects to `oxygen-backend`.

```bash
cp ../.env.example .env
npm install
npm run dev    # http://localhost:5173
```

Login: `admin@oxygen.local` / `Admin@123` (seeded in the backend).

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | LoginPage | Email + password auth |
| `/` | DashboardPage | KPI cards (counts by KYC status) |
| `/users` | UsersPage | Paginated users list filtered by KYC status |
| `/users/:id` | UserDetailPage | Document list + Approve / Reject |

## Auth

`useAuthStore` (Zustand) persists `accessToken`, `refreshToken`, and `admin` to
localStorage. Axios interceptor injects the bearer header, and on 401 clears the
session and redirects to `/login`.
