# DESIGN.md — verificat.xyz Design System & UX Rules

This document defines the design principles, visual system, UX rules, and component standards for the verificat.xyz platform. It applies to all user-facing surfaces: `apps/web` (Next.js), `apps/extension`, and `apps/mobile` (Flutter).

`CONSTITUTION.md` Articles I and III are the upstream authority here — specifically, the requirement that verdicts are never ambiguous, that `Unverified` is a first-class visible outcome, and that WCAG 2.1 AA accessibility is a launch requirement for the public website (not a later pass).

If this file conflicts with a Notion ADR, raise the conflict rather than silently picking one.

---

## 1. Product design principles

These are not aspirational values — they are constraints that every screen, component, and copy string must satisfy before ship.

### 1.1 Show your work

Every verdict must visibly carry:

- The verdict label (one of the six exact values)
- A confidence score (rendered as a percentage or a calibrated visual indicator — never hidden)
- At least one cited source (link, publisher, date)
- A plain-language evidence explanation (not a raw model output, but a human-readable summary)

A UI that shows a verdict label without all three of the above is incomplete and must not ship to production.

### 1.2 Unverified is not a failure

`Unverified` is displayed with the same visual weight and clarity as any other verdict label. It must never be:

- Displayed in a faded, grey-out, or otherwise de-emphasised style
- Accompanied by copy that implies the system failed
- Suppressed in favour of the closest partial match

Correct framing: "We couldn't find sufficient evidence to verify this claim." Wrong framing: "Fact check unavailable."

### 1.3 We are not a truth detector

No headline, CTA, badge, tooltip, or marketing copy may imply the system delivers unilateral truth. Permitted: "evidence-backed claim verification", "sourced fact checking", "verified against [N] sources". Forbidden: "AI proves this is false", "truth score", "verified as true by AI".

### 1.4 Romanian first

All user-facing copy is reviewed for correct Romanian diacritics (ă â î ș ț) before any release. This includes:

- All static copy in `apps/web` and `apps/mobile`
- STT transcripts displayed in the UI (post-processed, not raw ASR output)
- Verdict evidence explanations
- Error messages, empty states, loading states

A missing diacritic is filed as a bug, not deferred as a typo.

### 1.5 Accessibility is a launch requirement

WCAG 2.1 AA compliance is the floor for the public website (`apps/web`). This means, at minimum:

- All images have descriptive `alt` text
- All interactive elements are keyboard-reachable and have a visible focus state
- Colour contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- The verdict label and confidence score are not communicated by colour alone (they also use text and/or icon)
- Screen reader compatibility tested in at least NVDA + Chrome and VoiceOver + Safari before each public release

WCAG AA on mobile (`apps/mobile`) is a Phase 6 target. Extension (`apps/extension`) follows the same rules as web.

---

## 2. Verdict visual language

The six verdict values must be rendered consistently across all surfaces. The mapping below is canonical — do not introduce new colours, icons, or labels for verdicts without updating this document and getting design review.

| Verdict          | Colour token                                    | Icon             | Accessible label       |
| ---------------- | ----------------------------------------------- | ---------------- | ---------------------- |
| `True`           | `--verdict-true` (green, 500-level)             | ✓ filled circle  | "Adevărat"             |
| `Mostly True`    | `--verdict-mostly-true` (lime-green, 500-level) | ✓ partial circle | "Predominant adevărat" |
| `Partially True` | `--verdict-partial` (amber, 500-level)          | ◑ half circle    | "Parțial adevărat"     |
| `Misleading`     | `--verdict-misleading` (orange, 600-level)      | ⚠ triangle       | "Înșelător"            |
| `False`          | `--verdict-false` (red, 600-level)              | ✗ filled circle  | "Fals"                 |
| `Unverified`     | `--verdict-unverified` (grey, 500-level)        | ? circle         | "Neverificat"          |

Rules:

- **Never** communicate verdict solely via colour. The text label and icon are always present.
- The colour token values are defined in `packages/ui/tokens.css` (web) and `packages/ui/lib/src/tokens.dart` (Flutter). Do not hardcode hex values in component code.
- Confidence score is always displayed as a percentage (e.g. "72%") adjacent to the verdict label, never hidden behind a tooltip on mobile.

---

## 3. Typography

| Role                        | Web (CSS variable) | Mobile (Flutter TextTheme)      | Fallback stack                                  |
| --------------------------- | ------------------ | ------------------------------- | ----------------------------------------------- |
| Display / headline          | `--font-display`   | `displayLarge`                  | Anthropic Serif, Georgia, serif                 |
| Body                        | `--font-body`      | `bodyMedium`                    | Anthropic Sans, system-ui, sans-serif           |
| Code / transcript           | `--font-mono`      | `bodySmall` (monospace variant) | JetBrains Mono, Fira Code, monospace            |
| Romanian diacritics testing | All of the above   | All of the above                | Font must render ă â î ș ț without substitution |

**Font loading:** Anthropic fonts are loaded locally via `next/font/local` (web) and bundled via the Flutter font asset pipeline. No Google Fonts CDN calls in production (privacy and performance).

---

## 4. Spacing & layout tokens

