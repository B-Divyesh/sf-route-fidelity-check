import './style.css';
import { compareRoutes } from './compare';
import { intendedDemo, exportedDemo } from './demo';
import { parseGpxText, readGpxFile } from './gpx';
import type { ComparisonResult, RouteData, XYPoint } from './types';

type RouteKind = 'intended' | 'exported';

const routes: Partial<Record<RouteKind, RouteData>> = {};
let lastResult: ComparisonResult | undefined;

function byId<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing #${id}`);
  return node as T;
}

const compareButton = byId<HTMLButtonElement>('compare-button');
const results = byId<HTMLElement>('results');
const thresholdInput = byId<HTMLInputElement>('threshold');

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character] ?? character);
}

function formatDistance(metres: number, signed = false): string {
  const sign = signed && metres > 0 ? '+' : '';
  if (Math.abs(metres) >= 1000) return `${sign}${(metres / 1000).toFixed(Math.abs(metres) >= 10_000 ? 1 : 2)} km`;
  return `${sign}${Math.round(metres)} m`;
}

function updateManifest(kind: RouteKind): void {
  const route = routes[kind];
  const manifest = byId<HTMLElement>(`${kind}-manifest`);
  const panel = document.querySelector<HTMLElement>(`.upload-panel[data-kind="${kind}"]`);
  if (!route || !panel) return;
  manifest.innerHTML = `<span class="manifest-check" aria-hidden="true">✓</span><span><strong>${escapeHtml(route.name)}</strong><small>${route.points.length.toLocaleString()} points · ${formatDistance(route.lengthM)}</small></span>`;
  manifest.hidden = false;
  panel.classList.add('has-file');
  byId(`${kind}-error`).textContent = '';
  compareButton.disabled = !(routes.intended && routes.exported);
}

function showFileError(kind: RouteKind, error: unknown): void {
  delete routes[kind];
  byId(`${kind}-manifest`).hidden = true;
  const panel = document.querySelector<HTMLElement>(`.upload-panel[data-kind="${kind}"]`);
  panel?.classList.remove('has-file');
  byId(`${kind}-error`).textContent = error instanceof Error ? error.message : 'This GPX could not be read. Try exporting it again.';
  compareButton.disabled = true;
}

async function acceptFile(kind: RouteKind, file?: File): Promise<void> {
  if (!file) return;
  try {
    routes[kind] = await readGpxFile(file);
    updateManifest(kind);
    results.hidden = true;
  } catch (error) {
    showFileError(kind, error);
  }
}

for (const kind of ['intended', 'exported'] as RouteKind[]) {
  const input = byId<HTMLInputElement>(`${kind}-file`);
  const chooser = byId<HTMLButtonElement>(`${kind}-chooser`);
  input.addEventListener('change', () => {
    void acceptFile(kind, input.files?.[0]);
    chooser.focus();
  });
  input.addEventListener('cancel', () => chooser.focus());
  chooser.addEventListener('click', () => input.click());
  const panel = document.querySelector<HTMLElement>(`.upload-panel[data-kind="${kind}"]`);
  const zone = panel?.querySelector<HTMLElement>('.drop-zone');
  if (!zone) continue;
  for (const eventName of ['dragenter', 'dragover']) {
    zone.addEventListener(eventName, (event) => { event.preventDefault(); zone.classList.add('is-dragging'); });
  }
  for (const eventName of ['dragleave', 'drop']) {
    zone.addEventListener(eventName, (event) => { event.preventDefault(); zone.classList.remove('is-dragging'); });
  }
  zone.addEventListener('drop', (event) => void acceptFile(kind, event.dataTransfer?.files[0]));
}

