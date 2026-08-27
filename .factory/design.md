# Route Fidelity Check — visual thesis

## Direction: luminous glass data landscape

The product is a pre-ride instrument, not a route planner. Its visual world is a
night-time topographic workbench: deep ink terrain, translucent instrument
glass, and two electrically bright route traces that separate only where the
handoff changed. Decoration has an explanatory job—the paired lines introduce
the comparison model before a rider uploads anything.

## Palette

- `night-950` `#061413`: page background; near-black with a trail-map green cast.
- `night-900` `#0A201E`: elevated background.
- `glass` `rgba(15, 49, 45, .72)`: panels that reveal the landscape beneath.
- `mist-50` `#F3FBF7`: primary text.
- `mist-200` `#C7DDD4`: secondary text (7.8:1 on night-950).
- `mist-400` `#8DAEA2`: quiet labels (6.3:1 on night-950).
- `upload-helper` `#E1F3EA`: the small helper captions inside the two layered
  upload controls; deliberately brighter than quiet labels so their rendered
  surface remains WCAG AA legible in rest, hover, focus, and drag states.
- `route-mint` `#73F5BE`: intended route and primary action; dark text on filled buttons.
- `route-blue` `#67BFFF`: exported route.
- `detour-coral` `#FF8A72`: divergence and warnings, always paired with a label or pattern.
- `safe-lime` `#B7F36B`: within-threshold/success state.
- `danger` `#FF8A72`: invalid files and failed analysis.

The product is intentionally single-mode. A dark, explicitly painted canvas
makes fine route traces legible and supports the “night preflight” instrument
metaphor. Browser form controls use `color-scheme: dark`.

## Type

- Display: `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, system sans-serif.
  Narrow uppercase titles feel like trail signage and leave room for results.
- UI/body: `Inter`, `Aptos`, `Segoe UI`, system sans-serif. No network fonts.
  The build uses system stacks to avoid font bytes and third-party requests.
- Route metrics and coordinate-like labels use the body face with tabular
  numerals and slight letter spacing.

Scale: 14, 16, 18, 24, 40–64px. Body copy is at least 16px. Reading measure is
limited to 68 characters.

## Spacing and shape

An 8px base rhythm: 4, 8, 12, 16, 24, 32, 48, 64. The main comparison bay uses
large 24px radii like a piece of optical equipment; controls use 12–16px radii.
Panels are added only where they express a distinct upload, control, result, or
map surface. Borders are pale green at low opacity with a crisp inner highlight.
Touch targets are at least 44px.

## Interaction grammar

1. Two adjacent/stacked file bays establish “intended” and “exported.”
2. Each accepted file becomes a compact route manifest with point count and
   length, giving immediate feedback.
3. A single coral threshold control defines material difference; the primary
   “Compare routes” action becomes available only when both inputs are valid.
4. Results unfold as verdict → three key metrics → aligned route plot → review
   checklist. Coral dashed halos identify differences without relying on color.
5. Map-like pan/zoom is deliberately omitted in v1. The fitted SVG plot offers
   a stable whole-route audit and a focus button per divergence.

## Motion

Controls respond in 160ms; file manifests and results enter with a 240ms
opacity/translate transition from their source. The route plot draws once over
500ms after analysis. Nothing loops. Under `prefers-reduced-motion: reduce`,
movement and route drawing are removed; state changes are immediate.

## Original asset plan and provenance

### Hero landscape

- Subject: an abstract, oblique topographic glass slab with two luminous route
  filaments—mint and blue—running together, then separating around a coral
  detour and rejoining.
- World/materials: dark translucent contour layers, etched elevation rings,
  frosted glass edges, subtle wet mineral texture.
- Light/lens: controlled studio darkness, cyan-green edge light, orthographic
  three-quarter view, generous negative space, low visual noise.
- Palette words: deep pine ink, glacier mint, navigation blue, signal coral.
- Negative list: no people, bicycles, screens, text, labels, numbers, logos,
  watermark, pins, arrows, real-world brands, photorealistic map data.
- Prompt: “A wide editorial 3D illustration for a precision cycling route audit
  tool: an abstract oblique topographic landscape built from layered translucent
  smoked glass, etched contour rings and subtle wet mineral texture. Two thin
  luminous route filaments, glacier mint and navigation blue, travel together
  from left to right, separate around one distinct signal-coral detour, and
  rejoin. Controlled studio darkness, cyan-green rim light, orthographic
  three-quarter camera, deep pine-black background, crisp premium data-object
  aesthetic, generous quiet negative space, no people, no bicycles, no UI, no
  map labels, no text, no numbers, no logos, no watermark, no pins, no arrows.”
- Generation: Azure AI Foundry `factory-image` via the factory
  `/opt/fleet/lib/gen-image.sh`, generated 2026-08-27. Original generated asset;
  no third-party source material. Candidate source and prompt sidecar live in
  `assets/src/`; optimized WebP ships in `public/assets/`.

All interface icons and the route diagram are original inline SVG authored for
this product. Generated imagery is disclosed in the footer.
