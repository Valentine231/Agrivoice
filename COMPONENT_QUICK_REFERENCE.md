# AgriLink Component & Page Quick Reference

## 📋 All Pages at a Glance

```
app/
├── page.tsx                                    ✅ Landing (Navbar, Responsive)
├── how-it-works/page.tsx                       ✅ How it works (Navbar, Cards)
├── categories/page.tsx                         ✅ Categories (Navbar, ProductCard, grid-cols-1/2/4)
├── login/page.tsx                              ✅ Login (LoginForm)
├── signup/page.tsx                             ✅ Signup (SignupForm)
├── buyer/
│   ├── marketplace/page.tsx                    ✅ Marketplace (Navbar, ProductCard, Filters)
│   ├── product/[id]/page.tsx                   ⚠️  Product Detail (Heavy forms, mobile issues)
│   ├── orders/page.tsx                         ✅ Orders list (Navbar, Status badges)
│   └── order/[id]/confirm/page.tsx             ✅ Delivery confirm (Timeline, Responsive)
└── farmer/
    ├── dashboard/page.tsx                      ✅ Dashboard (Navbar, ProductCard, grid)
    ├── upload/page.tsx                         ⚠️  Upload form (Image + fields, mobile issues)
    ├── orders/page.tsx                         ✅ Orders (Navbar, Status management)
    └── settings/page.tsx                       ⚠️  Settings (Bank form, mobile issues)
```

## 🧩 Shared Components

```
components/
├── Navbar.tsx                    ★ Used on EVERY page
│   ├── Sticky header with z-40
│   ├── Logo & brand
│   ├── Nav links: hidden md:flex
│   ├── LanguageSwitcher
│   └── AuthNav (sign-in/menu)
│
├── ProductCard.tsx               ★ Used on marketplace, categories, dashboard
│   ├── Image with hover zoom
│   ├── Category badge overlay
│   ├── Price, location, farmer name
│   └── Link to product detail page
│
├── AuthNav.tsx                   (part of Navbar)
│   ├── Sign-in state detection
│   ├── Profile dropdown
│   └── Role-based dashboard routing
│
└── LanguageSwitcher.tsx          (part of Navbar)
    └── Language select dropdown
```

## 📱 Responsive Breakpoints

### Tailwind Breakpoints Used
- `sm: 640px` - tablets, small devices
- `md: 768px` - medium tablets, small laptops
- `lg: 1024px` - desktops

### Key Responsive Patterns

#### Grid Layouts
- **Marketplace**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (1→2→3 cols)
- **Categories**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (1→2→4 cols)
- **Dashboard**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (1→2→3 cols)

#### Flex Layouts
- **Button groups**: `flex-col gap-4 sm:flex-row` (stacked→horizontal)
- **Nav**: hidden on mobile, `md:flex` on tablet+
- **Hero**: `lg:grid-cols-2` (stacked→side-by-side)

#### Container Widths
- Mobile: `px-5` padding
- Max-width: `max-w-7xl` (1280px) for main content
- Forms: `max-w-md` to `max-w-4xl` depending on page

---

## ⚠️ Responsive Issues Found

### 🔴 HIGH PRIORITY - Mobile UX Problems

#### 1. Product Detail Page `/buyer/product/[id]/page.tsx`
   - **Problem**: Multi-stage form (browse → negotiate → transport → pay)
   - **Mobile issue**: Form inputs likely not full-width, cramped layout
   - **Fix**: Add responsive form container + input widths
   ```css
   /* Needed */
   max-w-md sm:max-w-2xl lg:max-w-4xl
   w-full on mobile for inputs
   ```

#### 2. Farmer Upload Page `/farmer/upload/page.tsx`
   - **Problem**: Image preview + category selector + product form
   - **Mobile issue**: Image preview sizing unclear, inputs cramped
   - **Fix**: Responsive image sizing + full-width inputs
   ```css
   /* Needed */
   h-32 sm:h-48 lg:h-64 for image preview
   w-full px-4 for inputs on mobile
   ```

#### 3. Farmer Settings Page `/farmer/settings/page.tsx`
   - **Problem**: Bank dropdown + account number form
   - **Mobile issue**: Dropdown text overflow, form not full-width
   - **Fix**: Dropdown responsiveness + input sizing
   ```css
   /* Needed */
   w-full on mobile selects/inputs
   max-w-md container
   ```

