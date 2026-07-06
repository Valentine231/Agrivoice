# AgriLink Next.js UI Structure Analysis

## Overview
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Pages Found**: 13 page.tsx files (0 .jsx files)
- **Components**: 4 reusable components in /components/
- **Architecture**: Client-side rendering with Supabase integration and fallback demo data

---

## 📋 Complete Page Files Inventory

### Root & Public Pages
1. **[app/page.tsx](app/page.tsx)** - Landing page
   - Imports: `Navbar`, `useI18n`
   - Features: Hero section, journey steps, category tiles, CTA buttons
   - Responsive: ✅ Yes (grid layout with `lg:grid-cols-2`)

2. **[app/how-it-works/page.tsx](app/how-it-works/page.tsx)** - How it works guide
   - Imports: `Navbar`, `useI18n`
   - Features: 4-step process cards with emojis
   - Responsive: ✅ Yes (flexbox layout with padding adjustments)

3. **[app/categories/page.tsx](app/categories/page.tsx)** - Product categories browser
   - Imports: `Navbar`, `ProductCard`, `useI18n`
   - Features: Filtered product display by category with emoji badges
   - Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
   - Responsive: ✅ Yes (4-column on desktop, 2 on tablet, 1 on mobile)

### Auth Pages
4. **[app/login/page.tsx](app/login/page.tsx)** - Login page
   - Imports: `LoginForm` (local component)
   - Features: Suspense wrapper for async form
   - Responsive: ✅ Depends on LoginForm implementation

5. **[app/signup/page.tsx](app/signup/page.tsx)** - Sign up page
   - Imports: `SignupForm` (local component)
   - Features: Suspense wrapper for async form
   - Responsive: ✅ Depends on SignupForm implementation

### Buyer Pages
6. **[app/buyer/marketplace/page.tsx](app/buyer/marketplace/page.tsx)** - Product marketplace
   - Imports: `Navbar`, `ProductCard`, `useI18n`
   - Features: Filter buttons, search bar, product grid with loading skeleton
   - Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
   - Filter buttons: `flex flex-wrap gap-2` + `flex-col gap-4 sm:flex-row`
   - Responsive: ✅ Yes (3-column desktop, 2-column tablet, 1 mobile)
   - **Note**: Search input has `w-full sm:w-64` - could have responsive sizing issues on tablet

7. **[app/buyer/product/[id]/page.tsx](app/buyer/product/[id]/page.tsx)** - Product detail page
   - Imports: `Navbar`, `Image`, `useI18n`
   - Features: Product details, negotiation flow, transport suggestions, Paystack integration
   - Has: Stage-based UI (browse → negotiate → transport → pay → done)
   - Responsive: ⚠️ **Potential issues**: Heavy form layouts, likely needs responsive improvements for mobile

8. **[app/buyer/orders/page.tsx](app/buyer/orders/page.tsx)** - Buyer's orders list
   - Imports: `Navbar`, `useI18n`
   - Features: Order status tracking, filter/sort by status
   - Responsive: ✅ Yes (table/card layout with status badges)

9. **[app/buyer/order/[id]/confirm/page.tsx](app/buyer/order/[id]/confirm/page.tsx)** - Order delivery confirmation
   - Imports: `Navbar`, `useI18n`
   - Features: Tracking timeline with status indicators, delivery confirmation flow
   - Contains: `TrackingTimeline` component with flex layout
   - Responsive: ✅ Yes (flexbox timeline with responsive text sizing)

### Farmer Pages
10. **[app/farmer/dashboard/page.tsx](app/farmer/dashboard/page.tsx)** - Farmer's listings dashboard
    - Imports: `Navbar`, `ProductCard`, `Link`, `useI18n`
    - Features: My listings display, grid of farmer's products
    - Grid layout: `grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3`
    - Responsive: ✅ Yes (responsive product grid)

11. **[app/farmer/upload/page.tsx](app/farmer/upload/page.tsx)** - Product upload page
    - Imports: `Navbar`, `Image`, `useI18n`
    - Features: Image upload with Cloudinary, product details form, category selector
    - Responsive: ⚠️ **Potential issues**: Complex form with image preview, likely needs mobile-friendly improvements

12. **[app/farmer/orders/page.tsx](app/farmer/orders/page.tsx)** - Farmer's orders page
    - Imports: `Navbar`, `useI18n`
    - Features: Incoming orders, shipping status management
    - Responsive: ✅ Yes (table/card layout)