byId('load-example').addEventListener('click', () => {
  routes.intended = parseGpxText(intendedDemo, 'intended-example.gpx');
  routes.exported = parseGpxText(exportedDemo, 'exported-example.gpx');
  updateManifest('intended');
  updateManifest('exported');
  byId('compare-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
  byId('analysis-status').textContent = 'Example routes loaded. Choose Compare routes to inspect the detour.';
});

function pathFor(points: XYPoint[]): string {
  return points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
}

function splitPaths(points: Array<XYPoint & { divergent: boolean }>): XYPoint[][] {
  const paths: XYPoint[][] = [];
  let active: XYPoint[] = [];
  points.forEach((point, index) => {
    if (point.divergent) {
      const previous = points[index - 1];
      if (!active.length && previous) active.push(previous);
      active.push(point);
    } else if (active.length) {
      active.push(point);
      paths.push(active);
      active = [];
    }
  });
  if (active.length) paths.push(active);
  return paths;
}

interface Bounds { x: number; y: number; width: number; height: number }

function getBounds(points: XYPoint[]): Bounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const width = Math.max(100, maxX - minX); const height = Math.max(100, maxY - minY);
  const pad = Math.max(width, height) * 0.07;
  return { x: minX - pad, y: minY - pad, width: width + pad * 2, height: height + pad * 2 };
}

function boundsValue(bounds: Bounds): string { return `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`; }

function renderMap(result: ComparisonResult): void {
  const map = byId('route-map');
  const allPoints = [...result.intendedSamples, ...result.exportedSamples];
  const bounds = getBounds(allPoints);
  const highlighted = [
    ...splitPaths(result.intendedSamples),
    ...splitPaths(result.exportedSamples),
  ].map((points) => `<path class="route-line divergence" d="${pathFor(points)}"/>`).join('');
  map.innerHTML = `<svg viewBox="${boundsValue(bounds)}" data-full-view="${boundsValue(bounds)}" preserveAspectRatio="xMidYMid meet" tabindex="0">
    <title id="map-title">Compared route lines</title>
    <desc id="map-description">The intended route is mint, the exported route is blue, and portions beyond the ${result.thresholdM} metre threshold have a dashed coral overlay. ${result.divergences.length} review zones were found.</desc>
    <defs><filter id="route-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g class="route-layer"><path class="route-line intended" d="${pathFor(result.intendedSamples)}"/><path class="route-line exported" d="${pathFor(result.exportedSamples)}"/>${highlighted}</g>
  </svg>`;
  byId<HTMLButtonElement>('reset-view').hidden = true;
}

