# 💰 Finance Tracker

A personal finance tracker for tracking **income, expenses, investments and net worth month by month**, with recurring templates, drag-and-drop ordering, trend analytics and multi-user login. Built with Next.js + Supabase, localized for India (₹ / lakh–crore formatting).

> **Where things live:** the Next.js app is in [`finance-tracker/`](./finance-tracker). The repository root only holds the README, CI workflow and editor/agent config. Run every command below from `finance-tracker/`.

---

## ✨ Features

### 📅 Monthly view
- **Month navigation** with a "Go to current month" shortcut.
- **Income tracker** — add/delete income sources per month, plus an **External Investment Buffer** (e.g. savings carried in from outside).
- **Income & Expense Ledger** — a full-width 6-column table (income entry | amount | expense entry | amount | investment entry | amount) with the month's totals at the foot of each amount column. Done entries show a read-only green tick and strike through; marking happens in the lists above, so nothing in the ledger is clickable. The live **Remaining Income** row recalculates whenever a Done flag changes.
- **Expenses list** — drag to reorder, mark **Done** / **Undo**, `Template` badge on rows created from the master template, and a Total / Remaining summary for the month.
- **Investments list** — grouped into four sections (**Self**, **Combined**, **One Time**, **Other**). Drag within a section to reorder, or drag across sections to re-classify an investment.
- **Investment type distribution** pie chart for the selected month.
- **Trend charts** (current calendar year unless noted): expenses, all investments, and self investments — each with lowest / highest / average across the months that have data. Only the current year is charted, so older data never skews the line.
- **Net Worth tracker** — one manually entered total per month, shown as a 6-month paged bar chart with always-on value labels, plus a **comparator** that explains the change between any two months in ₹, words (lakh/crore) and %.
- **Notes** — a single free-text note per user that persists across all months (manual save; the Save button lights up when there are unsaved changes).

### ⚙️ Recurring templates
- **Expense template** and **investment template**, each a separate master list stored per user.
- One-click **"Fill with Fixed Expenses"** / **"Fill with Recurring Investments"** copies the master list into the selected month.
- Filling replaces that month's template-generated rows, then re-creates them from the current master list — so editing a template amount and re-filling updates the month.
- **Fuzzy duplicate detection** (exact match, 5+ character substring, or a shared 5-character fragment) skips items that already exist for that month, and reports how many were added vs skipped.
- Monthly rows are independent of the template: editing or deleting a monthly row never touches the master list.

### 🔐 Authentication & users
- Username + password signup/login, **bcrypt** password hashing (12 rounds by default).
- **JWT session** (24 h) stored in an HTTP-only, `SameSite=Strict` cookie (also `Secure` in production).
- Session middleware protects every page and API route except `/login`, `/signup`, `/api/auth/*`, `/api/cron/*`.
- Password policy on signup: ≥ 8 characters with upper case, lower case and a digit, plus a common-password blocklist.
- Roles (`admin` / `user`) and account status (`active` / `inactive` / `pending`). Deactivated accounts cannot log in and lose API access immediately.
- **User limit** (default 5) enforced both in application code and by a database trigger; the signup page reports availability before the form is shown, and `/signup` hides itself once the limit is reached.
- Per-user data isolation on every table via `user_id`.

### 👨‍💼 Admin panel
At `/admin` (deliberately not linked in the sidebar): list all users, toggle active/inactive, delete a user, and see created/last-login timestamps. Admins cannot deactivate or delete their own account.

### 🔄 Database keep-alive
`/api/cron/keep-alive` runs a real `SELECT` on `users` plus an `INSERT`/`DELETE` on `health_checks` to generate genuine database activity (and prunes entries older than 7 days), which is what Supabase's free tier counts before pausing a project. Triggered **daily by Vercel Cron** (primary) and **every 4 hours by GitHub Actions** (backup).

### 🎨 Interface
Dark theme, responsive down to mobile, drag-and-drop throughout, toast notifications, loading spinners, and INR formatting (`₹1,00,000`) via `formatINR` / `formatINRWithDecimals` / `numberToIndianWords`.

---

## 🛠 Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict), Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) via `@supabase/supabase-js` |
| Auth | `jsonwebtoken` + `bcryptjs` |
| Charts | Chart.js 4 + `react-chartjs-2` |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Icons | `lucide-react` |
| Hosting | Vercel (+ Vercel Cron, GitHub Actions) |

---

## 📁 Repository layout

