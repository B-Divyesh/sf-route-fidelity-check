# Independent verification 2 — FAIL

**Candidate:** `9675bab25bca89d3e118a5239ba2ae1df3d146a6` (`9675bab`)

**Live URL:** <https://route-fidelity-check.sociobot.in>

**Date:** 2026-08-27 UTC

## Verdict

**FAIL — do not promote.** The two P1 defects in the earlier independent
verification are repaired, the core GPX comparison works locally and in the
deployed site, and the live files are byte-identical to the candidate.
However, the required axe serious/critical gate fails on both targets because
the two upload helper captions do not meet text contrast requirements.

## Release-blocking defect

### P1 — upload helper text fails WCAG AA contrast

On the initial route-upload screen, axe 4.13 reports one `color-contrast`
violation with two affected nodes:

- `#intended-chooser > span > em` — “or drop it here · up to 15 MB”
- `#exported-chooser > span > em` — “or drop it here · up to 15 MB”

Each is 13px normal text in `#8daea2` over the rendered upload-button
background. Axe measures **2.21:1**, below the required **4.5:1**, and rates
the violation **serious**. This was reproduced against the production preview
and the deployed URL at 1440×900. It directly violates the factory contrast
and axe baseline; the helper is part of the primary input workflow.

## Candidate and deployment identity

- The checkout was clean at `9675bab25bca89d3e118a5239ba2ae1df3d146a6`.
- `dist/index.html` exactly matched the live HTML (9,276 bytes).
- SHA-256 checksums matched between build and live deployment:
  - JS `index-CGy7TBS1.js`: `6a121df7c8c7beff42867ae6ffa23c1a0bc284317d6f1c7c40e1daf7306aa533`
  - CSS `index-DSlA0nfg.css`: `4db08cfb006693520ac01b2f925826d79ab65c0fb64676052630965ac470762a`
  - hero WebP: `993ebc53c9c365482d25c5806b2ceccb082df22662367fd3f65d15fcef2cc3c7`
  - service worker: `b387b9a2d73d5b3cc1d10120aced4ee9b1233163415b5cb7c03f5180959897a5`

Therefore the live failure is the candidate failure, not a stale deployment.

## Clean-checkout checks

Commands run:

```sh
npm ci
npm test
npm run build
npm run test:browser
```

- `npm ci` completed with 0 vulnerabilities.
- `npm test` passed: **8/8 tests**, GPX parsing and comparison behavior.
- `npm run build` passed (`tsc --noEmit && vite build`) and produced `dist/`.
  There is no standalone lint script; the TypeScript check is part of build.
- `npm run test:browser` passed after installing the clean environment's
  missing Playwright Chromium binary. It covers desktop and 390px keyboard file
  chooser operation, visible focus, hidden-input tab order, and malformed GPX
  recovery.
- Built assets: JS **15,877 B raw / 6,250 B gzip**; CSS **16,722 B raw /
  4,760 B gzip**; hero WebP **77,322 B**. All applicable static-site budgets
  pass; no webfont bytes ship.
- Local mobile Lighthouse output: Performance **100**, Accessibility **96**,
  Best Practices **100**, SEO **100**; LCP **1.5 s**, CLS **0**, TBT **0 ms**.
  The score does not override axe's serious contrast failure.

## End-to-end product exercise

Separate Playwright checks were run against the production preview and the
live deployment at desktop and 390×844 mobile.

- **Normal material detour:** the included example produced **1 review zone**;
  an independently supplied three-point intended line and detour export also
  produced 1 zone. The result rendered its SVG trace; Focus trace and Show full
  route worked. Print checklist and Copy summary actions were invoked.
- **Equivalent/boundary:** identical GPX files yielded **0 review zones** and
  **100.0%** fidelity. The threshold control accepted its maximum `500` m and
  rejected `501` with native validation.
- **Malformed/recovery:** invalid latitude `999` showed the actionable
  coordinate error and disabled Compare. Replacing it with a valid detour
  restored the manifest and Compare, then produced one zone. An unterminated
  XML GPX showed “incomplete or malformed … Re-export the complete GPX file”
  and kept Compare disabled.
- **Keyboard:** from Try an example, Tab reaches the visible intended and
  exported chooser buttons (not their hidden native inputs); each receives a
  computed 3px focus outline and activates its native picker with Enter. This
  repairs both prior P1 defects.
- **Mobile and motion:** at 390px, `scrollWidth = clientWidth = 390`; the
  detour result works. With `prefers-reduced-motion: reduce`, transition
  duration is 0.00001 seconds. No console or page errors were observed.
- **Accessibility:** privacy and terms had zero serious/critical axe findings.
  The main page's two serious contrast nodes above fail the release gate on
  both local and live targets.

## Privacy, security, PWA, and delivery

- Route files are parsed and compared in browser memory. Runtime browser
  sessions had zero cookies, local-storage entries, and session-storage
  entries. All observed requests (eight per run, including the worker/cache
  path) stayed on the respective first-party origin; no analytics, tiles,
  third-party scripts, or fonts were requested.
- The privacy and terms pages accurately disclose local processing, offline
  cache, no tracking, and the geometry-only/non-safety limitation. The main
  result and terms also make that limitation clear.
- Live responses supply HSTS, `nosniff`, strict-origin referrer policy,
  restrictive Permissions-Policy, and a self-only CSP with
  `frame-ancestors 'none'`. The static configuration's `X-Frame-Options` is
  not visible in the live response, but CSP `frame-ancestors 'none'` provides
  the relevant framing protection.
- Live HTML, privacy, terms, and `/sw.js` cache for 30 seconds with
  `must-revalidate`; hashed JS, CSS, and WebP are
  `public, max-age=31536000, immutable`.
- On both targets, the service worker became controlling and active;
  `registration.update()` completed, and an offline reload after first load
  rendered the application successfully. A true changed-version transition
  could not be simulated because only one worker revision is deployed.

## Scope note

The implementation conforms to the researched smallest useful product: two
local GPX lines, a user-set material-difference threshold, geometric review
zones, and a printable ride-leader checklist, with no route-planning claims.
The brief's 30-pair real-world corpus is not present, so the stated 90%
material-detour recall target remains unmeasured.

## Required next step

Raise the helper-caption foreground/background contrast to at least 4.5:1 in
the actual rendered upload surface, then rerun axe on the initial main page at
desktop and 390px and repeat this independent verification.
