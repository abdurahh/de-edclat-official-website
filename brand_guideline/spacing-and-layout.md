# De Eclat — Spacing & layout

Luxury is communicated through **breathable layouts**, not density.

---

## Grid & width

- Content max width: **`max-w-7xl`** (80rem / 1280px) centered.
- Horizontal padding: **`px-5`** mobile, increase on large breakpoints as needed.
- Section vertical rhythm: **`py-24`** to **`py-32`** (or `clamp` via `--space-section-y`).

---

## Cards

| Token | Value |
|-------|--------|
| Outer radius | `rounded-[2.5rem]` |
| Inner radius | `rounded-[2rem]` |
| Padding | `p-10` inner content typical |
| Shadow | `shadow-soft` default, `shadow-jewel` for ruby-accent panels |

**Rule:** Clip images only (`.card-media`), never clip typography (`.card-shell`).

---

## Navigation

- Fixed top bar, pill shape: `rounded-full`, `backdrop-blur-2xl`, `bg-pearl/70`.
- Nav CTA “Inquire”: extra letter-spacing via `.nav-cta` (see `typography.md`).

---

## Collection grid

- Asymmetric vertical offsets on large screens (`lg:mt-14`, `lg:mt-24`) for editorial rhythm.
- Image hover: `scale-105`, duration **500–700ms**, ease-in-out.

---

## Motion

| Duration | Use |
|----------|-----|
| 220ms | Form focus, micro UI |
| 500ms | Image hover, standard transitions |
| 700ms | Hero reveals, scroll animations (GSAP) |

Avoid bouncy or playful easing; prefer smooth luxury ease.

---

## Whitespace checklist

- [ ] One primary focal point per section
- [ ] Script logo not competing with multiple display headlines
- [ ] Caps eyebrows have padding-inline so letters don’t clip
- [ ] Footer separated with ample top margin

---

## Related

- `design-elements.html` — component specimens
- `design-tokens.css` — spacing variables
