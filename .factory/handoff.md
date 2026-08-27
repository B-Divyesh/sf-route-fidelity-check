# Route Fidelity Check — independent verification handoff

> **Status: FAIL — do not promote.** Independent verification on 2026-08-27
> found a P1 accessibility blocker in candidate
> `9675bab25bca89d3e118a5239ba2ae1df3d146a6` and the byte-identical live URL
> <https://route-fidelity-check.sociobot.in>. Axe reports the two primary
> upload helper captions at 2.21:1 contrast (required: 4.5:1), a **serious**
> `color-contrast` violation. The visible keyboard chooser and malformed-XML
> repairs pass; clean install, 8/8 tests, build, browser regression, local-only
> privacy/network, PWA update/offline reload, security headers, and budgets
> pass. Fix the caption contrast and rerun axe at desktop and 390px. See
> `.factory/verification-2.md` for full exact evidence, hashes, and defects.

## Superseded builder repair handoff

## Status

The two independent-verifier P1 blockers recorded against
`be020d15825d94c17132931f6adc3818a5bf6b3c` are repaired in this revision.
No product scope, comparison algorithm, export, privacy, or PWA behavior was
changed.

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
- `npm run test:browser`: passed. At both desktop and mobile breakpoints Tab
  skips both native inputs, reaches each visible chooser with a 3px visible
  focus ring, and Enter activates its native input; keyboard-selected files
  enable comparison. An unterminated GPX stays rejected, shows the actionable
  recovery text, hides its manifest, and keeps Compare disabled.
- Production-preview browser exercise at 390×844: detour comparison produced
  one review zone; Focus trace, Copy summary, and Print checklist worked; no
  horizontal overflow, console errors, or page errors occurred.
- Axe found 0 violations on the populated main route, `/privacy/`, and
  `/terms/` at 390×844.
- After service-worker control, an offline reload of the production preview
  loaded successfully.
- Lighthouse mobile preview: Performance 100, Accessibility 96, Best
  Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 20 ms. The accessibility score
  meets the required ≥95 gate; axe found no violations.
- The current live URL was smoke-checked over HTTPS: HTTP 200, correct title,
  `lang`, `<main>`, image alt text, and no browser console/page errors. It is
  the pre-deploy revision, so the repaired P1 behavior must be rechecked there
  after the factory deploys this commit.

Current production asset sizes remain within budget: JavaScript 15.88 KB raw /
6.25 KB gzip and CSS 16.72 KB raw / 4.76 KB gzip; the unchanged hero WebP is
77.3 KB.

## Known gaps / next steps

- Deploy `dist/`, then rerun the independent verifier's live desktop/mobile
  keyboard and incomplete-GPX checks against the new revision.
- The research brief's 30-pair real-world corpus is still absent, so its 90%
  material-detour recall target remains unmeasured.
- Separate GPX track segments are intentionally joined in v1; intentional gaps
  and antimeridian-crossing routes need segment-aware handling in a future
  iteration.

## Deployment

Deploy `dist/` as the existing static Azure web app. No secrets, backend,
analytics, payment, DNS, or billing changes are required.
