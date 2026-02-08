

# Landing Page Redesign - Header, Hero, How It Works, "Replace 4 Tools" Section, and Pricing on Landing Page

This plan covers all the changes requested across the four reference images, plus adding pricing to the landing page.

---

## 1. Header (Image 1) - `src/components/landing/Header.tsx`

**Current issues:** Header is too narrow, logo is too small, "Get started" button is black.

**Changes:**
- Make the pill-shaped header **wider** with more horizontal padding (increase `px-6` to `px-10` and add `min-w` or `max-w` for wider appearance)
- Make the WeBookly logo **significantly larger** (change `h-8` to something like `h-16` to `h-20` -- approximately 20x the visual presence)
- Change the "Get started" button color from black (`bg-foreground`) to **blue** using the accent color (`bg-accent text-white` or a blue/green gradient)
- Keep "Log In" as outline style

---

## 2. Hero Section (Image 2) - `src/components/landing/Hero.tsx`

**Current issues:** CTA button is black, Gmail/Outlook icons are custom low-quality SVGs, sub-headline content needs updating.

**Changes:**
- Change the "Get started for free" pill button from **black to blue/green** (using accent or gradient)
- Change the arrow circle icon colors accordingly
- Replace the custom Gmail SVG with a **proper, recognizable Gmail logo SVG** (the classic multicolor M envelope)
- Replace the custom Outlook SVG with a **proper, recognizable Outlook logo SVG** (the blue O with envelope)
- Update sub-headline text to be different/fresh content (e.g., "Your AI email assistant that organizes, drafts, and sends -- so you can focus on what matters.")

---

## 3. "How It Works" Section (Image 3) - `src/components/landing/HowItWorks.tsx`

**Complete rebuild** to match the Jace.ai 3-column card layout, but with WeBookly branding:

**Structure per card:**
- **Title** (left-aligned, bold): e.g., "Connect your email", "WeBookly onboards itself", "Review and send"
- **Description** (left-aligned, muted text): WeBookly-specific copy
- **Illustration card** below with:
  - A colored badge/tag (e.g., "Takes 1 min", "Takes 5 min", "Save 2h a day for free") -- using green/blue tints instead of yellow
  - A visual illustration inside each card:
    - Card 1: Gmail logo + Outlook logo + arrow + WeBookly logo (connection visual)
    - Card 2: WeBookly logo with category/sorting icons floating around it
    - Card 3: A mock email draft UI with "To:", "Body", and WeBookly badge

- Remove the current numbered step badges and icon boxes
- All references say "WeBookly" (never "Jace")

---

## 4. "Replace 4 Tools" Section (Image 4) - New component `src/components/landing/ReplaceTools.tsx`

**Create a brand-new section** matching the Jace.ai comparison layout:

**Layout:**
- Section heading: "Replace 4 tools with one intelligent assistant" (serif font, large)
- Subheading: "Stop paying for multiple subscriptions. WeBookly consolidates your email workflow into one powerful platform."
- Large card with two columns side by side, a "VS" divider in the center:

**Left column -- "Competitors" stack:**
| Tool | Price | Description |
|------|-------|-------------|
| Fyxer.ai | $30 | Email organizer |
| ChatGPT | $23 | Answers many general questions |
| Calendly | $10 | Scheduling tool |
| Superhuman | $30 | Productivity-focused email inbox |

Each as a small card with an icon/logo placeholder and price badge.

**Right column -- "WeBookly" side:**
- WeBookly logo in a soft green/blue rounded box
- 4 bullet points with green checkmarks:
  - "Full-stack AI Chief of Staff" -- Replaces Fyxer.ai
  - "Answers any question, even about your business" -- Replaces ChatGPT
  - "Seamless scheduling without switching apps" -- Replaces Calendly
  - "AI-native, productivity-focused email inbox" -- Replaces Superhuman

**Bottom:**
- Dotted separator line on each side
- Left total: "In total **$93**/month"
- Right total: "In total **$20**/month" (highlighted with green/blue accent)

---

## 5. Pricing Section on Landing Page

**Embed the existing pricing plans** directly into the landing page as a new section (before the CTA or after the "Replace 4 Tools" section). This will reuse the plan data from `src/pages/Pricing.tsx` but rendered as a section within the landing page rather than a separate page.

- Add a new component `src/components/landing/PricingSection.tsx` with the 3-tier pricing grid
- Section heading: "Simple, transparent pricing"
- Reuse the Starter/Professional/Enterprise plan cards

---

## 6. Landing Page Assembly - `src/pages/Landing.tsx`

Update the page to include the new sections in order:
1. Header
2. Hero
3. How It Works (rebuilt)
4. Features (unchanged)
5. **Replace 4 Tools** (new)
6. **Pricing Section** (new)
7. Security
8. CTA Section
9. Footer

---

## Files to Modify
- `src/components/landing/Header.tsx` -- wider header, larger logo, blue button
- `src/components/landing/Hero.tsx` -- blue/green CTA, real Gmail/Outlook SVGs, new copy
- `src/components/landing/HowItWorks.tsx` -- complete rebuild matching reference
- `src/pages/Landing.tsx` -- add new sections

## Files to Create
- `src/components/landing/ReplaceTools.tsx` -- "Replace 4 tools" comparison section
- `src/components/landing/PricingSection.tsx` -- pricing cards embedded in landing page

## No Changes To
- Backend, auth, routing, APIs, or any non-landing-page files
- WeBookly branding/name (always "WeBookly", never "Jace")

