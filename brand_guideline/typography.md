# De Eclat — Typography

Typography carries the “Old World” luxury of the physical business card into digital. Three roles—script, display serif, and sans—must never be mixed arbitrarily.

---

## Font stack (canonical)

| Role | Primary | Fallback | CSS variable (site) |
|------|---------|----------|---------------------|
| Script / brand mark | **Pinyon Script** | Great Vibes, cursive | `--font-pinyon` |
| Display / headings | **Playfair Display** | Prata, Georgia, serif | `--font-playfair` |
| Body / UI | **Montserrat** | Lato, system-ui, sans-serif | `--font-montserrat` |

**Source:** Google Fonts (loaded in `app/layout.tsx`).

---

## 1. Pinyon Script — brand script

**Purpose:** The “De Eclat” wordmark and hero brand expression only. Mimics Spencerian script on the business card.

### Where to use

| Use | Yes | No |
|-----|-----|-----|
| Main logo text (“De Eclat”) in nav, hero, footer brand line | ✓ | |
| Large hero headline (single brand name) | ✓ | |
| Body paragraphs | | ✗ |
| Form labels, buttons, legal text | | ✗ |
| Long subheadings or quotes | | ✗ |
| ALL CAPS | | ✗ |

### Sizes (web)

| Context | Size | Line height | Color |
|---------|------|-------------|-------|
| Navigation logo | `text-3xl` (~1.875rem) | `leading-none` | Ruby `#B31B1B` |
| Hero brand | `text-[5rem]` → `10rem` responsive | `leading-[0.85]` | Ruby |
| Footer / small brand | `text-2xl`–`text-3xl` | tight | Ruby or charcoal |

### Rules

- One script headline per viewport section maximum.
- Never set letter-spacing on script (natural flow only).
- Minimum contrast: ruby on pearl, or pearl on ruby/dark photography with overlay.

---

## 2. Playfair Display — display serif

**Purpose:** Section titles, editorial subheads, product/category titles, and pull quotes. High-contrast serif echoing Art Deco card typography.

### Where to use

| Use | Yes | No |
|-----|-----|-----|
| Section H2 (“The Collection”, “Bespoke Services”) | ✓ | |
| Hero supporting line (one sentence under script logo) | ✓ | |
| Product card titles | ✓ | |
| Body copy blocks | | ✗ |
| Navigation links | | ✗ |
| Form fields | | ✗ |

### Sizes & weights

| Level | Typical classes | Weight |
|-------|-----------------|--------|
| Hero subline | `text-3xl` → `text-5xl`, `leading-tight` | 400–500 |
| Section title | `text-4xl` → `text-6xl` | 500–600 |
| Card title | `text-2xl` → `text-3xl` | 500 |

### Rules

- Pair with generous whitespace; avoid stacking more than two display lines without a sans break.
- Color: charcoal `#333333` on pearl; pearl on ruby panels.

---

## 3. Montserrat — body & UI sans

**Purpose:** Readable body text, metadata, navigation (uppercase labels), forms, captions, and functional UI.

### Where to use

| Use | Yes | No |
|-----|-----|-----|
| Paragraphs, lists, form inputs | ✓ | |
| Eyebrows / section labels (uppercase) | ✓ | |
| Nav items, buttons, pills | ✓ | |
| Phone numbers and addresses | ✓ | |
| Brand script wordmark | | ✗ |
| Main editorial headlines | | ✗ (use Playfair) |

### Sizes & weights

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Body | `text-base` (16px), `leading-8` | 400 | Color slate `#666666` or charcoal |
| Small / meta | `text-xs`–`text-sm` | 500–600 | Uppercase + tracking (see below) |
| Button / CTA | `text-xs`–`text-sm` | 600 | Uppercase |

---

## Uppercase & letter-spacing (caps system)

Luxury editorial nav and eyebrows use **uppercase Montserrat** with explicit tracking so glyphs do not clip.

| Token | Letter-spacing | Example use |
|-------|----------------|-------------|
| `caps-28` | `0.28em` | Nav: Collection, Services, Presence |
| `caps-45` / section eyebrow | `0.45em` | “Hong Kong”, section intros |
| Nav CTA “Inquire” | `0.22em` + `text-indent` match | Pill button |

**Implementation:** `.caps-label` + `.caps-28` etc. in `app/globals.css`. Always add horizontal padding (`padding-inline`) equal to or greater than half the tracking value.

---

## Type scale reference

```
Hero script     clamp(5rem, 12vw, 10rem)
Display XL      3rem – 3.75rem (48–60px)
Display L       2.25rem – 3rem
Body            1rem (16px), line-height 2 (32px)
Small / UI      0.75rem – 0.875rem (12–14px)
```

---

## Pairing examples

1. **Home hero:** Eyebrow (Montserrat caps, ruby) → “De Eclat” (Pinyon, ruby) → tagline (Playfair, charcoal) → body (Montserrat, slate).
2. **Collection card:** Eyebrow (Montserrat caps) → title (Playfair) → optional link (Montserrat uppercase).
3. **Contact:** Page title (Pinyon or Playfair per layout) → form labels (Montserrat caps) → inputs (Montserrat regular).

---

## Print & export

- SVG wordmarks in `logos/wordmark/` reference Pinyon Script / Playfair by name. For print PDFs, **outline fonts** or embed subsets to avoid substitution.
- Prefer provided SVG wordmarks over re-typing the brand name in desktop apps.

---

## Accessibility

- Minimum body size 16px on web.
- Script logo is decorative at large sizes; ensure page `<title>` and one plain-text “De Eclat” exist for screen readers (e.g. nav link text).
- Do not use slate `#666666` for critical actions alone; pair with weight or ruby accent.

---

## Related files

- `design-elements.html` — live specimens
- `design-tokens.css` — CSS variables
- `../tailwind.config.js` — `fontFamily` theme extension
- `../design.md` — project design brief
