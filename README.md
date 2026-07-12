# 🌾 AgriLink

![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Paystack](https://img.shields.io/badge/Paystack-Escrow-09A5DB?style=for-the-badge)

AgriLink is a **farm-to-buyer marketplace** connecting large-scale commercial farmers directly with buyers who need raw agricultural produce, and transporters who facilitate the logistics. 

It is built for resilience, accessibility, and trust—featuring **real-time chat**, **escrow-style payments** via Paystack, and a robust role-based architecture powered by **Supabase**.

---

## ✨ Core Features

- **Role-Based Architecture**: Distinct flows and dashboards for Farmers, Buyers, and Transporters. A database trigger automatically provisions user profiles upon signup.
- **In-App Real-Time Messaging**: Buyers and farmers can negotiate prices and discuss logistics instantly via a built-in chat platform powered by Supabase Realtime websockets.
- **Secure Escrow Payments**: Integration with Paystack's Transfer API allows buyers to pay securely upfront. Funds are held in escrow and only released to the farmer once the buyer confirms delivery.
- **Cloudinary Image Management**: Fast, optimized, and secure image uploads directly from the client to Cloudinary, ensuring the database remains lightweight.
- **Multilingual Support**: Built-in `i18n` with support for English, Igbo, Yoruba, and Hausa to maximize accessibility for local farmers.
- **Modern UI/UX**: Premium aesthetic with heavy glassmorphism, responsive mobile-first layouts, and seamless micro-animations built with Tailwind CSS.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions, Middleware)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, GoTrue Auth, Realtime, Row Level Security)
*   **Payments**: [Paystack](https://paystack.com/)
*   **Media Storage**: [Cloudinary](https://cloudinary.com/)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-org/agrilink.git
cd agrilink
npm install
cp .env.example .env.local
```

### 2. Configure Supabase (Database & Auth)
1. Create a new project at [Supabase](https://supabase.com).
2. Open your Supabase SQL Editor and run `supabase/migrations/0001_init.sql` to generate the tables, triggers, and Row Level Security (RLS) policies.
3. Run the realtime setup script for the messaging feature:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ```
4. Copy your `Project URL`, `anon` key, and `service_role` key into `.env.local`.
5. *(Optional for Dev)* Disable "Confirm email" in Supabase Auth settings to test signups instantly.

### 3. Configure External Services
Fill out the remaining `.env.local` variables:

| Variable | Source | Purpose |
|---|---|---|
| `CLOUDINARY_URL` | Cloudinary → Settings → API Keys | Storing farmer crop images. |
| `PAYSTACK_SECRET_KEY` | Paystack Dashboard → API Keys | Server-side escrow payment initialization. |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack Dashboard → API Keys | Client-side checkout modal. |

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`. The application is fully interactive even without a configured database (it will gracefully fall back to demo mode), but real transactions, chat, and listings require Supabase to be wired up.

---

## 🗄️ Database Schema & RLS

AgriLink relies heavily on Postgres Row Level Security (RLS) to ensure data privacy without heavy backend boilerplate.

*   `profiles` (Public Read / Owner Update): Stores user metadata, roles (`farmer`, `buyer`), and Paystack recipient codes.
*   `products` (Public Read / Owner Mutate): Harvest listings containing crop details, prices, and Cloudinary image URLs.
*   `orders` (Participant Read / Admin Mutate): Tracks the escrow lifecycle (`pending` → `in_escrow` → `completed`). Standard users have **no UPDATE permissions**. Statuses are only mutated via highly privileged Server Actions (`lib/supabase/admin.ts`).
*   `messages` (Participant Read / Sender Insert): Real-time chat history linking buyers and farmers.

---

## 💸 The Escrow Payment Flow

To protect both farmers (from non-payment) and buyers (from non-delivery), AgriLink uses a strict escrow flow:

1. **Initialization**: Buyer agrees on a price via chat and clicks "Pay". A pending `orders` row is created simultaneously with a Paystack checkout session.
2. **Escrow**: Buyer pays via Paystack. Funds land in AgriLink's corporate Paystack balance. A webhook (`/api/paystack/webhook`) catches the success event and marks the order as `in_escrow`.
3. **Delivery**: The farmer ships the goods.
4. **Release**: The buyer inspects the goods and taps "Confirm Delivery" on their dashboard. A Server Action validates the request and utilizes Paystack's Transfer API to push the funds directly to the Farmer's verified bank account.

---

## 📁 Architecture Overview

```text
agrilink/
├── app/
│   ├── api/               # External Webhooks (Paystack, Cloudinary)
│   ├── auth/              # OAuth Callbacks & Session Management
│   ├── buyer/             # Buyer Dashboard & Marketplace
│   ├── farmer/            # Farmer Dashboard, Uploads, & Bank Settings
│   ├── messages/          # Smart Routing for Inbox
│   └── page.tsx           # Landing Page
├── components/            # Reusable UI (Navbar, ChatBox, ProductCards)
└── lib/
    ├── supabase/          # Supabase Clients (Server, Client, Middleware, Admin)
    ├── i18n.tsx           # Multi-language dictionary
    ├── messages.ts        # Chat fetching and sending logic
    └── paystack.ts        # Escrow transfer algorithms
```

---

## 🔮 Roadmap / What's Next

- [x] **In-App Messaging**: Real-time buyer/farmer negotiation.
- [ ] **Dispute Resolution**: Escrow pausing and admin arbitration for rejected deliveries.
- [ ] **Transporter UI**: A dedicated app layout for the `transporter` role to accept jobs and update live locations.
- [ ] **USSD Integration**: Allowing farmers in remote areas with poor internet to update their listings via SMS/USSD codes.
