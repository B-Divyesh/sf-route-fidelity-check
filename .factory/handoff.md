# Compare planned and exported GPX routes — repair handoff

## Status: independent review 2 passed

Implementation SHA: `4a17b224ae6b88b6dc1a74012859069091c6abe1`.

That implementation is deployed at
<https://route-fidelity-check.sociobot.in>. The live HTML, JavaScript, CSS, and
service worker match the local production build byte for byte.

Verification documentation SHA: `7dc0a019e386499bae0789d30c66c40bfa22ee74`.
The following annotation commit only records that SHA and does not change the
deployed product artifact.

## What changed

- Replaced the indirect first-screen heading with “Compare planned and exported
  GPX routes.” It now names cyclists and club ride leaders, shows both first
  actions, and lists privacy, offline, and price facts before scrolling.
- Added `/demo`. One click opens a completed river-route comparison with a
  sticky “Demo — sample data, nothing is saved” label, reset, and start-real
  actions. Demo state is isolated in memory.
- Added `.factory/claims.json` with 18 public claims. Each claim has exactly one
  tagged browser outcome test and its own clean command.
- Added a versioned 30-pair GPX corpus: 27 known detours, shortcuts, or loops
  plus three clear controls. The UI-level test detected 27/27 changes, produced
  no false positives, and rendered the slowest result in 530 ms.
- Added a designed 404, offline page, shared legal-page header/footer, route
  titles, skip links, 44 px link targets, and a direct privacy email action.
- Added the web-app manifest, 192 px and 512 px icons, maskable icon, Apple
  touch icon, versioned service-worker cache, network-first navigation fallback,
  and a non-blocking update notice.
- Added canonical, Open Graph, and Twitter metadata plus original 1200×630
  sharing artwork derived from the existing generated landscape.
- Added the required demo, copy audit, catalog description, and design
  provenance documents. The catalog copy was also written to
  `/work/.evidence/catalog-description.txt`.

## Review 1 disposition

| Finding | Disposition | Evidence |
| --- | --- | --- |
| RFC-01 demo sandbox | Fixed | `/demo`, `.factory/demo.md`, and `@claim:demo-sandbox` prove one-click output, label, reset, start-real, and real-data sentinel isolation. |
| RFC-02 claim registry | Fixed | `.factory/claims.json` has 18 entries and the test file has exactly one matching tag per entry. Every declared command passed after `npm ci`. |
| RFC-03 30-pair result | Fixed | `test-data/corpus/` has 60 GPX files plus ground truth. Recall was 27/27, clear controls 3/3, slowest result 530 ms. |
| RFC-04 first-screen words | Fixed | Cold phone and desktop screenshots show the job, audience, first action, and three facts. `.factory/copy-audit.md` has no sentence over 22 words or banned term. Singular route-zone copy is correct. |
| RFC-05 routes and structure | Fixed | `/demo` returns 200. Unknown routes return a designed 404 body with HTTP 404. Home, privacy, terms, offline, and 404 pages share navigation, footer, build id, and one `<h1>`. |
| RFC-06 complete PWA | Fixed | Manifest and required icons return 200. Offline demo reload passes in an isolated phone context. Update availability is announced without hiding an active result. |
| RFC-07 metadata | Fixed | Home and legal routes have descriptions, canonicals, social metadata, touch icon, and product artwork. The sitemap lists `/demo`. |
| RFC-08 manual accessibility | Fixed | Header/footer link targets measure at least 44×44 px. Every page has a focus-visible skip link. Axe found no serious or critical issue. |
| RFC-09 privacy contact | Fixed | `/privacy/` links directly to `hello@sociobot.in` with a product-specific subject. |

Earlier keyboard chooser focus, malformed XML acceptance, and upload-caption
contrast repairs remain covered by `npm run test:browser` and still pass.

