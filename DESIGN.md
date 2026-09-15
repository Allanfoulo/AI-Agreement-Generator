# Design system

## Direction

Brief Doc X is a document studio used by a small-business operator at a desk in daylight. The premium direction uses a warm paper work surface, moss navigation and introduction, sage accents, and clay actions. It adapts the user's organic-tech reference to practical document creation.

## Color strategy

Moss carries the introduction and navigation. Paper carries working surfaces; clay identifies primary actions and focus. Sage provides contrast on dark surfaces.

```css
--paper: oklch(0.969 0.009 85);
--paper-deep: oklch(0.94 0.012 90);
--ink: oklch(0.25 0.024 155);
--ink-muted: oklch(0.49 0.019 150);
--rail: oklch(0.305 0.035 155);
--orange: oklch(0.54 0.145 38);
--orange-soft: oklch(0.95 0.021 65);
--sage: oklch(0.82 0.042 125);
```

## Typography

Use a system sans stack for controls and body copy, a local Palatino/Georgia serif stack for expressive headings, and Cascadia/Consolas for document identifiers. Italic serif is reserved for the introduction and brand signature. No font downloads are required.

## Layout

Use a moss left rail, warm content canvas, a serif introduction with a paper illustration, and compact document rows. On narrow screens the rail becomes a top navigation area. Use one primary surface per task.

## Components

- Wordmark: “Brief Doc X” with a serif monogram in a document-shaped outline.
- Rail navigation: Documents, Clients, Services, Employees, Company.
- Command panel: sage-tinted writing area with a single clay action.
- Document row: title, type, status, amount, and PDF action.
- Editor surface: structured fields on the left, document context on the right.
- Status badge: accessible text plus semantic color, never color alone.

## Motion

Use 150–220ms ease-out transitions for rail selection, buttons, and disclosure controls. Respect `prefers-reduced-motion` and never animate layout for decoration. Avoid autoplay effects inside working forms.

## Premium studio implementation

- `src/styles/studio.css` owns the active tokens and component styling; original styles are contained in the legacy cascade layer.
- Major surfaces use 24–32px radii; fields use 10px; navigation actions use pill shapes.
- Restrict low-opacity noise to the introduction, away from working text and form controls.
- Use a source-owned paper illustration rather than unrelated stock photography.
- Library search, status filters, and progressive loading keep persisted documents accessible.
- Secondary workspace records and activity sit in a keyboard-accessible disclosure.
- Keep narrow-screen navigation and data import reachable; reduce motion on request.
