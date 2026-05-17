# De Eclat - AI Design & Development Guide

## 1. Project Overview
**Brand:** De Eclat 
**Type:** Luxury Brand & Service Promotion Website (Non-e-commerce).
**Industry:** Jewelry, Watches, Diamonds.
**Locations:** Hong Kong (Jordan) and Tokyo, Japan.
**Core Objective:** Replicate the "Old World" luxury and elegant geometry of the physical business card into a digital experience.

## 2. Visual Identity & Styling

### Color Palette
Use these color variables in the CSS/Tailwind configuration:
* **Background (Primary):** `#FDFBF7` (Pearl White/Eggshell) - Keeps the site airy and resembles luxury cardstock.
* **Accent (Brand):** `#B31B1B` (Deep Crimson/Ruby Red) - Used for primary headings, the main logo text, and subtle hover states.
* **Text (Primary):** `#333333` (Charcoal) - For high-readability body text.
* **Text (Secondary):** `#666666` (Slate Grey) - For secondary information and captions.

### Typography (Google Fonts Integration)
* **Logo / Hero Script:** `Pinyon Script` or `Great Vibes`.
    * *Usage:* Strictly for the "De Eclat" main brand mark to match the Spencerian script on the business card.
* **Display / Headings:** `Playfair Display` or `Prata` (High-contrast Serif).
    * *Usage:* For section titles, sub-brands (e.g., "DIALUSTER INC.", "Hiba"), and block quotes. Mimics the Art Deco serif from the card.
* **Body / UI Text:** `Montserrat` or `Lato` (Clean Sans-Serif).
    * *Usage:* For addresses, contact info, paragraphs, and functional UI elements.

### Graphic Elements & Textures
* **Diamond Grid Background:** Implement a faint, geometric diamond-grid pattern (similar to the card's watermark) as a fixed background. Opacity should be strictly `< 5%` so it provides texture without distraction.
* **White Space:** Emphasize generous padding and margins. Luxury is communicated through uncrowded, breathable layouts.

## 3. Page Structure & Components

### Hero Section
* **Visual:** Full-viewport height (`min-h-screen`). A high-resolution, slow-moving video or crisp image of a diamond or luxury timepiece.
* **Overlay:** Center the "De Eclat" logo in the Deep Crimson script font.

### The Collection (Gallery)
* **Layout:** Asymmetrical or masonry grid.
* **Interaction:** Subtle `hover:scale-105` on images with a slow ease-in-out transition. Minimal text; let the product photography stand out.

### Bespoke Services
* **Content:** Sections detailing diamond cutting, private viewings, and watch servicing. Use the High-contrast Serif for these subheadings.

### Heritage & Presence
* **Content:** Highlight the dual headquarters to establish international credibility. Use clean, monochrome maps or elegant architectural shots of Hong Kong and Tokyo.

## 4. Contact Page Specifications (CRITICAL)
The contact page must function as an exclusive invitation.

* **Inquiry Form:**
    * A clean HTML form strictly for email inquiries.
    * Include a dropdown for "Subject of Interest" (e.g., Diamonds, Watch Servicing, Bespoke Jewelry, Private Appointment).
* **Phone Numbers (Strict Display Rules):**
    * Display the numbers clearly: `+852-6097 0143` (HK) and `+81-3-6421-8885` (Japan).
    * **Rule:** Provide the numbers as plain text. Do NOT wrap them in `tel:` or `wa.me:` links for direct texting/calling. The user must manually dial or save the number.
* **Locations:** * List the complete addresses exactly as printed on the card:
        * **De Eclat:** Flat C, 6/Fl., Foremost Bldg., 19-21 Jordan Road, Jordan, Kowloon, Hong Kong. (Email: deeclat@gmail.com)
        * **DIALUSTER INC.:** Chiyoda Bldg, 2F, 16-17 Ueno 5-Chome, Taito-Ku, Tokyo 110-005, Japan.

## 5. Development Notes (Tailwind CSS)
When building out the structure, ensure the `tailwind.config.js` is updated with the custom font families and the specific color palette defined in Section 2. Use utility classes like `tracking-widest` for uppercase serif subheadings to give them that premium editorial look. Keep animations restricted to `duration-500` or `duration-700` for a smooth, high-end feel.
