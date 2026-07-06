# AgriLink Component Architecture & Data Flow

## 🏗️ Component Hierarchy

```
App (layout.tsx)
│
├── Every Page
│   └── <main>
│       ├── Navbar
│       │   ├── Logo & Brand
│       │   ├── Navigation Links (hidden on mobile)
│       │   ├── LanguageSwitcher
│       │   └── AuthNav
│       │       ├── Sign In / Sign Up (if logged out)
│       │       └── Profile Menu (if logged in)
│       │
│       └── <section> (max-w-7xl)
│           └── Page-specific content
│
├── Landing Page (/)
│   ├── Hero Section
│   ├── Journey Steps (4 items)
│   └── Category Tiles (5 items with emojis)
│
├── Marketplace & Categories Pages
│   ├── Filters/Search Bar
│   └── ProductCard Grid (1-4 columns based on screen size)
│       └── ProductCard (reusable)
│           ├── Image
│           ├── Category Badge
│           ├── Crop Name
│           ├── Location & Quantity
│           └── Price & Farmer Name
│
├── Product Detail Page
│   ├── Product Image
│   ├── Stage-based UI:
│   │   ├── Browse Stage
│   │   ├── Negotiate Stage (offer input)
│   │   ├── Transport Stage (vehicle selection)
│   │   ├── Pay Stage (Paystack)
│   │   └── Done Stage
│   └── (No reusable components - inline JSX)
│
├── Farmer Upload Page
│   ├── File Input
│   ├── Image Preview
│   ├── Category Selector (5 radio buttons with emojis)
│   ├── Crop Details Form
│   │   ├── Crop Name
│   │   ├── Quantity & Unit
│   │   ├── Price
│   │   └── Location
│   └── Submit Button
│
├── Order Pages (Buyer & Farmer)
│   ├── Order List (table/card view)
│   ├── Status Badge (color-coded)
│   └── Order Detail (if applicable)
│
├── Delivery Confirmation Page
│   ├── TrackingTimeline Component (inline)
│   │   ├── 3 Steps (Paid → Shipped → Delivered)
│   │   ├── Emoji Icons
│   │   ├── Status Labels
│   │   └── Progress Line
│   └── Confirmation Button
│
└── Settings Pages
    ├── Bank Selection Dropdown
    ├── Account Number Input
    └── Verification Message
```

---

## 🔄 Data Flow & State Management

### Landing Page (/)
```
Landing Page Component
├── State: useI18n() for translations
├── Props: None (static content + API calls from nav)
└── Uses: Navbar component
```

### Marketplace Page
```
MarketplacePage Component
├── State:
│   ├── filter (category or "all")
│   ├── query (search text)
│   ├── listings (products array)
│   ├── isDemoData (boolean)
│   └── loading (boolean)
├── Effects:
│   └── useEffect: Load real products or demo products
├── Computed:
│   └── useMemo: Filter products by category + search
└── Renders:
    ├── Navbar
    ├── Filter buttons
    ├── Search input
    └── ProductCard grid
```

### Product Detail Page
```
ProductDetailPage Component
├── Params: id (from URL)
├── State:
│   ├── product (Product object)
│   ├── stage ("browse" | "negotiate" | "transport" | "pay" | "done")
│   ├── offer (price)
│   ├── units (quantity)
│   ├── buyerState (location)
│   ├── transportChoice (selected vehicle)
│   ├── email (for payment receipt)
│   ├── loadingPay (boolean)
│   └── payError (string | null)
├── Effects:
│   ├── useEffect: Load product data
│   └── useEffect: Update offer when product loads
├── Computed:
│   ├── useMemo: Calculate distance
│   ├── useMemo: Get transport options
│   └── Calculations: goodsTotal, transportCost, grandTotal
└── Actions:
    └── handlePay: Calls createOrderAndPay server action
```

### Farmer Upload Page
```
FarmerUploadPage Component
├── State:
│   ├── authState ("checking" | "signed_out" | "wrong_role" | "ready" | "check_failed")
│   ├── category (ProductCategory | null)
│   ├── imagePreview (URL | null)
│   ├── cloudinaryUrl (URL | null)
│   ├── uploadState ("idle" | "uploading" | "done" | "error")
│   ├── cropName (string)
│   ├── quantity (string)
│   ├── unit (string)
│   ├── price (string)
│   ├── location (string)
│   ├── submitting (boolean)
│   ├── submitError (string | null)
│   └── submitted (boolean)
├── Effects:
│   └── useEffect: Check if user is authenticated farmer
├── File Input Handler:
│   ├── Create image preview
│   ├── Sign Cloudinary request
│   └── Upload to Cloudinary
└── Form Submit:
    └── Calls createProductAction server action
```

### Farmer Orders Page
```
FarmerOrdersPage Component
├── State:
│   ├── orders (OrderRow array)
│   ├── loading (boolean)
│   ├── signedIn (boolean)
│   ├── shippingId (string | null)
│   └── error (string | null)
├── Effects:
│   └── useEffect: Load farmer's orders from Supabase
└── Actions:
    └── handleMarkShipped: Calls markOrderShippedAction
```

---

## 📡 API Integration Points