#### 4. Order Confirmation Timeline `/buyer/order/[id]/confirm/page.tsx`
   - **Problem**: Horizontal timeline with 3 steps
   - **Mobile issue**: Labels wrap or compress on small screens
   - **Fix**: Conditional layout based on screen size
   ```css
   /* Currently */
   flex items-center justify-between
   /* Needed */
   flex-col sm:flex-row on mobile
   text-xs sm:text-sm for responsive text
   ```

### 🟡 MEDIUM PRIORITY - Minor UX Issues

#### 5. Marketplace Search + Filters `/buyer/marketplace/page.tsx`
   - **Current**: Search is `w-full sm:w-64`
   - **Issue**: Filters and search on same row might be tight on mobile
   - **Recommendation**: Stack on mobile `flex-col sm:flex-row`

---

## ✅ Well-Implemented Features

### Mobile-Friendly
- ✅ Navbar navigation hidden on mobile, visible on md+
- ✅ Product grids scale from 1→2→3/4 columns
- ✅ Button groups stack vertically on mobile
- ✅ Hero section responsive with lg:grid-cols-2
- ✅ Touch targets: 56px minimum height (`.tap-target` class)

### Accessibility
- ✅ Focus visible with 3px outline
- ✅ Screen reader text with `sr-only`
- ✅ Semantic HTML with `aria-hidden` for decorative elements
- ✅ Respects `prefers-reduced-motion`
- ✅ Proper alt text for images

### Design Consistency
- ✅ Custom color palette (forest, harvest, clay, parchment, sky, ink)
- ✅ Consistent typography (Fraunces, Inter, Plex Mono)
- ✅ Soft box shadows across components
- ✅ Rounded corners (xl: 1rem, 2xl: 1.5rem)
- ✅ Proper spacing with px-5 base padding

---

## 📐 Component Usage Matrix

| Component | Landing | Auth | Marketplace | Categories | Farmer | Orders | Detail |
|-----------|---------|------|-------------|-----------|--------|--------|--------|
| Navbar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ProductCard | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| AuthNav | (in Navbar) | (in Navbar) | (in Navbar) | (in Navbar) | (in Navbar) | (in Navbar) | (in Navbar) |
| LanguageSwitcher | (in Navbar) | (in Navbar) | (in Navbar) | (in Navbar) | (in Navbar) | (in Navbar) | (in Navbar) |

---

## 🎨 Design Token Reference

### Colors
```
Forest:     #16342A (primary - trust, growth)
  Light:    #20493C
  Dark:     #0E241C

Harvest:    #E4A335 (accent - grain, energy)
  Light:    #F0BE63
  Dark:     #B87F1F

Clay:       #7A4B2E (secondary - soil, transport)
  Light:    #96613D

Parchment:  #F6F1E7 (background)
  Dim:      #EFE8D8

Sky:        #2E6E8E (trust, escrow)
  Light:    #3F8AB0

Ink:        #1B1B16 (text)
```

### Typography
- **Display**: Fraunces (serif) - headlines
- **Body**: Inter (sans-serif) - text content
- **Mono**: IBM Plex Mono (monospace) - prices, codes

### Spacing
- Base padding: `px-5` (1.25rem)
- Gap between items: `gap-4` to `gap-12`
- Vertical padding: `py-12` to `py-24`
- Container max-width: `max-w-7xl` (1280px)

---

## 🚀 Next Steps for Mobile Optimization

### Phase 1: Critical Form Pages
1. [ ] Optimize `/buyer/product/[id]/page.tsx` form layout
2. [ ] Optimize `/farmer/upload/page.tsx` image preview + form
3. [ ] Optimize `/farmer/settings/page.tsx` form spacing

### Phase 2: Timeline & Complex UI
1. [ ] Make `/buyer/order/[id]/confirm/page.tsx` timeline mobile-friendly
2. [ ] Test all forms on actual mobile devices
3. [ ] Verify tap targets are 56px minimum

### Phase 3: Polish
1. [ ] Add tablet-specific optimizations (sm to lg breakpoints)
2. [ ] Test landscape orientation
3. [ ] Verify all interactive elements are accessible

---

## 📝 File Locations

**Main Files**: 
- Pages: `/app/**/*.tsx` 
- Components: `/components/*.tsx`
- Styles: `/app/globals.css`, `/tailwind.config.ts`
- Database types: `/lib/database.types.ts`
- Utilities: `/lib/i18n.tsx`, `/lib/mockData.ts`, `/lib/products.ts`

**API Routes**:
- `/app/api/cloudinary/sign/route.ts` - Image upload signing
- `/app/api/paystack/*/route.ts` - Payment integration
- `/app/api/demo-products/route.ts` - Demo data endpoint
