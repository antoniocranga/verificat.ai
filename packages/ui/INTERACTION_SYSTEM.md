# verificat.xyz Shared Interaction System

This document defines the unified loading states, feedback patterns, motion principles, and error states across all verificat.xyz surfaces (Web, Extension, Mobile). By adhering to these standards, we avoid reinventing interactions per platform and ensure a consistent, premium user experience.

## 1. Motion Principles

Animations in the verificat.xyz brand are functional and grounded in reality. They communicate state changes clearly without being overly theatrical.

- **Easing**: We use standard out-easing (`cubic-bezier(0.4, 0, 0.2, 1)`) for interface elements appearing or moving, and spring physics where supported natively (e.g., in Flutter) for organic, non-linear reveals.
- **Durations**:
  - `fast`: `150ms` (for hovers, focus rings, minor color shifts)
  - `normal`: `220ms` (for standard state transitions, card expansions)
  - `slow`: `300ms` (for complex modal reveals or layout shifts)
  - _Rule:_ No animation should ever exceed 300ms. If an action takes longer, it is a loading state.
- **Accessibility**: Always respect `prefers-reduced-motion`. When active, drop animation durations to `0ms` (instant cuts).

## 2. Global State Machine

All audio capture flows follow the same strict state machine, regardless of the surface:

### A. Idle State

- **Visual**: Standard Parchment/Ivory surfaces.
- **Action**: Primary button (Terracotta) reads "Începe înregistrarea" (Start Recording) or "Verifică" (Check).

### B. Recording / Streaming State

- **Visual Feedback**:
  - Do **NOT** use alarming red flashing elements.
  - Button label changes to "Oprește" (Stop) or "Finalizează" (Finish).
  - Button color switches to the active accent (Terracotta/Coral) or a neutral ghost button, depending on hierarchy.
- **Audio Feedback**: A subtle, calm sound wave or microphone icon pulsing gently.

### C. Processing State

- **Visual Feedback**:
  - Do **NOT** use generic, unstyled native spinners (e.g., default `CircularProgressIndicator` in blue).
  - Use the branded `shimmer` animation (a subtle highlight sweeping across a skeleton component) for content loading.
  - If a spinner is necessary for a small button, it must use the `--color-ink` or `--color-mid` token, never a generic system color.
- **Copy**: "Se procesează..." (Processing...) or "Se analizează afirmația..." (Analyzing claim...).

### D. Verdict Ready State

- **Visual Reveal**: The verdict card slides in from the bottom or fades in (`transition-normal`). The information must be visible immediately; the animation must not delay readability.
- **Data Representation**: Must always include:
  1.  The colored verdict badge (`Adevărat`, `Fals`, etc.).
  2.  Confidence score percentage (e.g., `85%`).
  3.  A human-readable explanation.
  4.  Citations/Evidence links.

### E. Error State

- **Visual Feedback**:
  - Inline error banners (background: `--color-verdict-false` at 10-12% opacity, text: `--color-verdict-false`).
  - Never show raw JSON, stack traces, or generic "Error 500".
- **Copy**: Must be in Romanian, explaining what happened and offering a clear "Încearcă din nou" (Try again) action.

## 3. Shimmer Skeleton Pattern

For skeleton loading (e.g., while waiting for the model response):

- Background gradient sweeps from left to right.
- CSS implementation: `linear-gradient(90deg, var(--color-subtle) 25%, var(--color-surface-inset) 50%, var(--color-subtle) 75%)`.
- Flutter implementation: Use a Shimmer package or custom painter with `AppColors.subtle` and `AppColors.surfaceInset`.

## 4. Input and Focus Feedback

- **Focus Ring**: Consistent across platforms. Inputs receive a `1.5px` border of `--color-accent` and an outer soft glow/box-shadow of `--color-accent` at 10% opacity (`rgba(217, 119, 87, 0.1)`).
- **Error Input**: Border changes to `--color-verdict-false` with a soft red glow.

---

_Note: Refer to `DESIGN.md` for typographic and token constraints._
