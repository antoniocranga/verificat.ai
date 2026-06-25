# UI Design Review Checklist

Self-review gate for any PR touching `packages/ui/`, `apps/web/`, `apps/extension/`, or `apps/mobile/`.  
Answer every question **Yes** or **No** before opening or requesting review. If any answer is **No**, fix before opening.

---

1. **Typography** — Does every text element use only Geist Sans (or Inter as substitute) or Geist Mono (or JetBrains Mono)? No `system-ui`, no Roboto, no mixed stacks.

2. **Heading weight & letter-spacing** — Do all headings use weight 600 with negative letter-spacing (−2.4px at display‑xl, −1.28px at heading‑lg, −0.4px at heading‑md)?

3. **Color discipline** — Is color used ONLY in the hero mesh gradient? No violet, cyan, pink, or magenta fills on buttons, backgrounds, badges, or cards.

4. **Button shape** — Are marketing CTA buttons full pills (`border-radius: 100px`) and nav/app buttons tight 6px squares? Are these two shapes NEVER mixed within one context?

5. **Cards** — Are all cards defined by a 1px `#ebebeb` border with white (`#ffffff`) background? No heavy box‑shadows, no coloured card backgrounds.

6. **Canvas background** — Is the page/surface background `#fafafa` (canvas), not pure white (`#ffffff`) and not any grey darker than `#fafafa`?

7. **Forbidden patterns** — Does the surface contain any emoji? Any decorative icon used as a bullet or section marker? Any gradient outside the hero? Any bold coloured badge? Any drop shadow heavier than the Level‑2 spec?  
   **If yes to any: STOP and remove before opening PR.**

8. **Hero gradient** — Does the hero (if present) use the multi‑stop mesh gradient (cyan → blue → violet → magenta → amber) and nothing else as a decorative element?

9. **Body text colour** — Is body text `#4d4d4d`, not `#000000` or `#333333`?

10. **Layout width** — Is the canvas max‑width approximately 1200px, centred, with consistent gutters?
