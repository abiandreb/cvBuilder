# CV Builder

## Overview

CV Builder is a full-stack web application that lets users create, edit, and manage professional CVs through a guided step-by-step wizard. Users register an account, fill in their personal details, work experience, education, and skills across six wizard steps, choose one of five visual templates, and save their CVs to a PostgreSQL database. From the dashboard they can rename CVs, switch templates, export to PDF, request an AI-powered translation into Ukrainian, German, or Polish, and delete CVs. Sessions are persisted via a JWT stored in localStorage, so refreshing the page keeps the user logged in.

---

## Screenshots

| Landing Page | Auth Page |
|:---:|:---:|
| ![Landing](docs/screenshots/landing.png) | ![Auth](docs/screenshots/auth.png) |

| CV Editor (Wizard) | Preview & Template Switcher |
|:---:|:---:|
| ![Editor](docs/screenshots/editor.png) | ![Preview](docs/screenshots/preview.png) |

| Dashboard |
|:---:|
| ![Dashboard](docs/screenshots/dashboard.png) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│                                                         │
│   React 19 + Vite          http://localhost:5173        │
│   ┌─────────────┐                                       │
│   │  AuthContext│  JWT in localStorage (cv_token)       │
│   │  CvContext  │                                       │
│   └──────┬──────┘                                       │
│          │  fetch() with Authorization: Bearer <token>  │
└──────────┼──────────────────────────────────────────────┘
           │  HTTP/JSON  (CORS allowed by middleware.ts)
           ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 API  (cv-api/)                  │
│                                                         │
│   http://localhost:3001                                 │
│   ┌──────────────────────────────────────────┐          │
│   │  /api/auth/register  POST                │          │
│   │  /api/auth/login     POST                │          │
│   │  /api/auth/me        GET                 │          │
│   │  /api/cvs            GET / POST          │          │
│   │  /api/cvs/[id]       GET / PATCH / DELETE│          │
│   │  /api/translate      POST                │          │
│   └──────────────┬───────────────────────────┘          │
│                  │  Prisma v7 + @prisma/adapter-pg       │
└──────────────────┼──────────────────────────────────────┘
                   │  TCP :5432
                   ▼