### Supabase (Auth & Database)
```
/lib/supabase/
├── client.ts          - Client-side Supabase instance
├── server.ts          - Server-side Supabase instance
├── admin.ts           - Admin Supabase instance
├── middleware.ts      - Auth middleware
└── isConfigured.ts    - Config check

Used in:
- ProductDetailPage (fetch product, check auth, create order)
- MarketplacePage (fetch active products)
- FarmerDashboard (fetch user's products)
- FarmerUploadPage (save product to database)
- BuyerOrdersPage (fetch buyer's orders)
- FarmerOrdersPage (fetch farmer's orders)
- OrderConfirmPage (verify order, update status)
```

### Cloudinary (Image Upload)
```
/app/api/cloudinary/sign/route.ts
└── Signs upload request and returns:
    ├── cloudName
    ├── apiKey
    ├── timestamp
    ├── signature
    └── folder

Used in:
- FarmerUploadPage (upload product image)
```

### Paystack (Payments)
```
/app/api/paystack/
├── initialize/route.ts  - Initialize payment
├── verify/route.ts      - Verify payment
├── release/route.ts     - Release escrow funds
├── webhook/route.ts     - Handle webhooks
└── banks/route.ts       - Get bank list

Used in:
- ProductDetailPage (initialize payment)
- OrderConfirmPage (verify payment, handle webhooks)
- FarmerSettings (for bank selection)
```

---

## 🎯 Page Template Pattern

All pages follow this structure:

```tsx
"use client";  // Client component

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export default function PageName() {
  const { t } = useI18n();
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch data from Supabase or API
        const supabase = createClient();
        const data = await supabase.from("table").select("*");
        setState(data);
      } catch (err) {
        console.error("Load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-4xl px-5 py-24 text-center font-body text-ink/50">
          Loading…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-7xl px-5 py-12">
        {/* Page content */}
      </section>
    </main>
  );
}
```

---

## 🔐 Authentication Flow

```
User visits app
│
├─ Check if authenticated
│  ├─ No: Show Sign In / Sign Up buttons in AuthNav
│  │   └─ User clicks → redirects to /login or /signup
│  │
│  └─ Yes: 
│      ├─ Fetch profile from profiles table
│      ├─ Check role (farmer or buyer)
│      ├─ Show profile name + avatar in AuthNav
│      └─ Dashboard route based on role:
│          ├─ farmer → /farmer/dashboard
│          └─ buyer → /buyer/marketplace
│
├─ Protected pages:
│  ├─ /farmer/* → requires farmer role
│  ├─ /buyer/* → open to all (check if logged in)
│  └─ /login, /signup → redirect to dashboard if already logged in
│
└─ Sign out:
   └─ Clear session → redirect to home page
```

---

## 📊 Responsive Breakpoints Usage

### Mobile-First (Base Styles)
```
Default: Single column, full width (xs, sm < 640px)
  - Navbar: vertical menu
  - Grids: 1 column
  - Buttons: full width or stacked
  - Forms: single column
```

### Tablet (sm: ≥ 640px)
```
  - Navbar: start showing desktop nav
  - Grids: 2 columns
  - Buttons: horizontal layout
  - Forms: 2 column on larger forms
```

### Desktop (md: ≥ 768px)
```
  - Navbar: full desktop layout with all links visible
  - Grids: 2-3 columns
  - Forms: wider containers
```

### Large Desktop (lg: ≥ 1024px)
```
  - Grids: 3-4 columns
  - Max-width containers enforced (max-w-7xl)
  - Hero: 2-column side-by-side layout
  - Forms: expanded layout options
```

---

## 🎨 Tailwind Class Usage Patterns

### Responsive Grid
```tsx
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5
// Meaning:
// - Mobile (< 640px): 1 column
// - Tablet (640-1024px): 2 columns
// - Desktop (≥ 1024px): 3 columns
// - Gap: 1.25rem on all sizes
```

### Responsive Flex
```tsx
flex flex-col gap-4 sm:flex-row
// Meaning:
// - Mobile: column layout, stacked vertically
// - Tablet+: row layout, side by side
// - Gap: 1rem spacing
```

### Responsive Text
```tsx
font-display text-4xl sm:text-5xl lg:text-6xl
// Meaning:
// - Mobile: 2.25rem (36px)
// - Tablet: 3rem (48px)
// - Desktop: 3.75rem (60px)
```

### Responsive Padding
```tsx
px-5 py-12 sm:py-16 lg:py-24
// Meaning:
// - Horizontal: 1.25rem (fixed)
// - Vertical Mobile: 3rem (48px)
// - Vertical Tablet: 4rem (64px)
// - Vertical Desktop: 6rem (96px)
```

---

## ✨ Key Utilities Used

- `.min-h-screen` - Full viewport height
- `.max-w-7xl` - Max width constraint
- `.mx-auto` - Center horizontally
- `.sticky top-0 z-40` - Sticky navbar
- `.grid` / `.flex` - Layout systems
- `.hidden md:flex` - Responsive visibility
- `.tap-target` - Min 56px height for touch
- `.animate-pulse` - Loading skeleton
- `.group-hover:*` - Hover effects on card groups
- `.transition` - Smooth animations
- `.shadow-soft` - Custom shadow
- `.rounded-full` / `.rounded-2xl` - Border radius
- `.bg-parchment` / `.text-forest` - Color utilities
