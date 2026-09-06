# Compare planned and exported GPX routes — review handoff

## Status: FAIL

Review 1 audited the live static product without changing product code.
Implementation `3c240d13424d95c26cd5acf9f41796f10af9de4e` is deployed byte-for-byte.
Documentation base `3aae0e3b9f83a74c380c2da29d52f22ff43357cc` was reviewed.

The review found 9 defects and 15 untested public claims. The full report is
`.factory/review-1.md`.

## What passed

- `npm ci`, `npm test` (8/8), and `npm run build` passed.
- After `npx playwright install chromium`, `npm run test:browser` passed.
- Sample, identical, invalid, boundary, recovery, print, copy, trace focus,
  keyboard, phone, reduced-motion, and offline paths worked.
- Axe found no serious or critical violations.
- Product requests stayed first-party and browser user-data stores stayed empty.
- Live Lighthouse scores were 100 in all four categories; LCP was 1.2 s.
- Earlier chooser focus, malformed XML, and upload contrast defects are fixed.

## What remains

1. Add the required one-click demo route, persistent demo label, reset, start-real
   action, and `.factory/demo.md`.
2. Add `.factory/claims.json` and one tagged observable test for each retained
   public claim.
3. Prove the brief's 90% result with the 30-pair corpus.
4. Repair the first-screen words and action placement.
5. Add a real 404 page and consistent route header/footer structure.
6. Complete the PWA manifest, icons, and update notice.
7. Add canonical, social, and route metadata.
8. Enlarge small link targets and add skip links to legal pages.
9. Give privacy requests a direct contact method.

## Repeat the checks

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Live browser and Lighthouse evidence is under
`/work/.evidence/route-fidelity-check-review-1/`.
