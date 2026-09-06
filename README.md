# Compare planned and exported GPX routes

Route Fidelity Check is for cyclists and club ride leaders checking a route
handoff before a group follows it.

Try the complete sample at
<https://route-fidelity-check.sociobot.in/demo>. It needs no account or setup.

## What it does

- Loads GPX tracks and routes through a file chooser or drag and drop.
- Accepts files up to and including 15 MB.
- Compares planned and exported lines at a 10 to 500 metre threshold.
- Samples distance in both directions to handle point density and route direction.
- Flags detours, shortcuts, and added loops as review zones.
- Reports fidelity, largest separation, distance change, and review-zone count.
- Shows a tile-free route trace with controls to focus each review zone.
- Copies a text summary and prints a four-step rider checklist.
- Works offline after the first visit and includes a standalone app manifest.

The route comparison is free to use. It plans no routes and gives no navigation
advice. A close match does not confirm safety, access, surface, traffic,
closures, or legal use.

## Privacy

GPX files and results stay in browser memory. Refreshing or closing the real
comparison clears them. The app sends no GPX content and sets no cookies.

There are no accounts, analytics, ads, tracking pixels, third-party scripts, or
map tiles. The offline app shell is the only product cache.

See the [privacy page](https://route-fidelity-check.sociobot.in/privacy/) for
hosting details and a direct privacy contact.

## Demo sandbox

“Try it with sample data” opens a completed river-route comparison in one
click. The persistent demo banner can reset the sample or start an empty real
comparison. Demo state uses a separate in-memory session and never changes real
route data.

See [.factory/demo.md](.factory/demo.md) for the sample and reset contract.

## Acceptance corpus

The versioned corpus contains 30 planned/exported pairs. Twenty-seven contain a
known detour, shortcut, or added loop. Three are clear controls.

The declared check requires at least 90% recall, no false flags on the clear
controls, and each reviewable result within 15 seconds. The corpus is
purpose-built and anonymous, so it does not replace later field testing across
specific device exports.

See [test-data/corpus/README.md](test-data/corpus/README.md) for provenance.

## Run locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the local URL, then choose two `.gpx` files or open `/demo`.

## Test and build

```sh
npm ci
npm test
npm run test:browser
npm run test:claims
npm run build
```

Every public product claim has one tagged outcome test in
[.factory/claims.json](.factory/claims.json). Each listed command builds and
runs independently after `npm ci`.

The browser package is pinned to Playwright 1.58.2. If Chromium is missing,
run `npx playwright install chromium` once.

## Method and limits

Both lines use one local metre-based coordinate space. Sampling runs at 4 to 20
metre intervals based on the chosen threshold. A spatial grid finds the closest
samples in both directions. Nearby flagged samples become review zones.

Very long routes crossing the antimeridian are outside this geometry model.
Separate track segments with intentional gaps are joined into one line.

## Deploy

Run `npm run build` and deploy `dist/` to the existing Azure Static Web App.
The repository needs no server, database, paid service, runtime secret, or
billing registration.

`public/staticwebapp.config.json` defines the demo rewrite, designed 404,
security headers, and cache policy. Deployment infrastructure stays outside
this repository.

## Product documents

- [Research brief](.factory/brief.json)
- [Visual system and asset provenance](.factory/design.md)
- [Demo sandbox](.factory/demo.md)
- [Claim registry](.factory/claims.json)
- [Repair handoff](.factory/handoff.md)
- [MIT license](LICENSE)
