# Finley

Personal AI finance tracker built with Next.js App Router, Prisma, SQLite, OpenAI SDK, Tailwind CSS, shadcn/ui-style primitives, Recharts, Framer Motion, Zod, and React Hook Form.

## Features

- Dashboard with monthly budget status, category donut, top categories, average receipt, latest transactions, and 30-day income vs expense chart.
- Quick Add modal that parses phrases like `потратил 1200 на обед` through `gpt-4o-mini` when `OPENAI_API_KEY` is present, with deterministic fallback for demo mode.
- History with grouped transactions, filters, mobile swipe actions, desktop hover actions, and virtualized rendering for large lists.
- Insights generated from aggregated transaction data through OpenAI, with fallback cards when no API key is configured.
- Settings for budget, currency, theme, CSV export, PDF export, and destructive data reset with double confirmation.

## Local Setup

```bash
npm install
cp .env.example .env
sqlite3 prisma/dev.db < prisma/init.sql
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

If `OPENAI_API_KEY` is empty, Finley still works with deterministic local parsing and deterministic insights. For production, set `OPENAI_API_KEY` and use Neon/PostgreSQL by changing the Prisma datasource provider and `DATABASE_URL`.

## Useful Commands

```bash
npm run typecheck
npm run lint
npm run build
npm run seed
```

If `prisma db push` fails in a local sandbox, initialize SQLite directly:

```bash
sqlite3 prisma/dev.db < prisma/init.sql
npm run db:seed
```

## Deploy

Recommended production path:

1. Create a Neon PostgreSQL database.
2. Set `DATABASE_URL`, `OPENAI_API_KEY`, and `NEXT_PUBLIC_APP_URL` in Vercel.
3. Run Prisma migration/seed during setup.
4. Deploy with Vercel.

SQLite fallback is included for local/demo environments. The app also has an in-memory fallback if no database URL is available, so a preview deployment can still render seeded demo data.

## QA Snapshot

- TypeScript strict: passing.
- ESLint: passing.
- Production build: passing.
- Lighthouse on local production build: Performance 87, Accessibility 96.

## Product Mockups

JPG mockups are generated from real Finley screens:

- `public/mockups/finley-overview.jpg`
- `public/mockups/finley-dashboard.jpg`
- `public/mockups/finley-history-insights.jpg`
- `public/mockups/finley-mobile.jpg`

Regenerate them while the app is running locally:

```bash
npm run mockups
```