## Clean verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run test:browser
npm run test:claims
npm run build
```

Results on 6 September 2026:

- `npm ci`: passed; 60 packages audited and zero vulnerabilities.
- `npm test`: 8/8 unit tests passed.
- `npm run test:browser`: passed desktop and phone demo, axe, touch target,
  keyboard, malformed XML, route structure, reduced motion, and update checks.
- All 18 commands in `.factory/claims.json`: passed individually.
- `npm run test:claims`: 18/18 passed together on the final implementation.
- `npm run build`: passed and produced `dist/`.
- Production payload: JavaScript 17.51 KB raw / 6.76 KB gzip; CSS 20.10 KB
  raw / 5.39 KB gzip; hero 77.32 KB. No webfont ships.
- `git diff --check`: passed.

## Live verification

The existing `sf-route-fidelity-check` Static Web App was reused. Deployment
succeeded with ID `e2336162-8749-466d-acde-1d19e45776e4`. No backend, database,
volume, secret, billing resource, DNS target, or replica setting changed.

Fresh desktop 1440×900 and phone 390×844 browser contexts verified:

- The job, audience, and sample action appear before scrolling.
- One sample click opens realistic names, four populated metrics, one review
  zone, the aligned trace, and the checklist.
- The demo label remains at the top; reset restores the sample and clears its
  checklist; start-real opens an empty comparison. A real-data sentinel stays
  unchanged.
- No horizontal overflow, console error, page error, serious axe issue, or
  critical axe issue appeared.
- All observed product requests were first-party.
- A service-worker-controlled phone reloaded `/demo` offline with its title,
  label, and one-zone result intact.
- Home, demo, privacy, terms, manifest, sitemap, robots, social art, install
  icon, and source link returned 200. An unknown route returned the expected
  HTTP 404 with the designed page.
- Live CSP, HSTS, referrer policy, `nosniff`, and denied device permissions are
  present.

Live mobile Lighthouse:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 100 | 100 | 100 | 0.9 s | 1.2 s | 0 ms | 0 |

The full-page screenshot audit was disabled because this container's Lighthouse
Chromium crashes in that capture mode. Lighthouse completed normally with that
capture disabled. Independent Playwright screenshots cover both viewports.

Live/local SHA-256 matches:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `c47f9d9d922eee5dcbc04e410e7c8b3442e530960bba3e621a8bd2d36f01e42d` |
| JavaScript | `10ca8e65c9c33a1b1a69de297c42662aa4bb9152b34ce3b0dc7cfca331c11f2e` |
| CSS | `bf317dce4c2022534bfe1c946159401445f92c4d2696160015ebf58e72faea6f` |
| Service worker | `ef91f6f70878392c5a370e055e07ee5ece3928aec77df7e986923144774ebadf` |

Evidence is under
`/work/.evidence/route-fidelity-check-repair-3/live/`, including desktop and
phone cold/demo screenshots, the 404 screenshot, browser audit JSON, response
headers, verifier output, and Lighthouse JSON.

## Known limits and next steps

- The acceptance corpus is anonymous, purpose-built geometry. It proves the
  declared regression outcome but does not replace later field testing with
  varied device and route-app exports.
- Separate GPX track segments are joined into one line. Very long routes that
  cross the antimeridian remain outside the geometry model. Both limits are
  stated in the README and are not advertised as supported.
- This product is free, so billing registration and
  `/work/.evidence/billing-offer.json` do not apply.

## Independent verification 4

Verification 4 reviewed implementation
`4a17b224ae6b88b6dc1a74012859069091c6abe1` against the live product and
documentation baseline `73f9c3f3bfda2417794f87d0646b96880051dc59`.

**Verdict: PASS.** Zero findings and zero untested public claims. The verifier
ran `npm ci`, `npm test`, `npm run build`, `npm run test:browser`, the combined
18-claim run, and each of the 18 declared claim commands individually. Fresh
desktop and phone live contexts checked the first screen, one-click sample,
demo isolation/reset/start-real, invalid and recovery inputs, keyboard,
reduced motion, accessibility, privacy, offline reload, legal pages, links,
metadata, PWA manifest/icons, designed 404, headers, and candidate byte
fidelity. Live mobile Lighthouse was 100/100/100/100 with a 1.2 s LCP.

See `.factory/verification-4.md` and
`/work/.evidence/route-fidelity-check-verification-4/` for the full evidence.

## Review 2

Review 2 independently rechecked implementation
`4a17b224ae6b88b6dc1a74012859069091c6abe1` against the live site. It records
documentation baseline `73f9c3f3bfda2417794f87d0646b96880051dc59`; later
report-only commits do not change the deployed artifact.

**Verdict: PASS.** Zero findings and zero untested public claims. A fresh
install passed `npm test`, `npm run build`, `npm run test:browser`, the
combined 18-claim run, and every individual declared claim command. Fresh
desktop and phone contexts passed the first screen, completed sample, demo
isolation/reset/start-real, invalid/recovery and boundary paths, keyboard,
reduced motion, Axe, privacy, offline reload, links, legal pages, headers,
manifest, and designed 404. The corpus claim measured 27/27 known changes,
zero false positives, and a 298 ms slowest result. Live HTML, JS, CSS, and
service worker matched the candidate hashes.

See `.factory/review-2.md` and
`/work/.evidence/route-fidelity-check-review-2/` for review evidence.