function focusDivergence(index: number): void {
  if (!lastResult) return;
  const divergence = lastResult.divergences[index];
  const points = [
    ...lastResult.intendedSamples.filter((point) => point.progressM >= divergence.startM && point.progressM <= divergence.endM),
    ...lastResult.exportedSamples.filter((point) => point.nearestProgressM >= divergence.startM && point.nearestProgressM <= divergence.endM),
  ];
  if (points.length < 2) return;
  const svg = byId('route-map').querySelector('svg');
  svg?.setAttribute('viewBox', boundsValue(getBounds(points)));
  byId<HTMLButtonElement>('reset-view').hidden = false;
  byId('route-map').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

byId('reset-view').addEventListener('click', () => {
  const svg = byId('route-map').querySelector('svg');
  const full = svg?.dataset.fullView;
  if (svg && full) svg.setAttribute('viewBox', full);
  byId<HTMLButtonElement>('reset-view').hidden = true;
});

function summaryText(result: ComparisonResult, intended: RouteData, exported: RouteData): string {
  const delta = exported.lengthM - intended.lengthM;
  const headline = result.divergences.length
    ? `${result.divergences.length} review zone${result.divergences.length === 1 ? '' : 's'} over ${result.thresholdM} m found.`
    : `No separation over ${result.thresholdM} m found.`;
  return `Route Fidelity Check: ${headline} Fidelity ${result.fidelityPercent.toFixed(1)}%; largest separation ${formatDistance(result.maxSeparationM)}; distance change ${formatDistance(delta, true)}. Geometry only—verify access, legality, surface, and closures separately.`;
}

function renderResult(result: ComparisonResult, intended: RouteData, exported: RouteData): void {
  const hasDivergence = result.divergences.length > 0;
  results.classList.toggle('is-clear', !hasDivergence);
  byId('results-heading').textContent = hasDivergence
    ? `${result.divergences.length} route change${result.divergences.length === 1 ? ' needs' : 's need'} a look`
    : 'The route lines stay within your threshold';
  byId('verdict-copy').textContent = hasDivergence
    ? `${formatDistance(result.affectedLengthM)} of the intended route falls within flagged review zones. Check these before sharing the export.`
    : `No sampled separation exceeded ${result.thresholdM} m. Review the route visually and check access separately.`;
  byId('verdict-icon').textContent = hasDivergence ? '!' : '✓';
  byId('metric-fidelity').textContent = `${result.fidelityPercent.toFixed(1)}%`;
  byId('metric-separation').textContent = formatDistance(result.maxSeparationM);
  byId('metric-distance').textContent = formatDistance(exported.lengthM - intended.lengthM, true);
  byId('metric-zones').textContent = String(result.divergences.length);
  renderMap(result);

  const list = byId<HTMLOListElement>('divergence-list');
  if (hasDivergence) {
    list.innerHTML = result.divergences.map((item, index) => `<li>
      <span class="zone-index">${String(item.id).padStart(2, '0')}</span>
      <div><strong>${formatDistance(item.startM)}–${formatDistance(item.endM)} from the start</strong><small>Peak separation ${formatDistance(item.peakM)} · inspect both route engines here</small></div>
      <button type="button" data-zone="${index}" aria-label="Focus route view on review zone ${item.id}">Focus trace</button>
    </li>`).join('');
  } else {
    list.innerHTML = '<li class="empty-review"><span aria-hidden="true">✓</span><div><strong>No material review zones</strong><small>The lines remain within the chosen threshold in both comparison directions.</small></div></li>';
  }
  byId('review-summary').textContent = hasDivergence
    ? `Work through ${result.divergences.length} flagged zone${result.divergences.length === 1 ? '' : 's'} from the start of the intended route.`
    : 'No zones are flagged, but complete the route checks below.';
  results.hidden = false;
  requestAnimationFrame(() => results.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

byId('divergence-list').addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button[data-zone]');
  if (button) focusDivergence(Number(button.dataset.zone));
});

compareButton.addEventListener('click', () => {
  const intended = routes.intended;
  const exported = routes.exported;
  if (!intended || !exported) return;
  const threshold = Number(thresholdInput.value);
  if (!Number.isFinite(threshold) || threshold < 10 || threshold > 500) {
    thresholdInput.setCustomValidity('Choose a threshold from 10 to 500 metres.');
    thresholdInput.reportValidity();
    return;
  }
  thresholdInput.setCustomValidity('');
  compareButton.classList.add('is-working');
  byId('analysis-error').textContent = '';
  byId('analysis-status').textContent = 'Comparing routes…';
  window.setTimeout(() => {
    try {
      lastResult = compareRoutes(intended.points, exported.points, threshold);
      renderResult(lastResult, intended, exported);
      byId('analysis-status').textContent = `Comparison complete. ${lastResult.divergences.length} review zones found.`;
    } catch {
      byId('analysis-error').textContent = 'The comparison could not finish. Try simplified GPX exports with fewer track points.';
      byId('analysis-status').textContent = 'The comparison could not finish.';
    } finally {
      compareButton.classList.remove('is-working');
    }
  }, 30);
});

thresholdInput.addEventListener('input', () => {
  thresholdInput.setCustomValidity('');
  if (lastResult && !results.hidden) {
    results.hidden = true;
    byId('analysis-status').textContent = 'Threshold changed. Compare the routes again for an updated result.';
  }
});

byId('print-button').addEventListener('click', () => window.print());
byId('copy-summary').addEventListener('click', async () => {
  if (!lastResult || !routes.intended || !routes.exported) return;
  const button = byId<HTMLButtonElement>('copy-summary');
  try {
    await navigator.clipboard.writeText(summaryText(lastResult, routes.intended, routes.exported));
    button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = 'Copy summary'; }, 1800);
  } catch {
    button.textContent = 'Copy unavailable';
  }
});

function updateNetworkStatus(): void {
  const status = byId('network-status');
  status.textContent = navigator.onLine ? 'Local-only · ready' : 'Offline · comparison still works';
  status.classList.toggle('is-offline', !navigator.onLine);
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js').catch(() => undefined); });
}
