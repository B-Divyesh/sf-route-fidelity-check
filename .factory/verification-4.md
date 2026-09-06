# Compare planned and exported GPX routes — verification 4

Date: 2026-09-06 UTC  
Live URL: <https://route-fidelity-check.sociobot.in>  
Implementation reviewed: `4a17b224ae6b88b6dc1a74012859069091c6abe1`  
Documentation baseline: `73f9c3f3bfda2417794f87d0646b96880051dc59`

## Verdict: PASS

There are **zero findings** at every severity and **zero untested public
claims**. The documentation commit differs from the implementation candidate
only by `.factory/handoff.md`; the deployed artifacts are byte-identical to a
fresh production build from the candidate line.

## Job, audience, and first action before scrolling

- Job: compare a planned GPX route with an exported GPX route before a ride.
- Audience: cyclists and club ride leaders checking whether an app or device
  changed a route before the group follows it.
- First action: **Try it with sample data**. It says that a river-route detour
  loads with the comparison complete.

Fresh 1440×900 desktop and 390×844 phone contexts showed all three before
scrolling. The phone had no horizontal overflow and the sample action ended at
451 px in an 844 px viewport. The first Tab key focused the visible skip link.

## Live product verification

One click from the home page opened `/demo` and immediately rendered the
realistic Saturday river loop result:

- persistent label: “Demo — sample data, nothing is saved”;
- planned route: 10 points, 5.13 km; exported route: 11 points, 5.95 km;
- 74.1% fidelity, 664 m largest separation, +816 m distance change, and one
  review zone;
- aligned trace, zone controls, four-item rider checklist, copy and print
  controls.

Checking a demo checklist item and choosing **Reset demo** restored the sample
and left the item unchecked (`Demo reset. The sample comparison is ready.`).
Choosing **Start for real** returned to `/` with the demo strip and results
hidden. The claim test also installed an untouched `real:` local-storage
sentinel and proved it remained unchanged throughout these actions.

Normal, invalid, boundary, and recovery paths passed. A malformed GPX produced
“This GPX XML is incomplete or malformed. Re-export the complete GPX file and
try again.”, disabled comparison, and accepted a valid replacement. The exact
15 MiB file succeeded while 15 MiB plus one byte failed. Threshold values 10
and 500 succeeded; 9 and 501 were rejected. The checked-in corpus produced
27/27 known changes, zero false positives on three controls, and every result
under 15 seconds.

The demo and upload controls are keyboard operable, including native file
chooser activation from Enter; hidden file inputs are not in the tab order.
Reduced-motion emulation reduced the results animation to `1e-05s`. Serious
and critical Axe findings were zero on populated desktop and phone demos,
privacy, terms, the explicit 404, and an unknown route. The standalone
`@axe-core/cli` could not locate a system Chrome binary in this container, so
the required equivalent Playwright Axe integration was used with the pinned,
preinstalled browser; this is a tool prerequisite limitation, not an
application result.

The live request capture during the entire home-to-demo flow contained only
`https://route-fidelity-check.sociobot.in`. The local processing and
tracking-free claim tests also proved no uploads, no cookies, and no route-data
web storage. A service-worker-controlled fresh phone context reloaded `/demo`
offline with the demo label and one-zone result intact. The manifest and all
192 px, 512 px, and maskable icons returned 200.

`/privacy/`, `/terms/`, `/404.html`, and an unknown route have one h1, a skip
link, shared header navigation, shared footer, 44 px or larger header/footer
targets, and no serious or critical Axe result. The unknown route returned the
expected HTTP 404 with title “Page not found — Route Fidelity Check” and a
designed recovery page. This expected status is not a defect. All home links,
including the repository source link, were reachable; the external source link
returned 200. Privacy includes a direct product-subject `mailto:` request.

Live response headers include HSTS, `nosniff`, strict-origin referrer policy,
the restrictive CSP with `frame-ancestors 'none'`, and denied camera,
microphone, and geolocation permissions. No product-flow console or page error
occurred. Axe’s temporary inline-style probe logs CSP blocks by design and was
not counted as an application console error.

## Declared claims and clean commands

After `npm ci` (59 packages, zero audit vulnerabilities), these declared
quality commands passed from this checkout:

