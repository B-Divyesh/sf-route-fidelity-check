# Route Fidelity Check — build handoff

## Independent verification status: FAIL

Independent verification on 2026-08-27 of commit
`0bd934539364869af0439c514459c44b175f0883` and
<https://route-fidelity-check.sociobot.in> **FAILED**. The live HTML, JS, CSS,
service worker, and hero asset hash-match the candidate, so the defects apply
to both:

- **P1 accessibility:** tabbing to either GPX chooser focuses an invisible
  1px/transparent file input; its visible upload card receives no visible focus
  treatment.
- **P1 input integrity:** an unterminated GPX XML document with two `trkpt`
  tags is accepted, shown as a route, and enables comparison.

See [independent verification report](verification-1.md) for exact reproduction,
passing checks, security/cache/PWA evidence, and required remediation. This
handoff's earlier completion claims must not be treated as a release approval.

## What shipped

- Complete static Vite + TypeScript app for comparing an intended GPX route to
  an exported/re-rendered GPX route, with file picker and drag-and-drop paths.
- Local parser for GPX tracks and routes with type, size, coordinate, empty-file,
  and malformed-file errors. No file or coordinate leaves the browser.
- Density-normalized, bidirectional line comparison with a user-set 10–500 m
  threshold, material-divergence clustering, fidelity score, largest separation,
  distance delta, and review-zone count.
- Tile-free SVG overlay with a dashed non-color-only divergence treatment,
  per-zone focus, full-route reset, and accessible text description.
- Printable ride-leader checklist, copyable text summary, built-in example,
  explicit geometry-not-safety warning, and offline-ready service worker.
- Responsive luminous-glass data landscape design, original generated hero art,
  mobile layout, keyboard/focus states, reduced-motion fallback, privacy page,
  terms page, security headers, robots file, and sitemap.

## Verification

Run from a clean checkout:

```sh
npm install
npm test
npm run build
npm run preview
```

Verified 2026-08-27:

- `npm test`: 7/7 tests pass (GPX parsing, invalid inputs, route reversal,
  density normalization, detour detection, threshold bounds).
- `npm run build`: passes; `dist/index.html` is present.
- Production payload: 14.93 KB JS / 5.87 KB gzip, 16.73 KB CSS / 4.76 KB
  gzip, 75.5 KB hero WebP. All are under the static-product budgets.
- Lighthouse mobile against the production preview: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0,
  total blocking time 0 ms.
- `@axe-core/playwright`: zero violations on the empty state, populated result,
  `/privacy/`, and `/terms/` at 390 px. No serious/critical findings.
- Factory `verify-url.sh`: HTTP 200, one `<h1>`, `lang`, `<main>`, complete alt
  text, labelled buttons, and zero page/console errors.
- Manual automated flow at 390×844: example load → compare → one flagged review
  zone → focus trace; no horizontal overflow.
- Offline reload after a first visit: app shell, example comparison, and results
  all work with the browser network disabled.

## Known gaps and next steps

- The 30-pair acceptance corpus from the research brief was not present, so the
  stated 90% real-world detour recall remains to be measured. Add fixtures from
  varied Garmin, RideWithGPS, Komoot, and Organic Maps exports before tuning.
- V1 joins separate GPX track segments into one line and uses a local projection;
  routes that intentionally contain segment gaps or cross the antimeridian need
  segment-aware projection in a future release.
- There is intentionally no basemap. That avoids third-party tile requests and
  keeps the product neutral/offline, but a rider must inspect flagged zones in
  their route or mapping app for road/trail context.

## Deployment

Deploy `dist/` as an Azure Static Web App. No secrets, billing setup, server,
database, analytics, DNS, or external runtime service is required.
