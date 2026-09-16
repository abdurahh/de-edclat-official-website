# De Eclat — Context

Short log of major changes and planned work.

## Agent Chat — Site Build & UI

| Topic | Summary |
|-------|---------|
| **Stack** | Next.js App Router, Tailwind, GSAP (ScrollTrigger), Framer Motion, `next/image`. |
| **Brand** | Pearl/ruby palette, Pinyon Script + Playfair Display per `design.md`. |
| **Homepage** | Hero, collection grid, services, presence, ruby CTA; scroll reveals on sections. |
| **Collection images** | `necklace-cover.jpeg`, `watch-cover.jpeg`, `precious-stone.jpeg` on product cards. |
| **15+ counter** | `AuthorityCounter` — GSAP count 0→15, then `+` fades in. |
| **City ticker** | `TradingCitiesTicker` — vertical GSAP loop (HK, Tokyo, Bangkok, etc.); fixed inline-block layout bug. |
| **Hero copy** | Eyebrow **Hong Kong only** (removed “/ Tokyo”). |
| **Text clipping** | No GSAP `clip-path` on text blocks; `.card-shell` / `.card-media`; `.section-eyebrow` / `.caps-label` padding. |
| **CTA button** | “Contact Us” ruby text on pearl (removed global `a { color: inherit }` conflict). |
| **Nav Inquire** | `.nav-cta` spacing for pill button letter-spacing. |
| **Contact sidebar** | HK phone + `deeclat@gmail.com` only (Japan, addresses, DIALUSTER card removed). |

## Later Updates (same repo)

| Topic | Summary |
|-------|---------|
| **GitHub** | Pushed to `https://github.com/abdurahh/deeclat` (`.gitignore` for `.next`, `node_modules`, `.env*.local`). |
| **Collection routes** | `/collection/jewelry`, `/watch`, `/precious-stone` — Coming Soon pages; cards link from home. |
| **Inquiry API** | `POST /api/inquiry` via Resend; env in `.env.example`. |
| **Homepage** | HK-only presence card; footer copyright; metadata HK-focused. |

## Future Plans

- Replace Coming Soon collection pages with real content.
- Verify Resend domain; set production `FROM` / `TO` emails.
- Deploy (e.g. Vercel) with env vars.
- Optional: drop Tokyo from city ticker if messaging stays HK-only; visitor auto-reply email.
- Swap hero/location SVG placeholders for final photography when available.

## Key Paths

`app/page.tsx` · `app/contact/page.tsx` · `app/collection/[category]/page.tsx` · `app/api/inquiry/route.ts` · `components/` · `design.md` · `Readme.md`