```
.
├── .github/workflows/keep-alive.yml     # 4-hourly ping of the deployed keep-alive endpoint
├── README.md
└── finance-tracker/                     # ← the app (Vercel "Root Directory")
    ├── database/
    │   ├── schema.sql                   # bootstrap script (see the caveat in Database)
    │   └── migrations/drop_credit_card_tracker.sql
    ├── src/
    │   ├── middleware.ts                # session gate for pages + API routes (must live in src/)
    │   ├── app/
    │   │   ├── page.tsx                 # monthly dashboard (client component, all app state)
    │   │   ├── login/ · signup/ · admin/
    │   │   └── api/                     # route handlers (see API reference)
    │   ├── components/                  # ledger, trackers, forms, charts, templates
    │   ├── lib/                         # api client, auth service, auth helpers, supabase clients
    │   ├── types/index.ts               # domain types + category/type lists
    │   └── utils/currency.ts            # INR formatting helpers
    ├── package.json · tsconfig.json · next.config.ts · eslint.config.mjs
    └── vercel.json                      # Vercel Cron schedule
```

---

## 🚀 Quick start

**Prerequisites:** Node.js 18.18+ (20+ recommended) and a Supabase project.

```bash
cd finance-tracker
npm install
```

### 1. Configure environment

Create `finance-tracker/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
JWT_SECRET=<32+ random bytes>
CRON_SECRET=<32+ random bytes>
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Set up the database

Read **[Database](#-database)** first — `database/schema.sql` is currently **out of sync** with what the app expects. For a fresh install you need the 9 tables it creates **plus** the deltas listed in that section.

Also seed an admin user: sign up through `/signup`, then promote the account in the Supabase SQL editor:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

Log out and back in to pick up the new role.

### 3. Run

```bash
npm run dev          # http://localhost:3000 (Turbopack)
```

| Script | Purpose |
|---|---|
| `npm run dev` | development server (Turbopack) |
| `npm run build` | production build (Turbopack) |
| `npm start` | serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals` + `next/typescript`) |

---

## 🔑 Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL used by both clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key. Required because `src/lib/supabase.ts` throws without it — the anon client itself is not used for data access |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-side client used by every API route. **Never expose to the browser.** RLS-bypassing; all queries are filtered by `user_id` in application code |
| `JWT_SECRET` | ✅ | Signs/verifies session tokens. `src/lib/auth.ts` refuses to start without it |
| `CRON_SECRET` | ➖ | When set, `/api/cron/keep-alive` requires `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this automatically) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | ➖ | Server-side fallbacks for the `NEXT_PUBLIC_` pair |
| `MAX_USERS` | ➖ | Active-user cap (default `5`) |
| `BCRYPT_ROUNDS` | ➖ | Password hash cost (default `12`) |

---

## 🗄 Database

### Tables used by the app

| Table | Key columns |
|---|---|
| `users` | `id`, `username` (unique), `email` (unique), `password_hash`, `role` (`admin`/`user`), `status` (`active`/`inactive`/`pending`), `created_at`, `updated_at`, `last_login` |
| `central_templates` | `id`, `user_id`, `items` (jsonb array of `{id,name,amount,category}`), timestamps |
| `central_investment_templates` | `id`, `user_id`, `items` (jsonb array of `{id,name,amount,category,investmentType}`), timestamps |
| `expenses` | `id`, `user_id`, `name`, `amount` `numeric(10,2)`, `category`, `month` `varchar(7)` (`YYYY-MM`), `source_type` (`manual`/`template`), `monthly_template_instance_id`, `display_order`, `is_completed`, `created_at` |
| `investments` | as `expenses`, plus `investment_type` (`Self`/`Combined`/`One Time`/`Other`) |
| `income` | `id`, `user_id`, `source`, `amount`, `month`, `created_at` |
| `external_investment_buffer` | `id`, `user_id`, `description`, `amount`, `month`, `created_at` |
| `net_worth_entries` | `id`, `user_id`, `amount` `numeric(14,2)`, `month`, timestamps, **unique `(user_id, month)`** |
| `notes` | `id`, **unique `user_id`** (one global note per user), `content`, timestamps |
| `health_checks` | `id`, `checked_at`, `status`, `message`, `response_time_ms` (keep-alive bookkeeping only) |

All user data tables carry `user_id` → `users(id)` with `ON DELETE CASCADE`.

### ⚠️ `database/schema.sql` is out of sync

The script still creates only 9 of the tables above, and is missing the changes that were applied through migrations (the migration files were removed from the repo in an earlier cleanup). Before it can bootstrap a working install you must also apply:

| Missing from `schema.sql` | Why it matters |
|---|---|
| `expenses.display_order`, `investments.display_order` | reordering `/api/expenses/reorder`, `/api/investments/reorder` fails |
| `expenses.is_completed`, `investments.is_completed` | the Done/Undo toggles fail |
| `notes` global shape (`month` dropped, unique on `user_id`) | `POST /api/notes` fails against the `month NOT NULL` + unique `(user_id, month)` definition in the script |
| `'One Time'` in the `investment_type` check constraint | creating a "One Time" investment violates the constraint |
| `health_checks` table | the keep-alive job's write/cleanup silently degrade |
| Row Level Security enabled + policies | the script only has commented-out `ALTER TABLE … ENABLE ROW LEVEL SECURITY` lines |

Minimal reconciliation for a fresh project:

```sql
ALTER TABLE expenses    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE expenses    ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_investment_type_check;
ALTER TABLE investments ADD CONSTRAINT investments_investment_type_check
  CHECK (investment_type IN ('Self', 'Combined', 'One Time', 'Other'));

ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_month_key;
ALTER TABLE notes DROP COLUMN IF EXISTS month;
ALTER TABLE notes ADD CONSTRAINT notes_user_id_key UNIQUE (user_id);

