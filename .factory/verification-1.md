# Independent verification 1 — FAIL

**Candidate:** `0bd934539364869af0439c514459c44b175f0883` (`0bd9345`)

**Live URL:** <https://route-fidelity-check.sociobot.in>

**Date:** 2026-08-27 UTC

## Verdict

**FAIL.** The candidate builds and deploys, and the core representative GPX
comparison works, but it does not meet the required keyboard accessibility or
malformed-input handling baseline. Do not promote until the two release-blocking
defects below are fixed and independently retested.

## Release-blocking defects

### P1 — keyboard users receive no visible focus for GPX file choosers

`#intended-file` and `#exported-file` are the keyboard-tab stops, but each is
an absolutely positioned, `1px × 1px`, `opacity: 0` input. In Chromium, when
tabbed to the input, it matches `:focus-visible`, while its visibly rendered
`.drop-zone` retains its default border (`rgba(199, 221, 212, 0.32)`) and
transparent background. The only computed outline is on the invisible 1px
input. A 1440px desktop screenshot confirms no visible focus treatment around
“Choose intended GPX.” This fails the factory's visible-focus and keyboard-only
requirements. The same built CSS is deployed live (see identity evidence).

### P1 — malformed GPX XML is silently treated as a valid route

The parser accepts an unterminated document containing two valid-looking
`trkpt` start tags:

```xml
<gpx><trkpt lat="51.5" lon="-0.12"/><trkpt lat="51.5" lon="-0.10"/>
```

When paired with a valid intended file, the UI shows both accepted manifests,
no exported-file error, and enables “Compare routes.” The file is not
well-formed XML/GPX. The regex parser checks for a `<gpx` token and point tags
but does not validate XML structure. This can cause a corrupt device export to
be trusted and compared rather than rejected with a recovery action.

## Checks run from the clean candidate checkout

```sh
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

- `npm ci`: completed; `npm audit` reported 0 vulnerabilities.
- `npm test`: **7/7 passed** (2 files).
- `npm run build`: **passed** (`tsc --noEmit && vite build`) and produced
  `dist/`. There is no separate lint script; type checking is part of build.
- Build output: JS 14,927 B raw / 5,870 B gzip; CSS 16,734 B raw / 4,760 B
  gzip; hero WebP 77,322 B. Initial JS, CSS, font (none), and hero budgets pass.
- Static review found no third-party runtime scripts, fonts, tiles, analytics,
  cookies, local/session storage, or outbound runtime requests. The normal
  browser session requested only its own origin.

## End-to-end product exercise

Automated Chromium checks ran against both the local production preview and
the live URL at desktop size.

- **Normal/detour:** planned line versus an export with a 0.006° northward
  detour at 50 m produced **1 review zone**, **661 m** largest separation, SVG
  trace, review text, and a keyboard-operable “Focus trace” control.
- **Boundary/equivalent:** a two-point `rtept` export of the same straight line
  at the 500 m boundary produced **0 review zones** and **100.0%** fidelity.
- **Malformed/recovery:** invalid latitude `999` produced the actionable
  “A track point has invalid coordinates…” error, then replacing it with a
  valid GPX enabled comparison. The separate unterminated-XML case above
  exposes the remaining malformed-input defect.
- **Invalid threshold:** `501` is rejected by native validation with “Value
  must be less than or equal to 500.”
- **Result actions:** copy summary succeeds with clipboard permission; print
  invokes `window.print()`; per-zone focus reveals “Show full route.”

## Accessibility, responsive, and browser checks

- Desktop and 390×844 mobile were exercised. At 390px there was no horizontal
  overflow (`scrollWidth = clientWidth = 390`); results width was 358px.
- `prefers-reduced-motion: reduce` yielded `0.01ms` SVG animation/transition
  durations and no console/page errors.
- Axe (`@axe-core/playwright`) reported **0 violations** on the populated main
  route, `/privacy/`, and `/terms/` at 390px. This does not detect the manual
  visible-focus failure above.
- Keyboard tab/Enter reached the chooser inputs, threshold, compare button,
  Focus trace, links, and skip link; comparison and trace focus worked using
  keyboard. The chooser focus itself is not perceivable, hence FAIL.
- No console errors or uncaught page errors were observed in the local or live
  normal/recovery workflows.

## Privacy, security, caching, and PWA

- The route workflow performs local parsing/comparison. Browser checks found
  empty cookies/localStorage/sessionStorage and only same-origin requests.
- Live response headers include CSP (`default-src 'self'`; self-only script,
  style, image, and connect), HSTS, `nosniff`, strict-origin referrer policy,
  a restrictive Permissions-Policy, and `frame-ancestors 'none'`.
- Live HTML and its JS, CSS, service-worker, and hero WebP each hash-identically
  to the candidate `dist/`/`public` assets. The live deployment is therefore
  the tested candidate, not merely visually similar.
- Live hashed CSS/JS/WebP assets are `public, max-age=31536000, immutable`;
  HTML and `/sw.js` are `max-age=30, must-revalidate`.
- A service worker became active, `registration.update()` completed, the second
  load was controlled, and an offline reload after the first visit succeeded.
  A real version-transition update could not be exercised because there is no
  newer deployed worker version in scope.

## Scope/brief note

The checked functionality matches the intended small product: it compares two
local GPX route lines, uses a user-set threshold, highlights review zones, and
prints a ride-leader checklist while clearly stating that geometry is not a
safety/legal/access determination. The 30-pair real-world corpus is absent, so
the brief's 90% material-detour recall target remains unmeasured.

## Required next steps

1. Make the visible upload control itself show a high-contrast focus indicator
   when its file input is focused; verify at desktop and 390px by keyboard.
2. Parse GPX as well-formed XML before accepting points, rejecting malformed or
   structurally incomplete documents with the existing actionable recovery UI.
3. Add regression tests for both failures, then rerun this verification against
   a newly built and deployed revision.