```sh
npm test                 # 8/8 unit tests
npm run build            # dist/ produced
npm run test:browser     # desktop/phone, keyboard, routes, Axe, PWA checks
npm run test:claims      # 18/18 claims together
```

Each of the 18 exact commands in `.factory/claims.json` was then run
individually, in registry order. All passed. The final individual
`@claim:installable-pwa` command passed, which follows the corpus claim and
therefore confirms the `set -e` registry loop completed all entries. The
registry has exactly one matching `@claim:<id>` test for each of:

`demo-sandbox`, `compare-separation`, `gpx-inputs`, `density-normalization`,
`bidirectional-changes`, `review-metrics`, `tile-free-trace`,
`print-checklist`, `copy-summary`, `offline-reload`, `local-processing`,
`ephemeral-state`, `tracking-free`, `free-use`, `file-size-boundary`,
`threshold-range`, `corpus-recall`, and `installable-pwa`.

The landing page, populated demo, README, privacy, and terms copy were
cross-checked against that registry. Every visitor-relevant product promise is
covered by one of these observable tests; no unlisted or untested public claim
was found.

## Earlier findings disposition

| Earlier item | Current disposition | Current evidence |
| --- | --- | --- |
| RFC-01 demo sandbox | Fixed | One-click `/demo`, complete output, persistent label, reset/start-real, isolated sentinel test. |
| RFC-02 claim registry | Fixed | 18 entries, exactly one tagged outcome test each, all individual commands passed. |
| RFC-03 30-pair accuracy result | Fixed | 27/27 known changes, 0 false positives, <15 s result test. |
| RFC-04 first-screen plain words and singular result | Fixed | Fresh desktop/phone inspection and copy audit; current result says “1 route change”. |
| RFC-05 routes and shared structure | Fixed | Demo, legal routes, and designed unknown-route 404 verified live. |
| RFC-06 PWA delivery | Fixed | Manifest/icons, service-worker offline reload, and non-interrupting update regression passed. |
| RFC-07 metadata and sharing art | Fixed | Canonicals, descriptions, social image metadata, touch icon, and sitemap are live. |
| RFC-08 touch targets and skip links | Fixed | Every audited header/footer target was at least 44 px; Axe and keyboard checks passed. |
| RFC-09 direct privacy contact | Fixed | Live privacy page has product-subject `mailto:` contact. |
| Keyboard chooser focus | Fixed | Desktop and phone regression activates both native choosers from Enter with a 3 px focus outline. |
| Malformed XML acceptance | Fixed | Live invalid-file error, disabled action, and successful replacement verified. |
| Upload-helper contrast | Fixed | Browser regression tested rest, hover, focus, and drag states with no Axe contrast violation. |
| Antimeridian / intentional-segment limits | Documented, not advertised as supported | README and handoff retain the limitation without a contradictory claim. |

## Deployment fidelity and performance

`git diff --name-status 4a17b22..73f9c3f` reports only
`.factory/handoff.md`. A new local build and the live files had these matching
SHA-256 values:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `c47f9d9d922eee5dcbc04e410e7c8b3442e530960bba3e621a8bd2d36f01e42d` |
| JavaScript | `10ca8e65c9c33a1b1a69de297c42662aa4bb9152b34ce3b0dc7cfca331c11f2e` |
| CSS | `bf317dce4c2022534bfe1c946159401445f92c4d2696160015ebf58e72faea6f` |
| `sw.js` | `ef91f6f70878392c5a370e055e07ee5ece3928aec77df7e986923144774ebadf` |

The build contains 17.51 KB raw / 6.76 KB gzip JavaScript and 20.10 KB raw /
5.39 KB gzip CSS. Live mobile Lighthouse measured Performance 100,
Accessibility 100, Best Practices 100, SEO 100, and LCP 1.2 s.

## Evidence

Evidence is in `/work/.evidence/route-fidelity-check-verification-4/`:
desktop and phone first-screen/demo screenshots, `live-audit.json`,
`structure-audit.json`, deployed artifact copies, and `lighthouse.json`.

This is a static browser product. Backend tenant isolation, persistence,
health, live request allowance, and 429/Retry-After checks do not apply. CLI,
library, and desktop installed-artifact checks do not apply.
