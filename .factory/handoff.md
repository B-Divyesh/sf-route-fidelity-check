# Route Fidelity Check — P1 contrast repair handoff

## Status

The independent-verifier P1 contrast blocker from candidate
`9675bab25bca89d3e118a5239ba2ae1df3d146a6` is repaired. The only product
change is the foreground color of the two primary GPX-upload helper captions;
the GPX chooser, malformed-GPX recovery, PWA, and local-only behavior are
unchanged.

## What changed

- Both GPX upload surfaces are now visible `button` controls. Their native file
  inputs have `tabindex="-1"` and are hidden from the accessibility tree, so
  they no longer create invisible tab stops. Tab reaches the visible controls;
  Enter activates the corresponding native file picker; the designed 3px blue
  focus ring and mint focused upload treatment are visible. Focus returns to
  the visible control after selecting or cancelling a file.
- GPX text is parsed as XML with the browser's native `DOMParser` before any
  point tags are extracted. Incomplete or malformed XML now reports: “This GPX
  XML is incomplete or malformed. Re-export the complete GPX file and try
  again.” The Node-only structural fallback keeps this validation covered by
  unit tests.
- Added the exact incomplete-export unit regression and a production-build
  Playwright regression runner for desktop (1440×900) and mobile (390×844)
  keyboard chooser operation, visible focus, hidden-input tab order, and the
  malformed-GPX recovery state.
- Replaced the upload captions’ `--quiet` foreground with the product-specific
  `--upload-helper: #E1F3EA` token. This retains the luminous glass palette
  while meeting WCAG AA over the layered upload surface.
- Extended the production-build Playwright suite with computed-style and axe
  checks at 1440×900 and 390×844. It asserts both captions compute to
  `rgb(225, 243, 234)` and finds no serious/critical or `color-contrast` axe
  violations in rest, hover, focus, and dragging states.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:browser
npm run preview -- --host 127.0.0.1 --port 4173
```

`npm run test:browser` builds the production artifact before exercising the
browser regressions.

Verified locally on 2026-08-27:

- `npm ci`: completed with 0 vulnerabilities.
- `npm test`: 8/8 passing (GPX parser and comparison behavior).
- `npm run build`: passed and produced `dist/`.
- `npm run test:browser`: passed against a freshly built production preview.
  At desktop and 390px, computed-style axe checks found no serious/critical or
  color-contrast violations for the two helper captions in rest, hover, focus,
  and drag states. The same run retains the visible keyboard chooser, hidden
  native-input tab order, Enter activation, and malformed-GPX recovery checks.
- The prior production-preview route comparison, PWA offline reload, local-only
  privacy/network, and no-console-error checks remain applicable: this repair
  changes only a CSS foreground token.
- After service-worker control, an offline reload of the production preview
  loaded successfully.
- Live Standard static deployment was completed on 2026-08-27. At both
  1440×900 and 390×844, the HTTPS site computed both helper captions as
  `rgb(225, 243, 234)`, had no serious/critical or `color-contrast` axe
  violations, no console/page errors, and only first-party requests. Its
  service worker controlled a reload and rendered the app offline.
- Previous mobile Lighthouse baseline remains: Performance 100, Accessibility
  96, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 20 ms. The CSS-only
  repair does not add assets or JavaScript.

Current production asset sizes remain within budget: JavaScript 15.88 KB raw /
6.25 KB gzip and CSS 16.72 KB raw / 4.76 KB gzip; the unchanged hero WebP is
77.3 KB.

## Known gaps

- The research brief's 30-pair real-world corpus is still absent, so its 90%
  material-detour recall target remains unmeasured.
- Separate GPX track segments are intentionally joined in v1; intentional gaps
  and antimeridian-crossing routes need segment-aware handling in a future
  iteration.

## Deployment

Deployed as a Standard static build from `dist/`. No secrets, backend,
analytics, payment, DNS, or billing changes are required.