CREATE TABLE IF NOT EXISTS health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  message TEXT,
  response_time_ms INTEGER
);
```

> The database in production already has all of the above; this is only relevant when standing up a **new** project, and it is worth folding back into `schema.sql`.

### Migrations

| File | Effect |
|---|---|
| `database/migrations/drop_credit_card_tracker.sql` | Drops the retired credit-card tracker: `DROP TABLE credit_card_entries` **and** the unused `notes.credit_card_tracker_title` column. Irreversible — run it in the Supabase SQL editor **after** the release that removed the feature is deployed. |

---

## 🧮 How the numbers add up

| Figure | Formula | Where |
|---|---|---|
| Investment Buffer | month's **total income** − month's **total expenses** | Income card |
| External Investment Buffer | sum of the month's external buffer entries | Income card |
| Total Investment Buffer | Investment Buffer + External Investment Buffer | Income card |
| Expenses – Total | sum of the month's expenses | Expenses card |
| Expenses – Remaining | total expenses − expenses marked **Done** | Expenses card |
| **Remaining Income** | month's **total income** − expenses marked **Done** − investments marked **Done** | Income & Expense Ledger |
| Net Worth change | any month's net worth − another month's, with % and words | Net Worth comparator |

Note that *Investment Buffer* (income − **all** expenses) and *Remaining Income* (income − **settled** expenses and investments) answer different questions on purpose: the first is what is left after everything is accounted for, the second is what is left after the outgoings you have actually settled.

---

## 📱 Using the app

1. **Sign up** at `/signup`, then **log in** at `/login`.
2. **Build your templates** — *Expense Template* and *Investment Template* in the sidebar. Add recurring items (rent, SIPs, …). Investment items also carry a type.
3. **Open the month** you want. Use the arrows to move between months; "Go to current month" jumps back.
4. **Fill from template** with *Fill with Fixed Expenses* / *Fill with Recurring Investments*. A toast reports how many rows were added and how many were skipped as duplicates.
5. **Add ad-hoc items** with *Add Expense* / *Add Investment*, or income and external buffer entries in the Income card.
6. **Record income** for the month — the Income card shows the buffers, and the full-width Income & Expense Ledger at the bottom pairs income with expenses and investments side by side.
7. **Work the ledger** — mark entries **Done** in the Expenses or Investments list above; the ledger strikes them through with a green tick, and **Remaining Income** refreshes automatically.
8. **Reorder** by dragging the grip handle in the expenses list; drag investments into another section to change their type.
9. **Log net worth** with *Add/Update Net Worth* — one value per month, then page through history and compare months.
10. **Notes** are global: edit the box and press *Save Notes*.
11. Admins: visit `/admin` (not in the sidebar) to manage users.

---

## 🔌 API reference

Every route except the public ones below requires the `auth-token` cookie; requests without a valid session are redirected to `/login` by `middleware.ts` and rejected with `401` by `requireAuth`.

| Route | Methods | Notes |
|---|---|---|
| `/api/auth/signup` | `GET`, `POST` | `GET` reports signup availability (active users vs cap); `POST` creates a user |
| `/api/auth/login` | `POST` | verifies credentials, sets the `auth-token` cookie, stamps `last_login` |
| `/api/auth/logout` | `POST` | clears the cookie |
| `/api/expenses` | `GET`, `POST`, `PUT`, `DELETE` | optional `?month=YYYY-MM`; DELETE takes `?id=` |
| `/api/expenses/reorder` | `POST` | bulk `display_order` |
| `/api/expenses/toggle-completion` | `PATCH` | flips `is_completed` |
| `/api/investments` | `GET`, `POST`, `PUT`, `DELETE` | as expenses, plus `investment_type` |
| `/api/investments/reorder` | `POST` | bulk `display_order` |
| `/api/investments/toggle-completion` | `PATCH` | flips `is_completed` |
| `/api/central-template` | `GET`, `POST`, `PUT` | expense master template (jsonb `items`) |
| `/api/central-investment-template` | `GET`, `POST`, `PUT` | investment master template |
| `/api/income` | `GET`, `POST`, `DELETE` | |
| `/api/external-investment-buffer` | `GET`, `POST`, `DELETE` | |
| `/api/net-worth` | `GET`, `POST`, `DELETE` | `POST` upserts (one entry per user per month) |
| `/api/notes` | `GET`, `POST`, `PUT` | single global note per user |
| `/api/admin/users` | `GET`, `DELETE`, `PATCH` | admin only; `PATCH` toggles `active`/`inactive` |
| `/api/cron/keep-alive` | `GET` | public; requires `Bearer $CRON_SECRET` when that variable is set |

---

## 🔐 Auth & security model

- Passwords are hashed with bcrypt (`BCRYPT_ROUNDS`, default 12) and never returned by any endpoint.
- Sessions are stateless JWTs (`userId`, `username`, `role`, 24 h expiry) in an HTTP-only cookie; `middleware.ts` blocks unauthenticated navigation, and each route handler independently re-verifies the token and re-loads the user to confirm the account is still `active`.
- All data access goes through the **service-role** Supabase client server-side, with an explicit `.eq('user_id', user.id)` on every read, write and delete. The service-role key must never reach the client.
- Admin routes re-check `role === 'admin'` server-side, and self-deactivation/self-deletion is rejected.
- Signup enforces a password policy, a common-password blocklist, a username length floor, an email format check and the user cap.

---

## ☁️ Deployment (Vercel)

1. Import the repository into Vercel and set **Root Directory = `finance-tracker`** (the app is not at the repo root).
2. Add the environment variables from the table above (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CRON_SECRET`). Use freshly generated secrets — never the local placeholder values.
3. Deploy. `vercel.json` registers `GET /api/cron/keep-alive` daily at 00:00 UTC; Vercel sends the `CRON_SECRET` bearer header automatically.
4. Apply database migrations (e.g. `drop_credit_card_tracker.sql`) **after** the code that stops using the removed table is live.

