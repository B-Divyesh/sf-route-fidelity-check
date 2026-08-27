# Route Fidelity Check

A private, browser-only GPX preflight for cyclists and club ride leaders. It
compares an intended route with an app or device export, flags geometric
separations over a chosen threshold, and produces a printable review checklist.

Live: <https://route-fidelity-check.sociobot.in>

## What it does

- Accepts GPX tracks (`trkpt`) and routes (`rtept`) by picker or drag-and-drop.
- Samples both route lines by distance and checks each against the other, so
  different recording densities and reversed direction do not create false
  differences.
- Groups material separations into review zones and reports fidelity, maximum
  separation, and route-length change.
- Renders both routes in one tile-free SVG coordinate space, highlights flagged
  portions, and focuses individual review zones.
- Prints a ride-leader checklist and copies a plain-text comparison summary.
- Works after first load without a network connection.

GPX files and comparison results stay in browser memory. There are no accounts,
analytics, map-tile requests, or third-party runtime scripts. This is a geometric
comparison—not a statement about safety, access, legality, surface, or closures.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the URL Vite prints, then choose two `.gpx` files or use “Try an example.”

## Test and build

```sh
npm test
npm run build
npm run preview
```

The exact deployment command is `npm run build`. It writes the static site to
`dist/`, with `dist/index.html` at the root. Deploy that directory to Azure
Static Web Apps. `public/staticwebapp.config.json` supplies security and cache
headers; no infrastructure changes are required from this repository.

## Method and limits

Both lines are projected into a shared local metre-based coordinate space and
resampled at 4–20 metre intervals based on the selected threshold. A spatial
grid finds the closest points in both directions. Flagged samples are clustered
along the intended route into human-reviewable zones.

Very long routes crossing the antimeridian and GPX files whose separate track
segments intentionally contain large gaps are outside the v1 geometry model.
The researched acceptance target still needs validation against the planned
30-pair real-world corpus.

## Product documentation

- [Research brief](.factory/brief.json)
- [Visual system and asset provenance](.factory/design.md)
- [Build handoff](.factory/handoff.md)
- [MIT license](LICENSE)