All spacing values come from an 8-point grid (`4px` base unit, multiples of `4`). Do not use arbitrary `px` values in component styles. Defined in `packages/ui/tokens.css`:

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
```

---

## 5. Component library rules

All shared UI components live in `packages/ui`. Rules for adding or modifying components:

1. **No ad-hoc styles in app code.** If a style pattern appears in more than one place, it belongs in `packages/ui`.
2. **Every component has a story** (Storybook or equivalent) demonstrating the happy path, empty state, error state, and loading state.
3. **Every interactive component has a unique, stable `id` attribute** on the root element — required for end-to-end testing and browser accessibility.
4. **Dark mode is not optional.** Every component is tested in both light and dark themes before being merged into `packages/ui`.
5. **Romanian text is used in all story fixtures**, not placeholder Lorem Ipsum. This catches diacritic rendering issues early.

---

## 6. Information architecture

### 6.1 Web (`apps/web`)

| Route               | Purpose                             | Auth required                    |
| ------------------- | ----------------------------------- | -------------------------------- |
| `/`                 | Marketing landing page              | No                               |
| `/cum-functioneaza` | How it works (explainer)            | No                               |
| `/surse`            | Source trust methodology (public)   | No                               |
| `/auth/login`       | Sign in                             | No (redirects if already authed) |
| `/auth/signup`      | Create account                      | No                               |
| `/dashboard`        | User's recent fact-checks           | Yes                              |
| `/check/[id]`       | Individual verdict page (shareable) | No (public)                      |
| `/settings`         | Account settings                    | Yes                              |
| `/admin/*`          | Admin dashboard                     | Yes + Admin role                 |

Deep links from mobile and extension resolve to `/check/[id]` and fall back gracefully if the app is not installed.

### 6.2 Extension (`apps/extension`)

- **Popup:** compact status bar showing active/inactive state, recent verdict count, and a one-click "verify what's playing" action.
- **Side panel:** full verdict view with source list, evidence explanation, confidence score, and controls for language/sensitivity preferences.
- **Overlay (tab-level):** lightweight badge overlaid on the media player, showing the current verdict label + colour only (no detail). Detail opens in the side panel.

### 6.3 Mobile (`apps/mobile`)

Screen hierarchy (Flutter Navigator 2.0 / GoRouter):

```
HomeScreen
├── LiveListeningScreen (foreground service active)
│   └── VerdictSheet (bottom sheet, streaming)
│       └── VerdictDetailScreen (full page)
├── HistoryScreen (past fact-checks)
│   └── VerdictDetailScreen
├── SettingsScreen
│   ├── AccountScreen
│   ├── NotificationsScreen
│   └── LanguagePreferencesScreen
└── OnboardingFlow (first launch only)
    ├── PermissionExplainerScreen (mic, notifications)
    └── AuthScreen
```

---

## 7. Motion & animation

Animations are functional, not decorative. They communicate state transitions (loading → result, inactive → active listening). Rules:

- **Respect `prefers-reduced-motion`.** All CSS animations and Flutter `AnimationController` instances must check the system preference and reduce or eliminate motion accordingly.
- **Loading states are never spinner-only.** Use skeleton screens for content areas; a spinner is only acceptable for a button-level action that completes in under 500 ms.
- **Verdict reveal animation** (if any): must not delay the display of actionable information. The content is visible immediately; animation is layered on top, not in front.
- **Maximum animation duration for state transitions:** 300 ms. Anything longer feels sluggish at the latency targets we're targeting.

---

## 8. Error states & empty states

Every screen must have a designed error state and empty state. "Throws an exception" and "shows a blank screen" are not designed states — they are bugs.

| State                              | Required elements                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| Network error                      | Illustration or icon, human-readable message (Romanian), retry button                |
| No fact-checks yet (history empty) | Illustration, onboarding CTA ("Start a live fact-check")                             |
| `Unverified` verdict               | Verdict chip with correct colour/icon, explanation of why, sources that were checked |
| Pipeline timeout                   | User-facing message, transcript shown, option to retry                               |
| Auth error                         | Clear message, link to login or support                                              |

Error messages must never expose internal error codes, stack traces, or raw API responses to the user.

---

## 9. Internationalisation (i18n) rules

- Primary language: Romanian (`ro`). This is not localisation — it is the default.
- Secondary language: English (`en`) — admin dashboard and developer-facing surfaces only.
- All strings are externalised via i18n keys (Next.js `next-intl`, Flutter `flutter_localizations`). No hardcoded user-visible strings in component code.
- Translation keys are prefixed by feature: `verdict.label.true`, `pipeline.error.timeout`, `onboarding.permission.mic`, etc.
- New strings added by any PR must include both `ro` and `en` translations before merge.

---

## 10. Design review checklist (for PRs)

Before merging any PR that changes user-facing UI:

- [ ] Verdict label uses the canonical value and correct colour token
- [ ] Confidence score and source citation are visible alongside the verdict
- [ ] All copy has been checked for Romanian diacritics
- [ ] Dark mode rendering tested
- [ ] Keyboard navigation works; focus states are visible
- [ ] `prefers-reduced-motion` is respected by any new animations
- [ ] Error state and loading state are implemented (not just the happy path)
- [ ] All new interactive elements have unique, stable `id` attributes
- [ ] No hardcoded hex colours or pixel values (tokens only)
- [ ] Storybook story added or updated for any modified `packages/ui` component
