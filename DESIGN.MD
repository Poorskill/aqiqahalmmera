# AQIQAH ALMEERA — DESIGN SYSTEM & VISUAL GUIDELINES (SOURCE OF TRUTH)

## 1. Brand Identity & Character
Aqiqah Almeera is a trusted, premium, warm, professional, and friendly Islamic aqiqah and qurban service provider.
- **Tone:** Professional, Warm, Trusted, Friendly, Simple, High-end.
- **Forbidden Styles:** Neo-Brutalism, Cyberpunk, Tactical HUD, Gaming UI, heavy hard-offset shadows (`shadow-[4px_4px_0px...]`), thick default borders (`border-2` or `border-black`), excessive neon/saturated colors, fake technical/telemetry coordinates, or overly dense mechanical dashboards.

## 2. Design Tokens & Colors
- **Primary Color (Amber/Gold):**
  - Primary Base: `#865300` (Amber-900 / Deep Gold)
  - Primary Container / Accent: `#d97706` (Amber-600)
  - Primary Hover / Active: `#b45309` (Amber-700)
- **Neutral & Surface Colors:**
  - Background (Page): `#faf9f6` (Warm Off-White / Cream)
  - Surface Card: `#ffffff` (Pure White)
  - Text Main: `#2c1609` (Deep Warm Espresso)
  - Text Muted: `#57534e` (Stone-600)
  - Border Subtle: `rgba(131, 83, 0, 0.12)` or `border-stone-200`
- **Feedback Colors:**
  - Success: `#059669` (Emerald-600)
  - Warning: `#d97706` (Amber-600)
  - Error: `#dc2626` (Red-600)
  - Info: `#2563eb` (Blue-600)

## 3. Typography
- **Font Family:** 'Space Grotesk', sans-serif (or clean modern sans-serif stack).
- **Scale & Hierarchy:**
  - Page Title: `text-xl font-bold tracking-tight text-stone-900`
  - Section Heading: `text-base font-semibold text-stone-800`
  - Body Text: `text-sm font-normal text-stone-700`
  - Meta/Caption: `text-xs text-stone-500`

## 4. Components Standard
- **Cards:** Clean white surface, subtle warm border (`border border-stone-200/80` or `border border-amber-900/10`), soft shadow (`shadow-sm` or `shadow-md`), rounded corners (`rounded-2xl` or `rounded-xl`).
- **Buttons:** Rounded (`rounded-xl`), font-semibold (`font-medium`), smooth hover states (`transition-all duration-200`), no hard borders or brutalist offsets. Primary buttons use warm amber (`bg-amber-600 hover:bg-amber-700 text-white`).
- **Inputs & Selects:** Clean border (`border border-stone-300`), rounded (`rounded-xl`), padding (`px-4 py-2.5`), focus ring (`focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600`).
- **Badges / Status:** Soft pastel background with matching text color and subtle indicator dot (`rounded-full px-3 py-1 text-xs font-semibold`).
- **Tables:** Clean header (`bg-stone-50 text-stone-600 text-xs font-semibold uppercase tracking-wider`), alternating rows or subtle row separators (`border-b border-stone-100`), padding (`px-6 py-4`).
- **Modals & Dialogs:** Centered overlay with backdrop blur, rounded-2xl white card, clear title, action buttons.

## 5. Logo Usage
- Always use the official Aqiqah Almeera logo from `/logo-almeera.png` or `/logo-almeera.svg`. Never use plaintext "ALMEERA" or random icons as a logo replacement.
