---
name: Kindred Tails
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#3e4941'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#6e7a70'
  outline-variant: '#becabf'
  surface-tint: '#006d41'
  primary: '#006d41'
  on-primary: '#ffffff'
  primary-container: '#4bae78'
  on-primary-container: '#003c22'
  inverse-primary: '#78daa0'
  secondary: '#845400'
  on-secondary: '#ffffff'
  secondary-container: '#feb246'
  on-secondary-container: '#6f4600'
  tertiary: '#5e5f5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#9c9c98'
  on-tertiary-container: '#333431'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#94f7bb'
  primary-fixed-dim: '#78daa0'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#005230'
  secondary-fixed: '#ffddb6'
  secondary-fixed-dim: '#ffb95a'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#e3e3de'
  tertiary-fixed-dim: '#c7c7c2'
  on-tertiary-fixed: '#1b1c19'
  on-tertiary-fixed-variant: '#464744'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The brand personality is rooted in empathy, safety, and joy. This design system facilitates an emotional connection between potential adopters and animals by utilizing a **Warm Minimalism** aesthetic. It avoids the clinical coldness of traditional tech platforms, favoring instead a tactile, organic feel that suggests a nurturing environment.

The visual language communicates "trust" through clarity and "friendliness" through soft geometry. By balancing generous white space with vibrant, nature-inspired accents, the interface remains uncluttered, allowing the photography of the pets to be the focal point. The emotional response should be one of optimism and calm reassurance.

## Colors

The palette is derived from natural elements to evoke feelings of health and vitality.
- **Primary (Sage Green):** Used for primary actions and "success" states, representing growth and animal wellness.
- **Secondary (Honey Gold):** Used for highlights, energetic accents, and "favoriting" features, radiating warmth and domestic comfort.
- **Background (Cream White):** An off-white base that reduces eye strain and feels more organic than pure digital white.
- **Neutral (Charcoal):** A softened black used for typography to maintain high legibility without the harshness of high-contrast black-on-white.

## Typography

This design system utilizes **Plus Jakarta Sans** for its friendly, modern, and slightly rounded character. The typeface strikes a perfect balance between professional geometry and approachable warmth. 

Headlines use a tighter letter-spacing and heavier weights to create a sense of presence and stability. Body text is set with generous line-height to ensure maximum legibility for users of all ages. All type should be rendered with anti-aliasing to preserve the softness of the letterforms.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high-density margins to create a "contained" and safe feeling for the content. A 12-column system is used for desktop, collapsing to 4 columns on mobile. 

Spacing is governed by a 4px baseline power-of-two scale. Layouts should prioritize "breathing room" around pet profiles, using large padding (stack-lg) to separate distinct content sections. Vertical rhythm should be consistent to build trust through predictable structure.

## Elevation & Depth

To maintain the friendly and minimalist aesthetic, this design system uses **Ambient Shadows** and **Tonal Layers**. 

Depth is conveyed through very soft, diffused shadows with a slight tint of the Primary color (#4BAE78) at low opacity (5-8%). This makes elements like pet cards feel as though they are floating gently above the surface. Backgrounds use "Surface-Container" logic, where the main background is the Tertiary off-white, and elevated components are pure white. Avoid harsh borders; use tonal changes to define boundaries whenever possible.

## Shapes

The shape language is defined by significant **Roundedness**. There are no sharp corners in the design system, as sharp angles can subconsciously trigger a sense of "danger" or "hardness." 

Standard components (buttons, inputs) use a 0.5rem radius. Container elements like cards and modal overlays use "Large" (1rem) or "Extra-Large" (1.5rem) radii to emphasize the friendly, non-threatening nature of the platform. Image containers for pets should always be rounded to soften the overall visual impact.

## Components

- **Buttons:** Primary buttons are fully rounded (pill-style) or use `rounded-xl`, featuring the Sage Green color. They should have a subtle lift on hover.
- **Cards:** Pet profile cards are the hero component. They feature a pure white background, a `rounded-xl` corner radius, and an ambient shadow. 
- **Chips/Tags:** Used for pet traits (e.g., "Good with kids"). These use a semi-transparent version of the Secondary color with a `rounded-lg` radius and bold `label-sm` text.
- **Input Fields:** Search bars and forms use the Tertiary color as a background fill instead of a heavy border, creating a softer look.
- **Icons:** Use "broken-line" or "rounded-cap" icon sets. Icons should be oversized and playful, often enclosed in a soft-colored circular background.
- **Progress Indicators:** Use the Honey Gold color for multi-step adoption forms to keep the user feeling energized and positive throughout the process.