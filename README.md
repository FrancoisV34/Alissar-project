# Practitioner website — showcase site with a self-service back office

Single-page website of an osteopathy practice, with a private back office that lets the practitioner edit every piece of content (opening hours, prices, texts, pictures, theme, SEO) without a developer.

**Production:** https://alissar-vitrine.fly.dev

## Stack

| Layer | Technology |
|---|---|
| Front-end | React 19, Vite 7, React Router 7, TanStack Query 5, Zustand, Mantine 8, SCSS |
| API | Node.js 22, Express 5, Zod (validation), Helmet (security headers), JWT + bcrypt |
| Data | SQLite (better-sqlite3), versioned SQL migrations |
| Hosting | Docker image on Fly.io (Paris region), persistent volume for the database and uploads |
| Quality | ESLint (+ jsx-a11y, security), Vitest, Supertest, Playwright, GitHub Actions |

Architecture, data model and design decisions are documented in [`docs/conception/`](docs/conception/DOSSIER_CONCEPTION.md).

## Getting started

Requirements: Node.js ≥ 22.

```bash
npm ci
cp .env.example .env          # then set JWT_SECRET (≥ 32 random characters)
npm run dev                   # API on :3001, Vite on :5173 (proxy /api → 3001)
```

On first start the database is created, migrated and seeded, and an admin account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (or a random password is printed once in the logs).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | API + front-end with hot reload |
| `npm run build` | Production build of the front-end into `dist/` |
| `npm start` | Production server (serves the API and `dist/`) |
| `npm run lint` | ESLint (accessibility and security rules included) |
| `npm run seed` | Reset the content tables with the default content |

## Project layout

```
server/
  app.js              Express app factory (middlewares, routes) — testable without listening
  index.js            Entry point: checks config, runs bootstrap, starts the server
  config/security.js  Content-Security-Policy and CORS allow-list
  db.js               SQLite connection and schema
  lib/                validation (Zod), sanitisation, CRUD router factory, SQL helpers
  middleware/         authentication (JWT + role), error handler
  routes/             public routes (/api/...) and admin routes (/api/admin/...)
src/
  Pages/              Home page, login, password change, admin dashboard
  Components/         Showcase sections, admin tabs, SafeHtml, ProtectedRoute
  hooks/              One TanStack Query hook per API resource
docs/                 Design, security audit, accessibility audit, tests
```

## Security

- Every `/api/admin/*` route goes through `authenticate` (JWT, account reloaded from the database) and `requireRole`.
- Every request body is validated with a Zod schema; SQL queries are parameterised; updatable columns come from an allow-list.
- Rich text is sanitised on write (sanitize-html) and on display (DOMPurify); a strict Content-Security-Policy blocks inline scripts.
- Uploaded files are identified by their binary signature (JPEG, PNG, WebP, GIF only) and served with a sandboxing CSP.

Details: [`docs/securite/AUDIT.md`](docs/securite/AUDIT.md).

## Environment variables

See [`.env.example`](.env.example). `JWT_SECRET` is mandatory: the server refuses to start without it.
