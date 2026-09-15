# Design system

## Direction

Brief Doc X is a product workspace used by a small-business operator at a desk in daylight, moving quickly between structured records and document previews. The interface is light, warm, and grounded, with charcoal for navigation and an orange accent reserved for creation and AI actions.

## Color strategy

Committed warm accent. Paper and ink establish the workspace; burnt orange carries creation, focus, and AI affordances; sage and semantic tones communicate document state.

```css
--paper: oklch(0.985 0.008 80);
--paper-deep: oklch(0.955 0.018 78);
--ink: oklch(0.19 0.018 45);
--ink-muted: oklch(0.47 0.025 55);
--rail: oklch(0.18 0.018 45);
--orange: oklch(0.67 0.17 48);
--orange-soft: oklch(0.93 0.055 72);
--sage: oklch(0.56 0.07 165);
```

## Typography

Use a system sans stack for product controls and body copy. Use strong weight contrast, compact labels, and a single oversized workspace statement where useful. Avoid display fonts in controls.

## Layout

Use a charcoal left rail, warm content canvas, asymmetric hero framing, and dense document rows. On narrow screens the rail becomes a compact top bar. Avoid nested cards; use full-width sections, dividers, and one primary surface per task.

## Components

- Wordmark: “Brief Doc X” with a small orange signal mark.
- Rail navigation: Documents, Clients, Services, Employees, Company.
- Command panel: warm outlined input with a single orange action.
- Document row: title, type, status, amount, and PDF action.
- Editor surface: structured fields on the left, document context on the right.
- Status badge: accessible text plus semantic color, never color alone.

## Motion

Use 150–220ms ease-out transitions for rail selection, buttons, and status reveals. Respect `prefers-reduced-motion` and never animate layout for decoration.
