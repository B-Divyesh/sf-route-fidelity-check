# Independent verification 3 — Route Fidelity Check

## Verdict: PASS

Candidate: `d088e5559690c8bd6de4878cf04f9ac72ddc3832` (`main`)

Production URL: <https://route-fidelity-check.sociobot.in>

Verified: 2026-08-27 (UTC), from a clean checkout at the candidate SHA.

This is an independent release check. Product source was not modified. The two
documentation files named below are the only repository changes made by this
verification.

## Scope and acceptance result

The static web product fulfils the researched job: a rider can load planned and
exported GPX lines locally, choose a material-separation threshold, receive
clear/no-change and detour verdicts with review zones and metrics, focus a
flagged trace, and print/copy a review checklist. The UI explicitly says the
result is geometric only and does not assert safety, legality, access, surface,
or closures.

No critical, high, medium, or low severity product defect was reproduced.

| Severity | Defects |
| --- | --- |
| Critical | None |
| High | None |
| Medium | None |
| Low | None |

### Acceptance-evidence note (not a release defect)

The repository has no supplied 30-pair real-world planned/exported corpus, so
the brief's 90% known-material-detour recall measure cannot be independently
quantified. This release has been verified with representative synthetic clear
and material-detour pairs, not claimed to meet that corpus outcome. A future
owner should add a versioned, anonymised corpus and recall test.

## Clean checkout, build, and repository checks

The checkout was clean and `HEAD` resolved to the candidate SHA before install.

| Check | Fresh result |
| --- | --- |
| `npm ci` | Pass; 57 packages installed; `npm audit` reported 0 vulnerabilities. |
| `npm test` | Pass; 8/8 Vitest tests across GPX parsing and route comparison. |
| Type check / exact production build | Pass via `npm run build` (`tsc --noEmit && vite build`); `dist/` produced. No separate lint script is defined in `package.json`. |
| `npm run test:browser` | Pass after installing the missing Playwright Chromium runtime in this clean container. The initial failure was only Playwright's explicit “Executable doesn't exist” prerequisite message, not an application failure. |
| Artifact budget | JS 15,877 B raw / 6,250 B gzip; CSS 16,755 B raw / 4,780 B gzip; hero WebP 77,322 B. Initial JS and CSS are far within the 200 KB / 50 KB budgets. |
| Working-tree integrity | `git diff --check` clean; no product source changes made. |

The checked-in browser suite covers desktop and 390px upload-caption contrast
in rest/hover/focus/dragging states, serious/critical axe findings,
keyboard-visible upload controls and malformed-GPX recovery. It passed against
a newly built production preview.

## Independent end-to-end browser evidence

I additionally ran an independent Playwright check against the freshly built
production preview and then the HTTPS deployment, at 1440×900 and 390×844.
It recorded requests and console/page errors, ran axe before and after results,
and exercised the following.

- Identical valid tracks: clear verdict, zero review zones at 50 m, and again
  at both inclusive UI bounds (10 m and 500 m).
- Representative reroute: a planned straight line versus an exported detour;
  the product rendered a needs-review verdict, one or more review zones,
  separation metrics, aligned trace, focus/reset trace controls, printable
  checklist, and copy-summary feedback. The mobile visual review showed a
  883 m material separation and one review zone.
- Input validation and recovery: empty GPX, malformed XML, invalid coordinates,
  one-point GPX, non-`.gpx` filename, and a 15 MiB + 1 byte file each produced
  specific user-facing errors. Replacing errors with two valid files restored
  the Compare action.
- Invalid threshold values 9, 501, and blank remained invalid and received the
  browser validity message; 10 and 500 were accepted.
- Keyboard-only behavior: skip link is present; the intended upload button is
  the next visible focus target after the example action, has a 3 px focus
  outline, and no hidden file input is in tab order. Enter opens its native
  chooser. The supplied browser regression also verifies both upload controls
  on desktop and mobile.
- Reduced-motion emulation reduces transition duration to 0.01 ms; no looping
  or flashing behavior was observed.
- Axe found zero serious or critical violations on initial and populated pages
  at both viewport sizes. The live strict CSP logged two notices only while
  Axe attempted its own temporary inline-style probe; CSP correctly blocked
  that tool injection. A separate real user flow without Axe had zero console
  errors and zero page errors.
- The independent request capture contained only same-origin app requests;
  no analytics, map tiles, third-party fonts, or GPX uploads occurred.

## Deployment fidelity, privacy, PWA, and response policy

The live deployment is the candidate artifact, not merely visually similar.
On 2026-08-27 the downloaded live `index.html`, JS, CSS, and service worker
were byte-identical to this candidate build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `879d4de41063fc34d45662589ee589aed91645c9f2f4f474d84cfad11eb3ee19` |
| `assets/index-CZekoAEg.js` | `b1fc154802b1d1e0b4f11db5315d6eafe39f71ce3ba4bec0ceb27d28b65d782e` |
| `assets/index-O88Di0Ji.css` | `1df8d1d5051b9a3a2a228a317f651f3a7f916c730b460176af6c3e44e65d32f9` |
| `sw.js` | `b387b9a2d73d5b3cc1d10120aced4ee9b1233163415b5cb7c03f5180959897a5` |

Live HTTPS returned `strict-transport-security`, restrictive `content-security-policy`,
`referrer-policy: strict-origin-when-cross-origin`, `x-content-type-options:
nosniff`, and a deny-all geolocation/camera/microphone permissions policy.
The main HTML and `sw.js` are short-lived (`max-age=30`); fingerprinted JS,
CSS, and WebP use `public, max-age=31536000, immutable`. HTTP redirects to
HTTPS. Privacy and terms routes return 200 with the same security policy.

At 390px, the live site registered `/sw.js`, gained service-worker control on
reload, and subsequently reloaded offline with its title and sole `h1` intact.
The worker uses a versioned `route-fidelity-check-v3` cache, `skipWaiting`,
`clients.claim`, and deletes prior cache names on activation; this is an
appropriate update path for this static PWA.

## Mobile Lighthouse

Fresh Lighthouse mobile run against the live HTTPS site (full-page screenshot
collection disabled only to avoid an unrelated headless-browser crash in this
container) reported:

| Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Interactive |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100 | 100 | 100 | 100 | 1.1 s | 1.2 s | 0 ms | 0 | 1.2 s |

## How to repeat

```sh
npm ci
npm test
npm run build
npx playwright install chromium   # only when the runner has no browser binary
npm run test:browser
npm run preview -- --host 127.0.0.1 --port 4173
```

Then exercise a clear pair and a material reroute at desktop and 390px, and
compare the deployed asset hashes if deployment fidelity needs reconfirmation.
