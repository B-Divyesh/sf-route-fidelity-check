# Compare planned and exported GPX routes — review 2

Date: 2026-09-06 UTC
Live URL: <https://route-fidelity-check.sociobot.in>
Implementation reviewed: `4a17b224ae6b88b6dc1a74012859069091c6abe1`
Documentation baseline: `73f9c3f3bfda2417794f87d0646b96880051dc59`
Checkout reporting baseline: `ad860d9bc751c4c3a349140be17acc95e1a53b91`

## Verdict: PASS

There are **zero findings** at every severity and **zero untested public
claims**. The reporting-baseline commits after the implementation candidate
change documentation only; live HTML, JavaScript, CSS, and service worker are
byte-identical to the production build from the implementation candidate.

## Job, audience, and first action before scrolling

- Job: compare planned and exported GPX routes before a ride.
- Audience: cyclists and club ride leaders checking a route handoff.
- First action: **Try it with sample data**; it immediately opens a completed
  comparison.

Fresh 1440×900 desktop and 390×844 phone contexts showed all three before
scrolling. The first screen also shows the local-processing, offline, and
free-use facts.

## Live product checks

Fresh desktop and phone contexts completed the one-click sample flow. Each
showed realistic planned and exported route names, one review zone, four
populated metrics, the aligned trace, and four checklist items. The persistent
banner said “Demo — sample data, nothing is saved.” Reset cleared a checked
sample checklist item and restored the sample; Start for real discarded the
demo and opened an empty comparison.

The live malformed-input path gave a specific error and disabled comparison.
Replacing it with valid GPX restored comparison. Thresholds 9 and 501 were
rejected; 10 and 500 completed comparisons. The phone context reloaded `/demo`
offline after service-worker control and retained the demo title and one-zone
result.

No product console error or page error occurred. Request capture during the
flows was first-party only. Axe found zero serious or critical issues on the
home/demo flow, privacy, terms, and the designed 404. Keyboard chooser focus,
reduced motion, touch targets, route structure, malformed-GPX recovery, and
update notification also pass in the checked-in browser suite. No
`verify-url.sh` is present in this checkout; its title, language, main,
alternative-text, and console checks were reproduced by the direct browser
audits and Axe integration.

Home, demo, privacy, terms, manifest, sitemap, robots, icons, and every
internal linked destination returned 200. An unknown route returned the
expected HTTP 404 with the product-styled page titled “Page not found — Route
Fidelity Check” and the h1 “This page was not found.” Its deliberate 404 status
is not a defect. Live responses include self-only CSP with `frame-ancestors`,
HSTS, `nosniff`, strict referrer policy, and denied camera, microphone, and
geolocation permissions.

## Clean-checkout commands

After `npm ci` (60 packages audited; zero vulnerabilities), the following all
passed:

```sh
npm test
npm run build
npm run test:browser
npm run test:claims
```

`npm test` passed 8/8 tests. The build produced `dist/`; JS is 17.51 KB raw
(6.76 KB gzip), CSS is 20.10 KB raw (5.39 KB gzip), and no webfont ships.
`npm run test:browser` passed its desktop/phone regression suite. The combined
claim suite passed 18/18. `git diff --check` passed.

Every declared command in `.factory/claims.json` was also run independently.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | Pass |
| `compare-separation` | Pass |
| `gpx-inputs` | Pass |
| `density-normalization` | Pass |
| `bidirectional-changes` | Pass |
| `review-metrics` | Pass |
| `tile-free-trace` | Pass |
| `print-checklist` | Pass |
| `copy-summary` | Pass |
| `offline-reload` | Pass |
| `local-processing` | Pass |
| `ephemeral-state` | Pass |
| `tracking-free` | Pass |
| `free-use` | Pass |
| `file-size-boundary` | Pass |
| `threshold-range` | Pass |
| `corpus-recall` | Pass — 27/27 known changes, 0 false positives, 298 ms slowest result |
| `installable-pwa` | Pass |

The registry has 18 entries, the test file has 18 matching `@claim:` tags,
and there are no missing, duplicate, or extra tags. Landing-page and README
claims match the registry; no unlisted public claim was found.

## Earlier findings disposition

| Earlier item | Current disposition |
| --- | --- |
| Review 1 RFC-01 demo sandbox | Fixed and passing: `/demo`, completed sample, label, reset, start-real, and isolation test. |
| Review 1 RFC-02 claim registry | Fixed and passing: 18 observable claims, one tagged test each, every declared command passed. |
| Review 1 RFC-03 corpus proof | Fixed and passing: checked-in 30-pair corpus measured 27/27 known changes, no false positives, under 15 seconds. |
| Review 1 RFC-04 first-screen wording and singular copy | Fixed: job, audience, action, and three facts are visible before scroll; current sample copy is singular. |
| Review 1 RFC-05 routes and shared structure | Fixed: demo/legal routes, shared navigation/footer, route titles, and designed unknown-route 404 pass. |
| Review 1 RFC-06 PWA delivery | Fixed: manifest/icons, service worker, offline reload, and update notice pass. |
| Review 1 RFC-07 metadata | Fixed: canonical and social metadata, original social art, touch icon, and sitemap are present. |
| Review 1 RFC-08 accessibility | Fixed: skip links, 44 px targets, visible focus, and Axe serious/critical gate pass. |
| Review 1 RFC-09 privacy contact | Fixed: privacy page has a direct mailto request method. |
| Verification 1 keyboard focus and malformed XML | Fixed and covered by `npm run test:browser`. |
| Verification 2 upload helper contrast | Fixed and covered in rest, hover, focus, and drag states by the browser suite. |
| Verification 3 earlier corpus limitation | Superseded by the checked-in corpus and passing recall claim. |

## Artifact fidelity and evidence

Live/local SHA-256 matches:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `c47f9d9d922eee5dcbc04e410e7c8b3442e530960bba3e621a8bd2d36f01e42d` |
| JavaScript | `10ca8e65c9c33a1b1a69de297c42662aa4bb9152b34ce3b0dc7cfca331c11f2e` |
| CSS | `bf317dce4c2022534bfe1c946159401445f92c4d2696160015ebf58e72faea6f` |
| Service worker | `ef91f6f70878392c5a370e055e07ee5ece3928aec77df7e986923144774ebadf` |

Fresh-browser screenshots are in
`/work/.evidence/route-fidelity-check-review-2/`.

## Known limits

The product correctly documents that its anonymous, purpose-built corpus does
not replace field testing with varied device and route-app exports. It also
documents that intentional segment gaps are joined and antimeridian routes are
outside the geometry model. These are stated limits, not unsupported claims.
