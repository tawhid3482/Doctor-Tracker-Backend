# Doctor Tracker API

Standalone Express and Prisma backend for Doctor Tracker. This folder is its own repository root and can be cloned, installed, configured, and run without the frontend source being present.

## Requirements

- Node.js 20 or newer
- MongoDB connection string (MongoDB replica set recommended for Prisma transaction support)

## Local setup

```sh
npm install
```

Copy `.env.example` to `.env` and set values for MongoDB, the allowed browser origin, two independent JWT signing secrets, and the initial administrator account. Generate secrets with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run these commands from this directory:

```sh
npm run db:generate
npm run db:push
npm run dev
```

The API connects to MongoDB and checks for an administrator before listening on `http://localhost:4000`. If no admin exists, it creates the first one from `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. If an admin already exists, startup leaves the account unchanged. `npm run seed` runs the same safe, one-time check manually when needed. No public registration route is provided.

## Module layout

Each feature keeps HTTP routes, controllers, business/data services, and Zod validation together:

```text
src/modules/auth/       auth.router.ts, auth.controller.ts, auth.service.ts, auth.validation.ts
src/modules/doctors/    doctors.router.ts, doctors.controller.ts, doctors.service.ts, doctors.validation.ts
src/modules/patients/   patients.router.ts, patients.controller.ts, patients.service.ts, patients.validation.ts
src/modules/dashboard/ dashboard.router.ts, dashboard.controller.ts, dashboard.service.ts, dashboard.validation.ts
```

`app.ts` mounts the feature routers; shared middleware, database setup, response helpers, and errors remain in `src/middleware`, `src/config`, and `src/utils`.

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Start the API in watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled API |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Apply the Prisma schema to MongoDB |
| `npm run seed` | Create the configured admin only when no admin exists |
| `npm test` | Run admin bootstrap, auth, and request validation tests |

## Configuration

| Variable | Description |
| --- | --- |
| `PORT` | API port, default `4000` |
| `DATABASE_URL` | MongoDB connection string |
| `CLIENT_ORIGIN` | Exact frontend origin allowed by CORS |
| `JWT_ACCESS_SECRET` | Access-token signing secret, 32+ characters |
| `JWT_REFRESH_SECRET` | Separate refresh-token signing secret, 32+ characters |
| `ACCESS_TOKEN_TTL` | Access token lifetime, default `15m` |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime, default `7d` |
| `ADMIN_NAME` | Seed administrator name |
| `ADMIN_EMAIL` | Seed administrator email |
| `ADMIN_PASSWORD` | Seed administrator password, at least 12 characters |

## API

All routes are prefixed with `/api/v1`. Auth endpoints are `/auth/login`, `/auth/refresh`, `/auth/logout`, and `/auth/me`. Protected resources include `/doctors`, `/patients`, and `/dashboard/overview`, `/dashboard/patient-trends`, `/dashboard/doctor-statistics`, and `/dashboard/condition-statistics`.

The API uses HTTP-only cookies and checks the browser `Origin` on state-changing requests. Cookies use `SameSite=Lax` in development and `SameSite=None; Secure` in production so separately hosted frontend/backend origins can authenticate. In production, serve over HTTPS, use separate strong signing keys, restrict MongoDB network access, and set `CLIENT_ORIGIN` to the exact frontend origin.

## System architecture

The frontend and API are independent applications and can live in separate repositories. A browser page uses TanStack Query to call the Express REST API with credentialed requests. Express applies security headers, rate limits, origin checks, JSON limits, and cookie parsing before it mounts feature routers. Authentication uses short-lived access and refresh JWTs in HTTP-only cookies. Feature routers call validated controllers and services; services query MongoDB through Prisma. On server startup Prisma connects first, then the one-time administrator bootstrap runs before the API starts accepting requests.

```text
Browser (Next.js + TanStack Query)
  └─ REST + HTTP-only cookies → Express API (/api/v1)
       ├─ Auth / Doctors / Patients / Dashboard modules
       ├─ validation → controllers → services
       └─ Prisma → MongoDB
```

## Technical decisions

1. **Separate client and server repositories.** The UI and API have independent package manifests, lockfiles, environment files, and setup guides. This lets teams deploy them independently and keeps frontend builds from depending on backend source. The tradeoff is that CORS, cookie settings, and API URLs must agree across deployments.
2. **Prisma with MongoDB and HTTP-only JWT cookies.** Prisma provides typed data access and the schema declares indexes for doctor, condition, gender, and creation-date queries. Dashboard summaries use grouped/aggregate queries instead of loading every record. JWTs stay out of browser storage; the API validates cookies and checks the configured origin on writes. MongoDB must be reachable and Prisma Client generated before the API can run.

## Visual evidence

Desktop and mobile screenshots are not checked in yet. Capture the real dashboard, doctor list/profile, and patient list at desktop and narrow viewport sizes after starting both apps with a development MongoDB database containing sample records. Do not use fabricated production statistics.