┌─────────────────────────────────────────────────────────┐
│         PostgreSQL 16  (Docker container)               │
│                                                         │
│   database: cvbuilder                                   │
│   tables:   User, Cv                                    │
└─────────────────────────────────────────────────────────┘
```

**Two-folder layout:**

| Folder | Role |
|--------|------|
| `react/` | Vite + React 19 SPA — all UI, routing, state management |
| `cv-api/` | Next.js 16 app used exclusively as a REST API server (no pages, no SSR) |

The split keeps concerns cleanly separated: the frontend can be deployed to any static host (Vercel, Netlify, S3) while the backend is a standalone Node.js service.

---

## Tech Stack

| Layer | Technology | Version | Why chosen |
|-------|-----------|---------|------------|
| Frontend framework | React | 19.2.4 | Industry-standard component model; concurrent features available |
| Frontend build tool | Vite | (latest in react/) | Extremely fast HMR and dev server; native ESM |
| Backend framework | Next.js | 16.2.1 | Route Handlers give a clean, file-based REST API with zero Express boilerplate; edge-ready |
| ORM | Prisma | 7.5.0 | Type-safe queries, migrations, schema-first workflow |
| Database driver adapter | @prisma/adapter-pg | 7.5.0 | Required by Prisma v7 to connect via the `pg` driver when no `url` field is in schema |
| Database | PostgreSQL | 16 (Docker) | Robust relational DB with JSON column support for flexible CV data |
| Auth tokens | jose | 6.2.2 | Web-standard JOSE implementation; fully async; works in Edge Runtime |
| Password hashing | bcryptjs | 3.0.3 | Pure-JS bcrypt — no native module compilation needed; portable |
| PDF export | @react-pdf/renderer | latest | Renders all 5 CV templates as native PDF primitives — real selectable text, crisp fonts, natural page breaks |
| Containerisation | Docker | Desktop | One-command PostgreSQL setup; no local Postgres installation required |

---

## Project Structure

```
~/
├── README.md              ← this file
├── README.uk.md           ← Ukrainian version
│
├── react/                 ← Vite + React frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                    ← root component, page routing, wizard state
│       ├── App.css
│       ├── main.jsx
│       ├── context/
│       │   ├── AuthContext.jsx        ← user auth state + login/register/logout
│       │   └── CvContext.jsx          ← CV list state + CRUD actions
│       ├── pages/
│       │   ├── AuthPage.jsx           ← login / register form
│       │   └── DashboardPage.jsx      ← CV grid + translate modal trigger
│       ├── components/
│       │   ├── CvCard.jsx             ← dashboard card with rename, design, translate, PDF, delete
│       │   ├── CvPreview.jsx          ← live CV renderer (used in wizard and cards)
│       │   ├── CvPdf.jsx              ← all 5 CV templates as react-pdf Document components
│       │   ├── TranslateModal.jsx     ← language picker + translation trigger
│       │   └── WizardSteps.jsx        ← Personal/Summary/Experience/Education/Skills/Final steps
│       └── utils/
│           ├── api.js                 ← all fetch() calls to cv-api
│           ├── translate.js           ← thin wrapper calling api.translate()
│           └── exportPdf.jsx          ← calls @react-pdf/renderer pdf().toBlob() and triggers download
│
└── cv-api/                ← Next.js API-only backend
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── middleware.ts              ← global CORS headers for /api/*
    ├── .env                       ← DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
    ├── prisma/
    │   ├── schema.prisma          ← User + Cv models
    │   └── migrations/
    ├── lib/
    │   ├── prisma.ts              ← singleton PrismaClient with driver adapter
    │   └── auth.ts                ← signJwt / verifyJwt via jose
    └── app/
        ├── generated/prisma/      ← auto-generated Prisma client
        └── api/
            ├── auth/
            │   ├── register/route.ts
            │   ├── login/route.ts
            │   └── me/route.ts
            ├── cvs/
            │   ├── route.ts       ← GET list, POST create
            │   └── [id]/route.ts  ← GET one, PATCH update, DELETE
            └── translate/
                └── route.ts       ← AI translation via Google Gemini 2.0 Flash
```

---

## Features

| Feature | Description |
|---------|-------------|
| Landing page | Marketing page with live previews of three templates |
| Registration & login | Email/password auth with client-side and server-side validation |
| Session persistence | JWT stored in localStorage; verified against API on every page load |
| CV wizard | Six-step guided form: Personal info, Summary, Experience, Education, Skills, Preview |
| Live preview | CV renders in real-time alongside the form in the wizard sidebar |
| Five templates | Classic, Modern, Minimal, Executive, Vibrant — switchable at any time |
| Save & edit CVs | CVs are stored in PostgreSQL; editable at any time from the dashboard |
| Inline rename | Double-click a CV card name to rename it in place |
| Template switcher | "Design" dropdown on each card changes the template and persists it |
| PDF export | `@react-pdf/renderer` generates real PDFs from native primitives — selectable text, crisp fonts, natural page breaks between entries |
| AI translation | Sends CV data to `/api/translate`; creates a translated copy with a language badge |
| Delete with confirm | Confirmation dialog before permanent deletion |
| Responsive dashboard | CSS grid card layout adapts to viewport width |

---

## How to Run

### Prerequisites

- Node.js 18 or later
- Docker Desktop (for PostgreSQL)

### Step 1 — Start PostgreSQL

```bash
docker run -d --name cvbuilder-pg \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cvbuilder \
  -p 5432:5432 \
  postgres:16
```

### Step 2 — Set up the backend

```bash
cd cv-api
npm install
npx prisma migrate dev --name init
npm run dev
```

→ API runs on http://localhost:3001

### Step 3 — Start the frontend

```bash
cd react
npm install
npm run dev
```

→ App runs on http://localhost:5173

### Environment Variables

**`cv-api/.env`**

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/cvbuilder` | PostgreSQL connection string used by `@prisma/adapter-pg` |
| `JWT_SECRET` | *(required, no default)* | Secret key used to sign and verify HS256 JWTs; set any long random string |
| `GEMINI_API_KEY` | *(required for translation)* | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) |

**`react/.env`** (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Base URL of the cv-api backend; override for staging/production deployments |

---

## API Reference

| Method | Path | Auth required | Request body | Description |
|--------|------|---------------|--------------|-------------|
| `POST` | `/api/auth/register` | No | `{ name, email, password }` | Create a new user; returns `{ token, user }` |
| `POST` | `/api/auth/login` | No | `{ email, password }` | Authenticate; returns `{ token, user }` |
| `GET` | `/api/auth/me` | Yes | — | Validate token; returns `{ user }` |
| `GET` | `/api/cvs` | Yes | — | List all CVs for the authenticated user, ordered by `updatedAt` desc |
| `POST` | `/api/cvs` | Yes | `{ name, template, data, language, isTranslation, originalCvId }` | Create a new CV; returns the created record with status 201 |
| `GET` | `/api/cvs/:id` | Yes | — | Fetch a single CV by ID (403 if not owner) |
| `PATCH` | `/api/cvs/:id` | Yes | Any subset of `{ name, template, data, language, isTranslation }` | Partially update a CV; returns the updated record |
| `DELETE` | `/api/cvs/:id` | Yes | — | Delete a CV; returns 204 No Content |
| `POST` | `/api/translate` | Yes | `{ cvData, targetLang }` | Translate CV data to `targetLang` via Google Gemini 2.0 Flash; returns translated `cvData` |

All authenticated requests must include `Authorization: Bearer <token>` in the request header.

---

## Database Schema

### User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `@default(cuid())` | Collision-resistant unique identifier |
| `name` | `String` | required | Display name |
| `email` | `String` | `@unique` | Login identifier |
| `password` | `String` | required | bcrypt hash (cost factor 10) |
| `createdAt` | `DateTime` | `@default(now())` | Account creation timestamp |
| `cvs` | `Cv[]` | relation | All CVs belonging to this user |

### Cv

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `@default(cuid())` | Collision-resistant unique identifier |
| `userId` | `String` | FK → User.id | Owner reference |
| `name` | `String` | required | Human-readable CV name |
| `template` | `String` | `@default("classic")` | Template key: classic / modern / minimal / executive / vibrant |
| `data` | `Json` | required | All CV content: personal, summary, experience, education, skills |
| `language` | `String` | `@default("en")` | ISO 639-1 language code |
| `isTranslation` | `Boolean` | `@default(false)` | True for CVs created by the translate feature |
| `originalCvId` | `String?` | nullable | ID of the source CV this was translated from |
| `createdAt` | `DateTime` | `@default(now())` | Record creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated on every write |

The `Cv.user` relation uses `onDelete: Cascade`, so deleting a user automatically removes all their CVs.

---

## Security Notes

### What is production-ready

- Passwords are hashed with bcrypt (cost factor 10) — never stored in plain text.
- JWTs are signed with HS256 and expire after 1 hour.
- Every protected endpoint verifies the token before touching the database.
- Ownership is checked on every CV endpoint (403 Forbidden if `cv.userId !== userId`).
- CORS headers are set to the request's `Origin` value rather than a wildcard, enabling credentials to be scoped correctly once cookies are added.

### What is demo-only and must be changed for production

| Issue | Risk | Fix |
|-------|------|-----|
| JWT stored in `localStorage` | Vulnerable to XSS — any injected script can read the token | Move to `httpOnly`, `Secure`, `SameSite=Strict` cookie |
| No refresh tokens | Token cannot be revoked; stolen token valid for full 1 h | Add refresh token rotation + token revocation table |
| No rate limiting | Brute-force on `/api/auth/login` is trivial | Add `express-rate-limit` or Next.js middleware rate limiter |
| CORS origin reflects request origin | Any site can call the API | Restrict to a specific allowlist of origins |
| No input length limits | Oversized JSON payloads can strain DB | Validate and cap field lengths server-side |
| Base64 photo in `data` JSON | Large base64 strings bloat the DB row | Store photos in object storage (S3, R2); save URL only |

---

## Architecture Decisions (Q&A)

**1. Why Next.js for an API-only backend instead of Express?**

Next.js Route Handlers (the `route.ts` files inside `app/api/`) provide a file-based REST API with zero boilerplate configuration. Each handler is a plain async function that receives a `NextRequest` and returns a `NextResponse`, which is identical to the Fetch API — meaning the same code runs on Node.js, Vercel Edge, and Cloudflare Workers without changes. Express would require setting up body-parser, CORS middleware, error handling, and a module bundler separately. Next.js also ships TypeScript support out of the box, which matters for Prisma's generated types. The trade-off is a larger dependency footprint (React is bundled even though it is not used), but for a project of this size the developer-experience gains outweigh the cost.

**2. Why is there no `url` field in `schema.prisma` (Prisma v7 change)?**

Starting with Prisma v7, when you use a driver adapter the database connection is managed entirely by the adapter (in this case `@prisma/adapter-pg`), not by the Prisma engine's built-in connection pool. Because the adapter receives the connection string directly via `new PrismaPg({ connectionString: process.env.DATABASE_URL })`, the `datasource db { url = ... }` field in `schema.prisma` is no longer required — Prisma reads it from the adapter at runtime. Omitting it also prevents confusion: there is only one place (`lib/prisma.ts`) where the connection string is consumed. This is a deliberate breaking change in Prisma v7 to make the driver-adapter path the canonical approach.

**3. What is a driver adapter in Prisma v7 and why is it needed?**

In older versions of Prisma, the Rust-based query engine managed its own database connections using libpq (for PostgreSQL). A driver adapter replaces that Rust layer with a JavaScript/TypeScript database driver — in this project, the `pg` npm package. `@prisma/adapter-pg` implements the adapter interface, translating Prisma's internal SQL into calls to `pg.Pool`. This means the entire Prisma stack is now pure JavaScript, which is required to run in environments that do not support native binaries (Vercel Edge Functions, Cloudflare Workers, Deno). It also enables connection pooling strategies (e.g., PgBouncer, Neon serverless) to be managed at the driver level rather than inside Prisma.

**4. Why use `jose` instead of `jsonwebtoken`?**

The `jsonwebtoken` library is synchronous and relies on Node.js's `crypto` module — it does not work in Edge Runtime or Web Crypto environments. `jose` is built entirely on the Web Crypto API (`SubtleCrypto`), which means it is fully async and runs in any JavaScript environment: Node.js, Deno, Cloudflare Workers, browser, and Vercel Edge Functions. Since this project uses Next.js middleware (which runs on Edge by default), `jose` is the correct choice. The API is also more explicit: `new SignJWT(payload).setProtectedHeader(...).setExpirationTime(...).sign(secret)` clearly separates each step, making it easier to audit.

**5. Why use `bcryptjs` instead of native `bcrypt`?**

The native `bcrypt` package is a Node.js addon that must be compiled from C++ source during `npm install`. This compilation requires `node-gyp`, Python, and platform-specific build tools, which frequently breaks on Windows or in CI environments without those tools installed. `bcryptjs` is a pure-JavaScript reimplementation of the same bcrypt algorithm — no compilation, no native dependencies, identical output. The security properties are the same; the only trade-off is speed, which does not matter here because bcrypt's cost is intentionally high (factor 10 means ~100 ms per hash on commodity hardware).

**6. Why is the PrismaClient a singleton? What happens without it?**

`lib/prisma.ts` stores the client on the `global` object and reuses it on subsequent imports. Without this pattern, Next.js's hot-module reload in development would re-execute the module on every file change, creating a new `PrismaClient` instance — and therefore a new connection pool — each time. PostgreSQL has a maximum `max_connections` limit (typically 100 on a default install). After dozens of reloads the server would exhaust available connections and throw "too many clients" errors. The singleton guarantees that only one pool exists for the lifetime of the process. In production this is less of an issue because modules are loaded once, but the pattern is still correct practice.

**7. Why store JWT in localStorage instead of an httpOnly cookie? What are the trade-offs?**

Storing in `localStorage` is simpler to implement for a same-origin SPA: `localStorage.setItem('cv_token', token)` and then reading it on every request requires no server-side cookie configuration. The downside is that `localStorage` is accessible to any JavaScript running on the page, making it vulnerable to Cross-Site Scripting (XSS) attacks — a successful XSS exploit can exfiltrate the token. An `httpOnly` cookie cannot be read by JavaScript at all, eliminating this attack vector entirely. For a production application the correct approach is an `httpOnly`, `Secure`, `SameSite=Strict` cookie combined with CSRF protection. The current implementation is acceptable for a demo/portfolio project where XSS is not a realistic threat.

**8. How does CORS work in this app? Explain the OPTIONS preflight.**

The browser enforces the Same-Origin Policy: a page on `localhost:5173` is not allowed to read responses from `localhost:3001` unless the server explicitly permits it. For "non-simple" requests (those with an `Authorization` header or a JSON body), the browser first sends a preflight `OPTIONS` request to the same endpoint asking: "are you willing to accept this method and these headers from this origin?" `middleware.ts` handles this by returning a `204 No Content` response with `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers` headers, granting permission. The middleware runs on all paths matching `/api/:path*`. For non-OPTIONS requests, it simply appends the `Access-Control-Allow-Origin` header to whatever the route handler returns, allowing the browser to expose the response to the calling JavaScript.

**9. Why does `CvContext` clear `cv_list` and `cv_users` from localStorage on mount?**

Before the backend was added, an earlier version of the app stored CVs and user accounts directly in `localStorage` — and passwords were stored in plain text in that data. The `useEffect` that calls `localStorage.removeItem('cv_list')` and `localStorage.removeItem('cv_users')` on mount is a one-time data migration: it silently removes the old insecure data from any browser that still has it, preventing stale or unsafe data from persisting. This is a backward-compatibility shim that can be removed once all users have upgraded.

**10. Why does the frontend call `api.me()` on mount instead of just reading the token locally?**

A JWT can be decoded client-side (it is just Base64-encoded JSON), but decoding is not the same as verifying. A locally decoded token tells you what the token claims, but not whether it is still valid on the server, whether the user account still exists, or whether the secret has been rotated. By calling `GET /api/auth/me` on mount, `AuthContext` performs a full server-side verification: `verifyJwt` checks the signature and expiry, and then `prisma.user.findUnique` confirms the user record exists. If either check fails, the token is removed from `localStorage` and the user is sent to the auth page. This prevents the scenario where a deleted user's token would grant access to a stale dashboard.

**11. How does translation work end-to-end?**

When the user clicks Translate in `TranslateModal`, it calls `translateCv(cv.data, selectedLang)` from `utils/translate.js`, which delegates to `api.translate(cvData, targetLang)` — an HTTP `POST` to `/api/translate`. The route handler in `app/api/translate/route.ts` initialises the Google Generative AI client with `GEMINI_API_KEY`, builds a prompt instructing Gemini 2.0 Flash to translate all human-readable string values (job titles, bullets, summary, skills categories, etc.) while preserving JSON structure, email addresses, URLs, phone numbers, and proper names. The model returns translated JSON, which is parsed and sent back to the frontend. The frontend then creates a new CV record with `isTranslation: true`, the target language code, and a reference to the original CV's ID.

**12. What is `cuid()` and why use it for IDs instead of auto-increment integers?**

`cuid()` (Collision-resistant Unique IDentifier) generates short, URL-safe IDs like `clx7f3k2g0000abc123defghi`. Unlike auto-increment integers, CUIDs are generated client-side (or at the ORM layer) without a database round-trip, making them safe to use in distributed systems where multiple writers exist. They do not expose the total number of records in the database (an integer ID of `42` reveals there are roughly 42 users). They are also safe to include directly in URLs without appearing as predictable enumerable values. The trade-off is that CUIDs are longer than integers and slightly slower to index, but for this application size that is entirely negligible.

**13. What does `onDelete: Cascade` do in the Prisma schema?**

The `onDelete: Cascade` directive on the `Cv.user` relation tells PostgreSQL to automatically delete all `Cv` rows that reference a `User` row when that `User` row is deleted. Without it, attempting to delete a user who has CVs would raise a foreign key constraint violation error. With cascade deletion, the operation is atomic: PostgreSQL deletes the user and all associated CVs in a single transaction. This is the correct behaviour for this data model because a CV without an owner is meaningless. In the Prisma schema it is written as `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`.

**14. How does the `middleware.ts` CORS implementation handle preflight requests?**

`middleware.ts` is registered on the `matcher: '/api/:path*'` config, so it runs before every route handler under `/api/`. When the incoming method is `OPTIONS`, the function returns immediately with a `204` response and the three CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`) — the route handler is never executed. This is important: if the `OPTIONS` request reached the route handler, Next.js would return `405 Method Not Allowed` because the route only exports `GET`/`POST`/`PATCH`/`DELETE`. For all other methods, `NextResponse.next()` passes control to the route handler, and the middleware appends the `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers` headers to the response before it reaches the browser.

**15. If two browser tabs are open and the user deletes a CV in one, what happens in the other?**

Nothing happens automatically. The CV list in `CvContext` is in-memory React state. When Tab A deletes a CV, it calls `api.deleteCv(id)` and then updates its local state with `setCvs(prev => prev.filter(...))`. Tab B has no mechanism to receive this update — there is no WebSocket, Server-Sent Events, or polling in place. Tab B's `cvs` array still contains the deleted card. If the user in Tab B then tries to edit, rename, or translate that card, the API will return `404 Not Found`, and the error will surface in the console (or in the catch handler). Refreshing Tab B resolves the inconsistency. A production fix would be to poll `GET /api/cvs` on a short interval, use a `BroadcastChannel` to sync state between same-origin tabs, or implement WebSocket push notifications.

**16. How would you add rate limiting to the API?**

The most straightforward approach for a Next.js API is to add rate-limiting logic inside `middleware.ts`, which already intercepts every `/api/*` request. You would maintain a `Map<string, { count: number, resetAt: number }>` keyed on the client IP (`req.ip` or the `x-forwarded-for` header), increment the count on each request, and return a `429 Too Many Requests` response if the count exceeds the threshold within the time window. For a production deployment, in-process memory is not sufficient because multiple server instances do not share state — you would use Redis (e.g., via `ioredis` and a sliding-window algorithm) or a managed service like Upstash Rate Limit. Applying stricter limits specifically to `/api/auth/login` and `/api/auth/register` is the highest-priority change to prevent brute-force attacks.

**17. What SQL does `prisma.cv.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } })` generate?**

Prisma translates this call into the following parameterised SQL query:

```sql
SELECT
  "id", "userId", "name", "template", "data",
  "language", "isTranslation", "originalCvId",
  "createdAt", "updatedAt"
FROM "Cv"
WHERE "userId" = $1
ORDER BY "updatedAt" DESC;
```

The `$1` placeholder is bound to the actual `userId` string at execution time by the `pg` driver, preventing SQL injection. Prisma does not use `SELECT *` — it enumerates all columns defined in the schema. The `ORDER BY "updatedAt" DESC` maps directly from `orderBy: { updatedAt: 'desc' }`. To make this query efficient at scale, a composite index on `("userId", "updatedAt" DESC)` should be added to the schema using `@@index([userId, updatedAt(sort: Desc)])`.

---

## Presentation Checklist

Follow these steps to demo the full feature set in order:

1. Open http://localhost:5173 — the landing page loads with three live CV template previews.
2. Click **Start Building** — because you are not logged in, you are redirected to the Auth page.
3. Switch to the **Register** tab, fill in name, email, and password (min 6 chars), click **Create account** — you land on the dashboard showing "No CVs yet".
4. Click **New CV** — the wizard opens at Step 1 (Personal). Fill in name and email (required), watch the live preview on the right update in real time.
5. Click **Continue** through Summary, Experience, Education, Skills steps, filling in at least partial data at each step.
6. On Step 6 (Preview), choose a different template from the selector — the full-size preview switches instantly. Click **Save & Exit**.
7. The dashboard now shows your CV card with the chosen template name badge and today's date.
8. **Double-click** the card name to rename it inline — press Enter or click away to save.
9. Click **Design** on the card — a dropdown shows all five templates. Pick a different one — the card thumbnail re-renders immediately and the change is persisted.
10. Click **Translate** — the modal opens. Select **Ukrainian** and click **Translate** — a 2-second spinner appears, then the modal closes and a new card appears on the dashboard with a flag badge.
11. On any card, click **Download PDF** — the button shows "Generating…" while `@react-pdf/renderer` builds the PDF from native primitives, then a file is saved to your downloads folder with real selectable text.
12. Click **Delete** on a card — a confirmation dialog appears; confirm — the card is removed from the grid.
13. Refresh the page (F5) — the app calls `GET /api/auth/me` with the stored token, the session is restored, and the dashboard loads with your remaining CVs intact.
14. Click **Log out** — the token is removed from localStorage and you are returned to the landing page.

---

## Known Limitations & Future Work

- **No refresh tokens** — the JWT is valid for 1 hour with no way to revoke it or issue a new one silently.
- **No pagination** — `GET /api/cvs` returns the entire CV list for a user. For users with many CVs this becomes slow.
- **Base64 photo stored in DB** — the `data.personal.photo` field accepts a Base64-encoded image string, which can be hundreds of kilobytes per CV. For production, photos should be uploaded to object storage (AWS S3, Cloudflare R2) and only the URL stored in the database.
- **No email verification** — users can register with any email address without confirming ownership.
- **No tests** — there are no unit or integration tests for either the API routes or the React components.
- **Gradient sidebar approximated in PDF** — the Vibrant template uses a CSS gradient in the browser preview but `@react-pdf/renderer` does not support gradients; the sidebar renders as solid purple (`#7c3aed`) in the exported PDF.
