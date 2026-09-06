# Compare planned and exported GPX routes — review 1

Date: 2026-09-06 UTC  
Live URL: <https://route-fidelity-check.sociobot.in>  
Implementation reviewed: `3c240d13424d95c26cd5acf9f41796f10af9de4e`  
Documentation reviewed: `3aae0e3b9f83a74c380c2da29d52f22ff43357cc`  

## Verdict: FAIL

There are 9 findings: 0 critical, 2 high, 4 medium, and 3 low. There
are 15 untested public claims. PASS requires zero findings and zero untested
claims.

The route comparison itself works. The live product loads realistic sample
files, finds a material detour, handles invalid inputs, works with keyboard and
phone input, and reloads offline. It fails the current factory contract because
it has no demo sandbox, no claim registry, and several required page and PWA
parts are missing.

## Job, audience, and first action before scrolling

- Job: compare a planned GPX line with an exported GPX line before a ride.
- Audience: cyclists and club ride leaders who need to catch a changed route.
- Required first action: try the complete task with sample data, or choose the
  intended GPX file.
- What the live page shows: “Did your route make the trip?” does not name the
  comparison job. It does not name cyclists or club ride leaders. “Try an
  example” starts at 861 px in a 900 px desktop viewport and at 788 px in an
  844 px phone viewport, so the control is clipped at the bottom on both fresh
  first screens. The hero has no primary action.

Evidence:

- `/work/.evidence/route-fidelity-check-review-1/desktop-first-screen.png`
- `/work/.evidence/route-fidelity-check-review-1/phone-first-screen.png`

## Findings

### RFC-01 — High — The sample is not the required demo sandbox

`/demo` returns an intentional HTTP 404. The home-page “Try an example” action
loads two realistic GPX files, but it does not run the comparison. A second
click on “Compare routes” is required before value is shown. The sample mode
has no persistent “Demo — sample data, nothing is saved” label, no “Reset
demo,” and no “Start for real.” There is no `.factory/demo.md`.

The sample did not change cookies, local storage, session storage, or IndexedDB,
so no real data was changed. This confirms privacy behavior but does not replace
the required visible sandbox state and controls.

Required action: add `/demo` or `?demo=1`, show populated output after one
click, keep the demo label and reset/start controls visible, document the demo,
and test that demo state never reads or writes real state.

### RFC-02 — High — Public claims have no claim registry or tagged tests

`.factory/claims.json` is absent. The repository contains no `@claim:` test.
There were therefore no declared claim commands to run. Fifteen public claims
remain untested under the claims contract even where this review observed the
behavior independently.

Required action: list every retained public claim in `.factory/claims.json` and
give each exactly one observable `@claim:<id>` test. Remove statements that
cannot be tested.

### RFC-03 — Medium — The brief's accuracy result is still not proved

The researched success measure requires at least 90% detection on a 30-pair
planned/exported GPX corpus and a reviewable result within 15 seconds. The
repository has no such corpus or recall test. The README correctly says that
this still needs validation, so the product does not make a false public
accuracy claim. The acceptance result itself remains unproved.

Required action: add a versioned, anonymised 30-pair corpus with known material
detours and an automated recall and duration check.

### RFC-04 — Medium — The first screen does not meet the plain-words contract

The question “Did your route make the trip?” does not name the job and uses an
indirect phrase. The next text does not name cyclists or club ride leaders. The
sample action is clipped at the bottom instead of sitting beside a short note
that explains what happens. The first screen gives one privacy fact, not three
plain privacy, offline, and price facts. “GPX handoff preflight” and “Normalize
density” add jargon. `.factory/copy-audit.md` is absent.

The route chart's text alternative also says “1 review zones were found” for a
single zone.

Required action: use a job title such as “Compare planned and exported GPX
routes,” name the audience in one sentence, place the complete sample action in
the hero with its result explained, add the three facts, fix singular wording,
and complete the required copy audit.

### RFC-05 — Medium — Required routes and the shared page structure are incomplete

An unknown path correctly returns HTTP 404, but its body is the working home
page with the home title and comparison form. It is not a designed 404 page and
does not explain the missing page. Privacy and terms use different headers and
footers, have no skip link or header navigation, and omit the product one-line
description, “Built by Param Factory,” and a build id. The home header has no
site navigation. `/demo` is also absent as noted in RFC-01.

