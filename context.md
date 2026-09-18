# De Eclat — Context Log

Keep this file **small**. Each chat: add a short dated section (bullets only). Do not paste full transcripts.

---

## 2026-09-18 — Brand loading screen

- Full-screen pearl intro: ruby Deeclat icon + thin ruby progress ring
- Runs on **every route change** (home, watch/jewelry, detail) via `useLayoutEffect`; skipped on `/admin`
- No session skip — loader returns on each navigation
- Waits until page `<img>` set stabilizes (`waitForPageImages` + eager product/cover images) so full-page scroll doesn’t re-fetch
- Pre-hydration shell in layout + `data-intro`; do not `remove()` shell DOM (breaks React)
- Web icon: `public/brand/deeclat-icon-primary.svg` (optimized vector)
- Paths: `components/BrandLoader.tsx` · `lib/preload-assets.ts` · `app/layout.tsx` · `app/globals.css` · `CollectionProductCard.tsx` · `ProductCard.tsx` · `ProductDetailView.tsx`

---

## 2026-09-18 — Collection UI + mobile nav icons

- **Home category cards** (`ProductCard`): charcoal Deeclat icon above ruby line (`/brand/deeclat-icon-charcoal.svg` from editable mark)
- **Collection product cards:** full mist panel + light `rounded-lg`; image `aspect-[4/5]`; tighter mobile type/padding
- **Collection grid:** `grid-cols-2` mobile → `lg:grid-cols-3` (peek next row on ~640×915); was filling viewport at 1-col
- **Header nav text:** charcoal semibold + ruby hover
- **Mobile nav ≤455px** (`screens.nav: 456px`): centered icon-only Watch / Jewelry; ≥456px text labels
- **Icons:** `/icons/watch.png` · `/icons/jewelry-ring.png` via CSS mask; size ~20px; default **ruby**, hover **charcoal**
- Paths: `ProductCard.tsx` · `CollectionProductCard.tsx` · `app/collection/[category]/page.tsx` · `SiteHeader.tsx` · `tailwind.config.js` · `public/brand/` · `public/icons/`

---

## 2026-09-18 — Favicon (ruby icon) + jewelry Weight

- **Tab favicon:** ruby Deeclat icon (cropped, transparent) via Next.js `app/icon.png` + `app/apple-icon.png`; also `public/favicon.png` · `public/brand/deeclat-icon.png` (+512)
- **Editable vector:** Affinity-ready SVG at `brand_asstes/DEECLAT_ICON-editable.svg` (and `brand_guideline/logos/icon/deeclat-icon-editable.svg`) — old SVGs were raster-in-SVG only
- **Jewelry Weight:** merged Material/metal + Carat weight → single `details.weight` labeled **Weight**; legacy `material` / `carat_weight` still display via `formatJewelryWeight`
- Paths: `app/icon.png` · `public/brand/` · `lib/types/product.ts` · `ProductDetailView.tsx` · `AdminDashboard.tsx` · `CollectionProductCard.tsx`

---

## 2026-09-18 — Jewelry multi-stone details

- Jewelry `details.stones[]`: each `{ name, size?, quantity? }` (quantity = optional No.)
- Admin: add/remove stone rows under Jewelry details; legacy `gemstones` string still reads on public pages
- Public detail + collection card show structured stones
- Paths: `lib/types/product.ts` · `components/admin/AdminDashboard.tsx` · `ProductDetailView.tsx` · `CollectionProductCard.tsx`

---


## 2026-09-16/17 — Catalog + deploy (this chat)

| Item | Detail |
|------|--------|
| **Supabase** | New project `deeclat-website` (`pebhgixlwwsxtoqnkxei`, ap-southeast-1); `products` table + RLS + `product-images` bucket; admin via `app_metadata.role = admin` |
| **Admin** | `/admin` + `/admin/login` — CRUD, multi-image upload, deactivate/delete |
| **Public pages** | `/collection/watch` & `/collection/jewelry` fetch active products; detail pages + WhatsApp inquire; empty state → contact; removed precious-stone |
| **Vercel** | Project `deeclat-website`; env vars (Supabase, Resend, WhatsApp); GitHub `abdurahh/de-edclat-official-website` |
| **Domain** | `deeclat.com` + `www` from GoDaddy → Vercel (A + CNAME); SSL issued |
| **Contact/UI** | Email `hello@deeclat.com`; phone `+852 6142 6130`; mobile nav layout fixed |
| **Live** | `https://deeclat.com` |

### Key paths
`app/admin/` · `app/collection/` · `lib/supabase/` · `lib/products.ts` · `supabase/migrations/` · `components/admin/` · `proxy.ts`

---

## 2026-09-17 — GitHub, HK-only, Coming Soon, Resend (this chat)

- **GitHub:** initial commit + push to `abdurahh/deeclat`; `.gitignore` added
- **HK-only:** removed Tokyo/Japan card; hero + metadata Hong Kong only; Presence centered single HQ card
- **Coming Soon:** `/collection/jewelry` · `/watch` · `/precious-stone` placeholders; collection cards link there
- **Resend:** inquire form → `POST /api/inquiry`; env `RESEND_*`; fixed native form submit + test-mode TO email
- **Footer:** © year De Eclat. All rights reserved.
- **Future:** full collection pages · verify Resend domain · Vercel env for production mail

---

## 2026-09-17 — Admin auth / password

| Item | Detail |
|------|--------|
| **Problem** | Couldn’t log in; recovery email pointed at `localhost:3000`; then `email rate limit exceeded` |
| **Cause** | Wrong/forgotten password; Auth **Site URL** still localhost; too many recovery emails |
| **Admin user** | `hello@deeclat.com` · `app_metadata.role = admin` · project `pebhgixlwwsxtoqnkxei` |
| **Temp password** | Set in Supabase Auth (rotated locally; do not store in git) |
| **Auth gate** | Login / proxy / admin page require `app_metadata.role === "admin"` (not `user_metadata`) |
| **Added** | `/auth/callback` · `/admin/reset-password` · reset route allowed in proxy |
| **Deployed** | Production `https://deeclat.com` |
| **Still TODO** | In Supabase → Auth → URL Configuration: Site URL `https://deeclat.com/auth/callback`; Redirect URLs `https://deeclat.com/**` and `http://localhost:3000/**` |
| **Note** | Built-in SMTP rate-limits recovery emails (~few/hour). Wait or use custom SMTP. |

### How to sign in now
1. `/admin/login` with email + current Supabase Auth password  
2. Or set a new password in Supabase Auth → Users → that user  

### Key paths
`components/admin/AdminLoginForm.tsx` · `lib/supabase/proxy.ts` · `app/auth/callback/route.ts` · `app/admin/reset-password/` · `supabase/migrations/`

---

## Earlier (condensed)

- **Stack:** Next.js App Router, Tailwind, GSAP, Framer Motion, Supabase, Resend  
- **Brand:** Pearl/ruby; Pinyon + Playfair + Montserrat  

### Key paths
`app/page.tsx` · `app/contact/` · `design.md` · `Readme.md`