The bundled GitHub Action (`.github/workflows/keep-alive.yml`) pings the deployed endpoint every 4 hours as a backup. It sends `Authorization: Bearer ${{ secrets.CRON_SECRET }}` when that repo secret exists and retries unauthenticated on `401`, so it works either way, and it fails loudly unless the endpoint reports `"database":"connected"`.

> ⚠️ **GitHub disables scheduled workflows in a public repository after 60 days without repository activity.** The workflow then reports `state: disabled_inactivity`, its schedule stops firing silently, and it must be re-enabled explicitly (Actions tab → **Enable workflow**, or `gh workflow enable keep-alive.yml`) — a commit alone does not reliably re-enable it. Confirm with:
> ```bash
> curl -s https://api.github.com/repos/<owner>/<repo>/actions/workflows | grep -E '"name"|"state"'
> ```
> This is why the Vercel Cron above (which does not depend on repository activity) is the primary pinger, and why it is worth checking the backup's state a few times a year.

---

## ✅ Local checks

```bash
cd finance-tracker
npx tsc --noEmit                      # type check
npm run lint                          # ESLint
npm run build                         # production build
npm run dev                           # then click through http://localhost:3000
```

There is no automated test suite yet, so the build plus a manual pass over the monthly view is the current safety net.

---

## ⚠️ Known limitations

- **`database/schema.sql` does not match the live schema** (see [Database](#-database)) — the most likely source of pain on a fresh install.
- **`middleware.ts` must live in `src/`** while this project uses a `src/` directory. At the app root, `next dev` silently never registers it (no error, no warning) even though production builds pick it up — so local and deployed behaviour diverge. If the session gate ever stops redirecting, check the file location first.
- **No automated tests** and no test runner configured; CI only pings the keep-alive endpoint.
- **No rate limiting** on `/api/auth/login` (or elsewhere).
- The keep-alive **GitHub Action can be auto-disabled** by GitHub after 60 days without repository activity (`disabled_inactivity`), so the daily Vercel Cron is the pinger to rely on; periodically confirm the workflow is still `active`.
- `middleware.ts` still accepts a **legacy base64 `auth-token` format** in addition to JWTs, and falls back to a hard-coded JWT secret if `JWT_SECRET` is missing. This can let a forged cookie render the app *shell*, but every API route re-verifies the session properly, so no data is exposed.
- The RLS policies present in the live database grant full access to all roles, so the **anon key is not a safe data path** — keep all data access server-side through the service-role client, as the app does. `src/lib/supabase.ts` also exports an unused anon client that could invite misuse.
- Repository-root hygiene: the README is here but the app, `.gitignore` and CI config are split across two directory levels.

---

## 📄 License

No license file is included in this repository. Add one before distributing or open-sourcing the project.
