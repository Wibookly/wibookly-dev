

# Full Landing Page Redesign -- Jace.ai Style with Wibookly Brand Colors

## Overview

Redesign the entire Wibookly landing page to match the Jace.ai layout structure and section patterns, while keeping the existing Wibookly blue-to-green gradient color theme. The goal is a polished, professional, content-rich landing page with more sections, better visual flow, and the same warm colorful brand identity.

## What Changes (Section by Section)

### 1. Header (Header.tsx)
- Pill-shaped floating navigation bar (centered, rounded-full with backdrop blur)
- Wibookly logo on the left, nav links in the middle, "Log In" and "Get Started" buttons on the right
- Transparent background that blurs on scroll, matching Jace.ai's clean header style
- Keep existing brand colors for the CTA button

### 2. Hero Section (Hero.tsx)
- Large, bold headline text (similar to Jace's "Emails so good, you just press send!" style) adapted for Wibookly: "Your AI-powered email assistant."
- Subtitle text below the headline
- Large dark/primary CTA button: "Get Started" with an arrow icon (rounded-full, prominent)
- "Works with" row showing Outlook and Gmail logos/badges
- Feature pill tabs below (like Jace's "Draft e-mails", "Find an important file", etc.) adapted: "Smart Inbox", "AI Drafts", "Organize Inbox", "Sort by Priority"
- Product mockup image below using the existing `mockup-inbox.png` asset, displayed with a warm gradient border/glow effect

### 3. How It Works Section (HowItWorks.tsx)
- Section header with badge ("Simple Setup") and title "Reclaim 90% of your email time"
- Subtitle: "Watch how Wibookly transforms a chaotic inbox into an organized, productive workspace"
- CTA button: "Get Started for Free"
- Three vertical step cards (inspired by Jace's approach) with:
  - Step images using existing mockup assets (mockup-integrations.png, mockup-categories.png, mockup-ai-draft.png)
  - Step titles: "Connect your email", "Customize Categories", "Review and send"
  - Time/benefit badges (e.g., "Takes 1 min", "Takes 5 min", "Save 2h a day")
  - Each card has a rounded image area with the mockup screenshot

### 4. Features Section (Features.tsx) -- "Write less, achieve more"
- Redesigned as alternating left-right feature blocks (like Jace's feature showcase)
- Each feature block has:
  - A title, subtitle, and description paragraph
  - A "Try it free" CTA link
  - An image/mockup on the opposite side
- Features to showcase (using existing mockup images):
  - AI Email Drafts (mockup-ai-draft.png)
  - Smart Categories (mockup-categories.png)
  - AI Activity Dashboard (mockup-activity.png)
  - Smart Inbox (mockup-inbox.png)
- Clean layout with generous whitespace

### 5. Tool Comparison Section (ToolComparison.tsx)
- Keep the existing structure but polish the design:
  - Section header: "Replace 4 tools with one intelligent assistant"
  - Side-by-side comparison with competitor cards on the left and Wibookly on the right
  - Use the Wibookly logo prominently on the right side
  - Pricing comparison: $90/month vs $25/month
  - "Save over $65/month" callout badge at the bottom

### 6. Security Section (Security.tsx)
- Dark banner with rounded corners (like Jace's "Bank-level security" section)
- Title: "Bank-level security for your peace of mind"
- Grid of 4 security feature cards inside the dark banner:
  - SOC 2 Type II (with shield icon)
  - Encryption (with lock icon)
  - Enterprise-Grade Infrastructure (with server icon)
  - Privacy First (with eye icon)
- Below the dark banner: a lighter detailed security statement with description
- Compliance badges row

### 7. New: Testimonials Section (new component: Testimonials.tsx)
- Section header: "What our users say"
- 3-4 testimonial cards with quotes, user names, and roles
- Clean card design with quote marks and subtle shadows
- Matches the Jace.ai testimonial style

### 8. New: CTA Section (new component: CTASection.tsx)
- Full-width section before the footer: "Ready to reclaim your time?"
- Subtitle: "Join thousands of professionals who've already transformed their email workflow"
- Two buttons: "Get Started for Free" and "Schedule Demo Call"
- Trust badges: "7 days free trial", "Takes 30 seconds", "30-day money-back guarantee"

### 9. New: FAQ Section (new component: FAQ.tsx)
- "Frequently Asked Questions" header
- Accordion-style expandable questions using the existing Radix accordion component
- 5-6 common questions about Wibookly (What is Wibookly, how does it work, is it secure, etc.)
- "Still have a question? Contact us" link

### 10. Footer (Footer.tsx)
- Clean footer with Wibookly logo, social links, and legal links
- Organized in a simple layout similar to Jace's footer

### 11. Landing.tsx (Page Layout)
- Updated section order: Hero -> HowItWorks -> Features -> ToolComparison -> Testimonials -> Security -> FAQ -> CTA -> Footer
- Keep the `bg-[image:var(--gradient-hero)]` gradient background across the entire page

## Technical Details

### Files to Create
- `src/components/landing/Testimonials.tsx` -- New testimonial cards section
- `src/components/landing/CTASection.tsx` -- New call-to-action section before footer  
- `src/components/landing/FAQ.tsx` -- New FAQ accordion section

### Files to Modify
- `src/pages/Landing.tsx` -- Add new sections and update order
- `src/components/landing/Header.tsx` -- Pill-shaped centered nav bar
- `src/components/landing/Hero.tsx` -- Larger headline, feature pill tabs, product mockup image
- `src/components/landing/HowItWorks.tsx` -- Vertical step cards with mockup images and time badges
- `src/components/landing/Features.tsx` -- Alternating left-right layout with mockup images
- `src/components/landing/ToolComparison.tsx` -- Polish existing design, keep Wibookly logo prominent
- `src/components/landing/Security.tsx` -- Consolidated dark banner with security cards inside
- `src/components/landing/Footer.tsx` -- Cleaner layout with social links

### Existing Assets to Use
- `wibookly-logo.png` -- Main logo (header, footer)
- `logo-icon.png` -- Icon logo (comparison section, hero)
- `mockup-inbox.png` -- Hero product preview, Smart Inbox feature
- `mockup-categories.png` -- Categories step and feature
- `mockup-ai-draft.png` -- AI Drafts feature
- `mockup-activity.png` -- Dashboard feature
- `mockup-integrations.png` -- Connect email step
- `dashboard-preview.png` -- Alternative dashboard image

### Color Theme (Unchanged)
- Primary: Cyan-blue (`hsl(195 90% 45%)`)
- Accent: Green (`hsl(145 70% 50%)`)
- Success: Green (`hsl(145 70% 45%)`)
- Gradient: Blue to green (`--gradient-hero`)
- All existing CSS variables and theme tokens remain the same

### No New Dependencies Required
- Uses existing Radix accordion for FAQ
- Uses existing Lucide icons
- Uses existing Tailwind utilities and animations

