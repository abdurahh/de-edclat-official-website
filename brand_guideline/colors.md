# De Eclat — Color

The palette translates business-card materials: pearl cardstock, ruby ink, and charcoal typesetting.

---

## Core palette

| Name | Hex | RGB | Role |
|------|-----|-----|------|
| **Pearl** | `#FDFBF7` | 253, 251, 247 | Primary background, “cardstock” |
| **Ruby** | `#B31B1B` | 179, 27, 27 | Brand accent, script logo, CTAs, selection |
| **Charcoal** | `#333333` | 51, 51, 51 | Primary text, display headings |
| **Slate** | `#666666` | 102, 102, 102 | Secondary text, captions |

---

## Extended palette (UI)

| Name | Hex | Use |
|------|-----|-----|
| **Champagne** | `#F6EFE6` | Warm panels, subtle fills |
| **Mist** | `#F9F3ED` | Soft section backgrounds |
| Pearl at 70% opacity | `bg-pearl/70` | Glass nav, overlays |
| Ruby at 10–20% opacity | borders, hovers | `border-ruby/10`, `border-ruby/20` |

Defined in `tailwind.config.js` as `pearl`, `ruby`, `charcoal`, `slate`, `champagne`, `mist`.

---

## Usage rules

### Backgrounds

- Default page: pearl with diamond-grid texture (&lt; 5% effective opacity).
- Never use pure `#FFFFFF` as the main canvas—it reads colder than brand pearl.
- Dark photography: overlay `bg-pearl/20` or stronger pearl gradient for legibility.

### Ruby accent

- Primary brand mark, eyebrows, key CTAs, text links on pearl backgrounds.
- Hover: solid ruby fill with pearl text on buttons (`hover:bg-ruby hover:text-pearl`).
- Avoid large solid ruby fields without pearl/champagne text.

### Text

- Headlines (Playfair): charcoal.
- Body: slate or charcoal; prefer slate for long paragraphs.
- On ruby buttons/panels: pearl text only.

---

## Contrast (WCAG-oriented)

| Pair | Notes |
|------|--------|
| Charcoal on pearl | ✓ Body text |
| Slate on pearl | ✓ Secondary; avoid for small critical UI |
| Ruby on pearl | ✓ Large text & logos; check if below 18px bold |
| Pearl on ruby | ✓ Buttons, selection highlight |

---

## Diamond grid pattern

- Ruby at **~3.5% opacity** in CSS (`rgba(179, 27, 27, 0.035)`).
- Tile size: **36px** (see `app/globals.css`).
- Asset: `assets/patterns/diamond-grid-pattern.svg`.

---

## CSS & Tailwind

```css
/* design-tokens.css */
--color-pearl: #fdfbf7;
--color-ruby: #b31b1b;
--color-charcoal: #333333;
--color-slate: #666666;
```

```html
<!-- Tailwind examples -->
<div class="bg-pearl text-charcoal">...</div>
<p class="text-slate">Secondary copy</p>
<a class="text-ruby">Link</a>
```

---

## Do not

- Introduce gold, black, or bright blues as competing brand colors.
- Use ruby for full-page backgrounds except intentional campaign hero strips.
- Gradient logos or rainbow treatments on the mark.

---

## Related

- `design-elements.html` — swatches
- `logo-usage.md` — logo color variants
