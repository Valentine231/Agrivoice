# AgriLink

A farm-to-buyer marketplace connecting large-scale commercial farmers, buyers who need raw
agricultural produce, and transporters — with Supabase for auth/data and escrow-style payments
via Paystack, built for users who may not be comfortable with technology.

## What's in this build

- **Auth** (`app/login`, `app/signup`, Supabase Auth) — email/password signup with a role
  picker (Farmer / Buyer / Transporter). A database trigger auto-creates a `profiles` row the
  moment someone signs up (see `supabase/migrations/0001_init.sql`).
- **Database** (Supabase Postgres) — `profiles`, `products`, `orders` tables with Row Level
  Security locking down who can read/write what. See the schema walkthrough below.
- **Landing page** (`app/page.tsx`) — hero, the farm→buyer→delivery journey, category tiles,
  trust/escrow explainer.
- **Categories & marketplace** (`app/categories`, `app/buyer/marketplace`) — real listings
  pulled from Supabase, with sample data shown automatically if Supabase isn't configured yet
  so the UI is still clickable out of the box.
- **Farmer upload** (`app/farmer/upload`) — requires a farmer account; uploads the photo
  straight to **Cloudinary** (never to the database — only the resulting URL is stored), then
  writes the listing via a Server Action.
- **Farmer dashboard & settings** (`app/farmer/dashboard`, `app/farmer/settings`) — a farmer's
  own listings, plus a bank-details form that verifies the account with Paystack and stores
  the resulting Transfer Recipient code — required before any payout can be released to them.
- **Buyer product page** (`app/buyer/product/[id]`) — negotiate a price → get a transport
  suggestion (`lib/transport.ts`) → pay. Requires a signed-in buyer to actually pay.
- **Paystack escrow flow** (`app/api/paystack/*`, `lib/paystack.ts`) — initialize, verify,
  webhook, release, plus bank-account verification. Order status transitions
  (`pending → in_escrow → completed`) are only ever written server-side.
- **Language switcher** — English default, plus Igbo, Yoruba, Hausa (`lib/i18n.tsx`).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your keys — see below
```

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql` — this creates every table,
   enum, RLS policy, and trigger this app needs, in one shot.
3. In Settings → API, copy your Project URL, `anon` public key, and `service_role` key into
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`).
4. By default Supabase requires email confirmation on signup. For local development you can
   turn this off under Authentication → Providers → Email → "Confirm email", so signup logs
   people in immediately. Turn it back on before going to production.
5. Regenerate proper TypeScript types once your project is linked (the shipped
   `lib/database.types.ts` is hand-written to match the schema, not generated):
   ```bash
   npx supabase gen types typescript --project-id <your-project-ref> > lib/database.types.ts
   ```

### 2. Fill in the rest of `.env.local`

| Variable | Where to get it |
|---|---|
| `CLOUDINARY_URL` | Cloudinary dashboard → Settings → API Keys → "API Environment variable" |
| `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | dashboard.paystack.com → Settings → API Keys |

Without Supabase configured, the app still runs and is fully clickable using sample data — you
just can't sign up, list real produce, or complete a real purchase until it's wired up.

```bash
npm run dev
```

## Database schema

```
profiles          — one row per auth user; role is farmer | buyer | transporter | admin
  ├─ id (= auth.users.id)
  ├─ role, full_name, phone, state, preferred_language
  └─ paystack_recipient_code   — set once a farmer adds bank details

products           — a farmer's harvest listing
  ├─ farmer_id → profiles.id
  ├─ category, crop_name, quantity_label, unit, price_per_unit, state
  └─ image_url                — a Cloudinary URL, nothing else

orders              — one row per purchase attempt
  ├─ product_id, buyer_id, farmer_id
  ├─ goods_total, transport_*, grand_total, buyer_email
  ├─ status                    — pending → in_escrow → completed (or disputed/cancelled)
  └─ paystack_reference, paid_at, delivered_confirmed_at
```

**Row Level Security, in plain terms:**
- `profiles` — publicly readable (buyers need to see a farmer's name on listings), but you can
  only update your own.
- `products` — active listings are publicly readable; only the owning farmer can
  insert/update/delete their own.
- `orders` — a buyer or farmer can only read orders they're part of. Regular users have **no
  UPDATE policy at all** — every status change (payment confirmed, delivery confirmed, funds
  released) happens through a Server Action or Route Handler using the service-role client
  (`lib/supabase/admin.ts`), which checks ownership in application code first. This is what
  stops a buyer from marking their own order "completed" without actually paying, or a farmer
  from releasing their own escrow early.

## How the escrow payment works

1. Buyer clicks pay → `app/buyer/product/[id]/actions.ts` creates the `orders` row and calls
   Paystack's initialize endpoint in the same step, so the DB row and payment reference always
   match.
2. Buyer pays on Paystack's page. Funds settle into **AgriLink's Paystack balance** — a
   CBN-licensed payment institution — never into a personal or company bank account directly.
3. `app/api/paystack/webhook` (the source of truth) and the buyer's redirect back to
   `/buyer/order/[id]/confirm` both mark the order `in_escrow`.
4. Once the buyer taps "Confirm delivery," `app/buyer/order/[id]/actions.ts` re-checks they're
   really the buyer on that order, confirms the farmer has bank details on file, calls
   Paystack's Transfer API to pay the farmer (minus a platform fee), and only then marks the
   order `completed`.

**This reduces regulatory exposure but is not legal advice.** Have a lawyer confirm the
specific flow (dispute windows, refund policy, escrow licensing thresholds) before handling
real money.

## Transport suggestions

`lib/transport.ts` currently uses straight-line (haversine) distance between Nigerian state
capitals as a stand-in for road distance, and a static fleet catalogue. For production, swap:

- The distance calculation → a routing API (Google Distance Matrix, Mapbox Directions) for
  real road distance and ETA.
- The static fleet → a live query against your transporter partners' availability.

## Language support

Translations in `lib/i18n.tsx` are a solid starting point for a small set of core UI strings,
not a certified localization — have native speakers of Igbo, Yoruba, and Hausa review them
before shipping.

## What to add next (not included in this build)

- **In-app messaging** for the "agree a price" negotiation step — currently just a price
  input field on the buyer's side.
- **Dispute handling** — a way for a buyer to flag "goods didn't arrive/don't match" that
  pauses the release step. The `disputed` order status already exists in the schema; nothing
  reads or writes it yet.
- **Transporter accounts** — the `transporter` role exists in the schema and signup flow, but
  there's no transporter-facing UI yet (accepting jobs, marking pickups/deliveries).
- **Admin tooling** — for resolving disputes, handling failed transfers, and managing users.
- **SMS/USSD fallback** — many commercial farmers in remote areas have better access to basic
  phones than smartphones; a USSD flow for listing produce is worth considering later.