Required action: add a product-styled 404 body with a clear home link, use the
standard header and footer on every route, and give every route its own title
and navigation behavior.

### RFC-06 — Medium — Offline delivery is not a complete PWA

The service worker controls the page and the app reloads offline after the
first visit. Its cache is versioned and old cache names are deleted. However,
there is no `manifest.webmanifest`, 192 px or 512 px install icon, maskable icon,
standalone start URL, or installed-app presentation. There is no visible
“update available” control. `/manifest.webmanifest` returns 404.

Required action: add the required manifest and icons, then expose and test the
service-worker update state without interrupting an active comparison.

### RFC-07 — Low — Required metadata and social artwork are absent

The home page has a useful title and description, but it has no canonical link,
Open Graph metadata, Twitter card metadata, 1200×630 product image, or Apple
touch icon. Privacy and terms have no descriptions or canonicals. The sitemap
cannot list the required demo route because that route is absent.

Required action: add route-specific canonical and sharing metadata, original
sharing artwork, and the required icons and sitemap entries.

### RFC-08 — Low — Some manual accessibility requirements fail

Axe found no serious or critical issue, and keyboard focus is visible. Manual
measurement found footer link targets from 16 to 30 px high on desktop and 16
to 22 px high on phone. These are below the required 44 px target. Privacy and
terms also lack the required skip link. The one-zone chart description has the
singular grammar error recorded in RFC-04.

Required action: enlarge the linked target boxes to at least 44×44 CSS px and
add a visible-on-focus skip link to every page.

### RFC-09 — Low — The privacy page does not give a direct request method

The privacy page says questions can be sent “through Sociobot,” but the link is
only the general `https://sociobot.in` home page. It gives no email address,
form URL, or other direct way to send a privacy request from this product.

Required action: link to a specific privacy contact form or provide a direct
privacy contact address.

## Public claims without declared tests

All rows below count toward `untested_claim_count`. Independent observations do
not satisfy the required one-test-per-claim registry.

| # | Public claim | Where | Independent observation |
| --- | --- | --- | --- |
| 1 | Compares intended and exported routes and flags separation | Home metadata, README | Sample and identical pairs worked |
| 2 | Accepts GPX tracks and routes by picker or drop | README, upload controls | Picker worked; unit test covers route points |
| 3 | Distance sampling prevents point density from distorting results | Home, README | Unit test covers different density |
| 4 | Two-way checking catches detours, shortcuts, and loops | Home, README | No declared claim test |
| 5 | Groups review zones and reports four metrics | README | Sample showed one zone and four metrics |
| 6 | Shows a tile-free aligned trace and focuses a zone | Home, README | Focus and reset worked |
| 7 | Prints a review checklist | UI, README | Print handler ran |
| 8 | Copies a comparison summary | UI, README | Clipboard contained the summary |
| 9 | Works offline after the first load | README, network status | Controlled offline reload worked |
| 10 | GPX files and results stay in browser memory and are not uploaded | Home, README, privacy | Requests stayed first-party; no data store changed |
| 11 | Refreshing or closing clears route and checklist state | Privacy | No declared claim test |
| 12 | Uses no accounts, analytics, tiles, third-party scripts, cookies, ads, or tracking pixels | README, privacy | Source and request capture support it |
| 13 | The service is free | Footer, terms | No declared claim test |
| 14 | GPX files up to 15 MB are accepted | Upload controls | 15 MB + 1 byte was rejected; the exact boundary is untested |
| 15 | 50 m is a useful first pass for road and trail handoffs | Threshold help | No evidence or test supports this advice |

## Product paths tested

### Sample and normal result

Fresh desktop and phone contexts loaded the live home page. The sample names
were “Saturday river loop — intended” and “Saturday river loop — device
export.” The comparison returned:

- 74.1% fidelity
- 664 m largest separation
- +816 m distance change
- 1 review zone covering 1.12 km

The trace, focus/reset controls, clipboard summary, print action, and keyboard
checklist control worked. The result says it is a geometry check and does not
claim safety, access, surface, closure, or legal status.

### Boundary, invalid, and recovery paths

- Identical GPX lines at 10 m and 500 m returned 0 zones and 100.0% fidelity.
- Thresholds 9, 501, and blank produced “Choose a threshold from 10 to 500
  metres.”
- Empty, malformed XML, invalid-coordinate, one-point, wrong-extension, and
  15 MB + 1 byte files each produced a specific recovery message.
