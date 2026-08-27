# Route Fidelity Check — verification handoff

## Status: PASS

Independent QA passed candidate `d088e5559690c8bd6de4878cf04f9ac72ddc3832`
on 2026-08-27 against both a fresh production build and
<https://route-fidelity-check.sociobot.in>. The live HTML, JS, CSS, and service
worker were byte-identical to that candidate.

## Verified

- `npm ci` completed with zero audit vulnerabilities; `npm test` passed 8/8;
  `npm run build` passed and produced `dist/`; the checked-in production browser
  suite passed after installing Playwright Chromium in the fresh runner.
- Full local and live browser journeys at 1440px and 390px passed: clear and
  material-detour GPX comparisons, 10/500 m boundaries, invalid threshold
  feedback, empty/malformed/invalid/oversize GPX recovery, keyboard-visible
  upload controls, reduced motion, print/copy/focus review controls, and zero
  real-flow console/page errors.
- Axe reported no serious/critical finding at initial or populated states.
  File processing remained local-only; requests were same-origin only.
- HTTPS headers provide CSP, HSTS, referrer, MIME, permissions, and framing
  protections; hashed static assets cache immutably. The PWA controlled an
  offline reload and its versioned worker prunes stale caches.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.1 s, LCP 1.2 s, TBT 0 ms, CLS 0.

## How to run

```sh
npm ci
npm test
npm run build
npx playwright install chromium  # if absent in the runner
npm run test:browser
npm run preview -- --host 127.0.0.1 --port 4173
```

## Known gap / next step

No release-blocking defects were found. The brief's 30-pair real-world corpus
is absent, so its 90% material-detour recall success measure remains
unmeasured; add a versioned anonymised corpus and automated recall check before
making that performance claim. Intentional segment gaps and antimeridian
routes also remain future algorithm work.

Full evidence: `.factory/verification-3.md`.