13. **[app/farmer/settings/page.tsx](app/farmer/settings/page.tsx)** - Farmer settings & bank details
    - Imports: `Navbar`, `useI18n`
    - Features: Bank selection dropdown, account number form, payout verification
    - Responsive: ⚠️ **Potential issues**: Form heavy with dropdown, mobile optimization needed

---

## 🎨 Shared Components Inventory

### 1. **[components/Navbar.tsx](components/Navbar.tsx)** - Main navigation header
```
Usage: Every page imports this
Features:
  - Sticky header with z-40
  - Logo + brand name
  - Nav links (hidden on mobile, show md:flex)
  - Language switcher
  - Auth navigation (sign in/up or profile menu)
Responsive: ✅ Yes
  - Hidden nav on mobile: hidden items-center gap-8 md:flex
  - Flex wrap: gap-4, flex items-center justify-between
```

### 2. **[components/ProductCard.tsx](components/ProductCard.tsx)** - Reusable product card
```
Usage: Used in marketplace, categories, dashboard pages
Features:
  - Image with hover zoom effect
  - Category badge overlay
  - Crop name, quantity, location, price
  - Farmer name, formatted pricing
Responsive: ✅ Yes
  - Image height: fixed h-48
  - Text scalable, hover animation works on touch
```

### 3. **[components/AuthNav.tsx](components/AuthNav.tsx)** - Auth menu in navbar
```
Usage: Part of Navbar component
Features:
  - Sign-in state detection
  - User profile dropdown with role-based dashboard routing
  - Sign-out button
  - Loading skeleton with animate-pulse
Responsive: ✅ Yes
  - Flex layout: gap-2, items-center
  - Dropdown handles outside clicks
```

### 4. **[components/LanguageSwitcher.tsx](components/LanguageSwitcher.tsx)** - Language selector
```
Usage: Part of Navbar component
Features:
  - Select dropdown for language options
  - Custom styling with icon
  - Compact mode prop for navbar positioning
Responsive: ✅ Yes
  - Compact mode adjusts padding
  - Dropdown on all screen sizes
```

---

## 🎯 Component Import Summary by Page

| Page | Components Used | Status |
|------|-----------------|--------|
| Landing | Navbar | ✅ |
| How-it-Works | Navbar | ✅ |
| Categories | Navbar, ProductCard | ✅ |
| Login | LoginForm (local) | ✅ |
| Signup | SignupForm (local) | ✅ |
| Buyer Marketplace | Navbar, ProductCard | ✅ |
| Product Detail | Navbar, Image | ⚠️ |
| Buyer Orders | Navbar | ✅ |
| Order Confirm | Navbar | ✅ |
| Farmer Dashboard | Navbar, ProductCard, Link | ✅ |
| Farmer Upload | Navbar, Image | ⚠️ |
| Farmer Orders | Navbar | ✅ |
| Farmer Settings | Navbar | ⚠️ |

---

## 📱 Responsive Design Analysis

### ✅ Well-Designed for Responsiveness
1. **Navbar**
   - Hidden nav menu on mobile, visible on md and up
   - Flex layout with gap adjustments
   - Sticky positioning works across all devices

2. **Product Grids**
   - Marketplace: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
   - Categories: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
   - Dashboard: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
   - All properly scale from 1 column (mobile) → 2-4 columns (desktop)

3. **Landing Page**
   - Hero: `lg:grid-cols-2` for side-by-side on desktop, stacked on mobile
   - Buttons: `flex-col gap-4 sm:flex-row` for stacked mobile, side-by-side tablet+
   - Max-width constraints: `max-w-7xl` for consistent padding

4. **Tailwind Configuration**
   - Proper theme with responsive color tokens
   - Tap targets: `.tap-target` class ensures `min-height: 56px` for touch devices
   - Focus states: `:focus-visible` with proper outline for accessibility

### ⚠️ Responsive Design Issues Identified

#### 1. **Product Detail Page** ([app/buyer/product/[id]/page.tsx](app/buyer/product/[id]/page.tsx))
   - **Issue**: Heavy form layouts with multiple input fields and stage-based UI
   - **Risk**: Form inputs likely not optimized for mobile screens
   - **Recommendation**: 
     - Add mobile-specific width classes
     - Stack form fields vertically on mobile
     - Use `max-w-md sm:max-w-2xl lg:max-w-4xl` for responsive form widths

#### 2. **Farmer Upload Page** ([app/farmer/upload/page.tsx](app/farmer/upload/page.tsx))
   - **Issue**: Image preview + file input + multiple product fields form
   - **Risk**: Cramped mobile layout, unclear image upload area on small screens
   - **Recommendation**:
     - Add responsive image preview sizing
     - Stack category selector vertically on mobile
     - Use full-width form inputs on mobile
     - Improve touch target sizing for file input button