- Replacing the bad file with a valid GPX enabled comparison again.

### Phone, keyboard, motion, and accessibility

- Fresh 1440×900 desktop and 390×844 phone contexts were used.
- The skip link had a 3 px visible focus outline. Upload controls and populated
  controls were keyboard operable. There was no keyboard trap.
- Reduced motion changed animation and transition duration to 0.01 ms.
- Playwright axe checks on initial, populated, privacy, terms, demo-404, and
  unknown-404 states found no serious or critical violations.
- Axe's own temporary inline-style probes caused four expected CSP block
  messages. A product-only flow had no console or page errors.

### Privacy, offline, links, and responses

- All observed product requests stayed on
  `https://route-fidelity-check.sociobot.in`.
- Cookies, local storage, session storage, and IndexedDB remained empty.
- The route-fidelity cache was the only browser data created.
- Offline reload worked in a separate service-worker-controlled phone context.
- Home, privacy, terms, robots, sitemap, Sociobot, and source links returned
  HTTP 200. `/demo`, `/manifest.webmanifest`, and an unknown route returned
  deliberate HTTP 404 responses. The unknown-route body is defective as
  described in RFC-05; the 404 status itself is expected.
- Live headers include HSTS, CSP with `frame-ancestors 'none'`, `nosniff`, a
  strict-origin referrer policy, and camera, microphone, and geolocation denial.

This is a static product. Backend tenant, database persistence, health, and
429/Retry-After checks do not apply. CLI, library, and desktop installed-artifact
checks do not apply.

## Earlier findings

| Earlier item | Current disposition | Evidence |
| --- | --- | --- |
| File chooser had no visible keyboard focus | Fixed | Both chooser buttons passed the browser suite; visible 3 px focus remains in live CSS |
| Malformed XML was accepted | Fixed | Live malformed XML showed the recovery error and kept comparison disabled |
| Upload helper contrast was 2.21:1 | Fixed | Live computed color is `#e1f3ea`; axe found no contrast issue |
| 30-pair accuracy corpus was absent | Still open | No corpus or recall command exists; RFC-03 |
| Intentional segment gaps and antimeridian routes were future work | Documented limitation | README still states these limits and makes no support claim |

## Clean checkout commands

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 57 packages, 0 audit vulnerabilities |
| `npm test` | Pass; 8/8 tests |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` before browser install | Could not launch because Playwright 1.62 Chromium was absent |
| `npx playwright install chromium` | Installed the documented browser prerequisite |
| `npm run test:browser` after install | Pass |
| Every `.factory/claims.json` command | None exist; the file is absent |

Build output was 15.88 kB raw / 6.25 kB gzip JavaScript, 16.76 kB raw /
4.78 kB gzip CSS, and a 77.32 kB hero image. Live mobile Lighthouse reported
Performance 100, Accessibility 100, Best Practices 100, and SEO 100. FCP was
1.0 s, LCP 1.2 s, TBT 0 ms, and CLS 0.

## Live implementation identity

The later commits `d088e55` and `3aae0e3` only changed reports. The last product
implementation is `3c240d1`. The live files match a fresh build from that
implementation line:

| File | SHA-256 |
| --- | --- |
| `index.html` | `879d4de41063fc34d45662589ee589aed91645c9f2f4f474d84cfad11eb3ee19` |
| JavaScript | `b1fc154802b1d1e0b4f11db5315d6eafe39f71ce3ba4bec0ceb27d28b65d782e` |
| CSS | `1df8d1d5051b9a3a2a228a317f651f3a7f916c730b460176af6c3e44e65d32f9` |
| Service worker | `b387b9a2d73d5b3cc1d10120aced4ee9b1233163415b5cb7c03f5180959897a5` |

## Evidence files

- `/work/.evidence/route-fidelity-check-review-1/live-audit.json`
- `/work/.evidence/route-fidelity-check-review-1/live-audit-summary.json`
- `/work/.evidence/route-fidelity-check-review-1/lighthouse-live.json`
- `/work/.evidence/route-fidelity-check-review-1/desktop-first-screen.png`
- `/work/.evidence/route-fidelity-check-review-1/phone-first-screen.png`
- `/work/.evidence/route-fidelity-check-review-1/desktop-sample-result.png`
- `/work/.evidence/route-fidelity-check-review-1/phone-sample-result.png`
- `/work/.evidence/route-fidelity-check-review-1/404-page.png`
