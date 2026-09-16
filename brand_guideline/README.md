# De Eclat — Brand guideline

Central folder for brand assets, design tokens, and usage documentation for the De Eclat luxury jewelry &amp; watch promotion brand.

---

## Quick start

1. **Visual overview** — Open [`design-elements.html`](design-elements.html) in a browser (colors, type, logos, UI samples).
2. **Typography** — Read [`typography.md`](typography.md) before choosing fonts on any new material.
3. **Logos** — Use files from [`logos/`](logos/) only; follow [`logo-usage.md`](logo-usage.md).

---

## Folder structure

```
brand_guideline/
├── README.md                 ← You are here
├── design-elements.html      ← Interactive design system preview
├── design-tokens.css         ← CSS variables (portable)
├── typography.md             ← Fonts: where / how / sizes
├── colors.md                 ← Palette & contrast
├── logo-usage.md             ← Logo rules & inventory
├── voice-and-tone.md         ← Copy style
├── spacing-and-layout.md     ← Grid, cards, motion
├── photography-and-imagery.md
├── contact-information.md    ← Approved addresses & phones
├── logos/
│   ├── icon/
│   │   └── deeclat-icon-primary.svg
│   ├── wordmark/
│   │   ├── deeclat-wordmark-script-ruby.svg
│   │   ├── deeclat-wordmark-script-charcoal.svg
│   │   ├── deeclat-wordmark-script-pearl.svg
│   │   └── deeclat-wordmark-display-serif.svg
│   ├── lockup/
│   │   └── deeclat-lockup-horizontal-ruby.svg
│   └── monochrome/           ← Reserved for future mono exports
└── assets/
    ├── patterns/
    │   └── diamond-grid-pattern.svg
    └── samples/              ← Place campaign samples here
```

---

## Relationship to the website

| Brand guideline | Website source |
|-----------------|----------------|
| `design-tokens.css` | `tailwind.config.js`, `app/globals.css` |
| Typography doc | `app/layout.tsx` (Google Fonts) |
| Colors | `pearl`, `ruby`, `charcoal`, `slate` in Tailwind |
| Design brief | `../design.md` |

When the site changes, update this folder and `design.md` together.

---

## Logo source file

The primary icon was supplied as `brand_asstes/DEECLAT_ICON.svg` and normalized to:

`logos/icon/deeclat-icon-primary.svg`

The master is a high-resolution raster embedded in SVG (~1.3MB). For favicons and small UI, export PNGs at 32 / 180 / 512 px from this file. A lighter vector icon may be added later under `logos/icon/`.

---

## Naming convention

All logo files use lowercase kebab-case with the `deeclat-` prefix:

- `deeclat-{asset-type}-{variant}.svg`
- Examples: `deeclat-wordmark-script-ruby.svg`, `deeclat-icon-primary.svg`

---

## Adding assets

1. Place new masters in the correct `logos/` subfolder.
2. Document in `logo-usage.md`.
3. Add a specimen to `design-elements.html` if it affects the public design system.

---

## Contact

See [`contact-information.md`](contact-information.md) for Hong Kong and Tokyo details as printed on the business card.