#### 3. **Farmer Settings Page** ([app/farmer/settings/page.tsx](app/farmer/settings/page.tsx))
   - **Issue**: Bank dropdown + account number form likely lacks mobile optimization
   - **Risk**: Dropdown text overflow, form fields not full-width on mobile
   - **Recommendation**:
     - Make form inputs `w-full` on mobile
     - Add responsive padding for form containers
     - Ensure dropdown doesn't overflow on small screens

#### 4. **Marketplace Search Bar** ([app/buyer/marketplace/page.tsx](app/buyer/marketplace/page.tsx))
   - **Issue**: Search input: `w-full sm:w-64` - becomes full-width on mobile (good) but controls don't flex properly
   - **Note**: Filter buttons flex-wrap correctly, but layout could be tighter on very small screens
   - **Recommendation**: 
     - Consider stacking search and filters on mobile for better UX
     - Use full-width for search on mobile, maintain `sm:w-64` on tablet+

#### 5. **Product Detail - Negotiation Flow**
   - **Issue**: Multiple input fields for units, offer price, location, email
   - **Risk**: Horizontal overflow or compressed fields on mobile
   - **Recommendation**:
     - Ensure all inputs are `w-full` on mobile
     - Consider collapsible sections for transport options and payment on mobile
     - Use `space-y` utilities for mobile vs desktop spacing

#### 6. **Order Confirmation Page** ([app/buyer/order/[id]/confirm/page.tsx](app/buyer/order/[id]/confirm/page.tsx))
   - **Issue**: TrackingTimeline component uses `flex items-center justify-between` - could compress on very small screens
   - **Risk**: Timeline labels might wrap or overlap on mobile
   - **Recommendation**:
     - Add responsive text sizing (`text-xs sm:text-sm`)
     - Consider vertical layout on mobile instead of horizontal timeline
     - Add `flex-wrap` or `flex-col` for mobile breakpoint

---

## 🎨 Design Tokens & Styling

### Color Palette
- **Primary**: Forest (#16342A) - trust, growth
- **Accent**: Harvest (#E4A335) - grain, energy
- **Secondary**: Clay (#7A4B2E) - soil, transport
- **Background**: Parchment (#F6F1E7) - clean, natural
- **Trust/Escrow**: Sky (#2E6E8E)
- **Text**: Ink (#1B1B16)

### Typography
- **Display**: Fraunces (serif) - headlines
- **Body**: Inter (sans-serif) - body text
- **Mono**: IBM Plex Mono (monospace) - prices, codes

### Spacing & Radius
- Border radius: xl (1rem), 2xl (1.5rem)
- Box shadow: soft (0 8px 30px with 8% opacity)
- Responsive padding: `px-5` (mobile base), scales with container

### Accessibility Features
- ✅ `tap-target` class for 56px minimum touch targets
- ✅ Focus visible with 3px outline and 2px offset
- ✅ Respects `prefers-reduced-motion`
- ✅ Proper semantic HTML with `aria-hidden` for decorative elements
- ✅ `sr-only` for screen reader text

---

## 📊 Page Structure Patterns

### Common Layout Pattern
```
<main className="min-h-screen bg-parchment">
  <Navbar />
  <section className="mx-auto max-w-7xl px-5 py-[12-24]">
    {/* content */}
  </section>
</main>
```

### State Management
- **Client-side**: `useState` for local state
- **API calls**: `useEffect` for data fetching
- **Auth**: Supabase client with session checking
- **Fallback**: Demo data when Supabase not configured

---

## ⚡ Recommendations Summary

### High Priority (Mobile UX)
1. ✏️ Product Detail form - needs mobile-optimized input layout
2. ✏️ Farmer Upload form - image preview and input sizing
3. ✏️ Farmer Settings form - dropdown and input responsiveness
4. ✏️ Order Confirmation timeline - could be vertical on mobile

### Medium Priority
1. 🔍 Marketplace controls - consider stacking on mobile
2. 📝 Form fields across all pages - ensure `w-full` on mobile
3. 🎨 Loading states - verify skeleton heights on mobile

### Nice to Have
1. 📱 Portrait mode orientation handling
2. 🔄 Tablet-specific optimizations (between sm and lg)
3. 📲 Bottom navigation for mobile (considering app-like UX)

---

## 🔍 Audit Checklist

- [x] All pages found and documented
- [x] Component imports mapped
- [x] Responsive classes identified
- [x] Design tokens extracted
- [x] Accessibility features noted
- [x] Potential issues highlighted
- [x] Recommendations provided
