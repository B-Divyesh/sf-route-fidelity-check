import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

const corpusDir = fileURLToPath(new URL('../test-data/corpus/', import.meta.url));
const appOrigin = 'http://127.0.0.1:4173';
const track = (points: Array<[number, number]>, name = 'Test track') => `<?xml version="1.0"?><gpx version="1.1"><trk><name>${name}</name><trkseg>${points.map(([lat, lon]) => `<trkpt lat="${lat}" lon="${lon}"/>`).join('')}</trkseg></trk></gpx>`;
const route = (points: Array<[number, number]>, name = 'Test route') => `<?xml version="1.0"?><gpx version="1.1"><rte><name>${name}</name>${points.map(([lat, lon]) => `<rtept lat="${lat}" lon="${lon}"/>`).join('')}</rte></gpx>`;
const base: Array<[number, number]> = [[51.5, -0.12], [51.5, -0.11], [51.5, -0.10], [51.5, -0.09]];
const detour: Array<[number, number]> = [[51.5, -0.12], [51.5, -0.11], [51.506, -0.105], [51.5, -0.10], [51.5, -0.09]];

function file(name: string, text: string) {
  return { name, mimeType: 'application/gpx+xml', buffer: Buffer.from(text) };
}

async function openDemo(page: Page) {
  await page.goto('/demo');
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#analysis-status')).toContainText('comparison', { ignoreCase: true });
}

async function setPair(page: Page, planned: string, exported: string) {
  await page.locator('#intended-file').setInputFiles(file('planned.gpx', planned));
  await expect(page.locator('#intended-manifest')).toBeVisible();
  await page.locator('#exported-file').setInputFiles(file('exported.gpx', exported));
  await expect(page.locator('#exported-manifest')).toBeVisible();
  await expect(page.locator('#compare-button')).toBeEnabled();
}

async function compare(page: Page) {
  await page.locator('#compare-button').click();
  await expect(page.locator('#analysis-status')).toContainText('Comparison complete');
  await expect(page.locator('#results')).toBeVisible();
}

test('@claim:demo-sandbox opens a complete isolated sample in one click and resets it', async ({ page, context }) => {
  await context.addInitScript(() => localStorage.setItem('real:route-fidelity-check', 'keep'));
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Compare planned and exported GPX routes');
  await expect(page.getByText(/For cyclists and club ride leaders/)).toBeVisible();
  const actionBox = await page.locator('#load-example').boundingBox();
  expect(actionBox).not.toBeNull();
  expect((actionBox?.y ?? 9999) + (actionBox?.height ?? 0)).toBeLessThanOrEqual(900);

  await page.locator('#load-example').click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('#demo-banner')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#metric-zones')).toHaveText('1');
  await expect(page.locator('#intended-manifest')).toContainText('Saturday river loop — planned');
  await page.locator('.checklist input').first().check();
  await page.locator('#reset-demo').click();
  await expect(page.locator('#analysis-status')).toContainText('Demo reset');
  await expect(page.locator('.checklist input').first()).not.toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem('real:route-fidelity-check'))).toBe('keep');

  await page.locator('#start-real').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#demo-banner')).toBeHidden();
  await expect(page.locator('#results')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('real:route-fidelity-check'))).toBe('keep');
});

test('@claim:compare-separation flags a changed exported route', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('#results-heading')).toHaveText('1 route change needs a look');
  await expect(page.locator('#metric-zones')).toHaveText('1');
  const separation = Number((await page.locator('#metric-separation').innerText()).replace(/[^0-9.]/g, ''));
  expect(separation).toBeGreaterThan(50);
});

test('@claim:gpx-inputs loads GPX tracks and routes through chooser and drop paths', async ({ page }) => {
  await openDemo(page);
  await page.locator('#intended-file').setInputFiles(file('planned-track.gpx', track(base, 'Picker track')));
  await expect(page.locator('#intended-manifest')).toContainText('Picker track');
  const dataTransfer = await page.evaluateHandle((text) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([text], 'exported-route.gpx', { type: 'application/gpx+xml' }));
    return transfer;
  }, route(base, 'Dropped route'));
  await page.locator('#exported-chooser').dispatchEvent('drop', { dataTransfer });
  await dataTransfer.dispose();
  await expect(page.locator('#exported-manifest')).toContainText('Dropped route');
  await compare(page);
  await expect(page.locator('#metric-zones')).toHaveText('0');
});

test('@claim:density-normalization ignores point density and route direction', async ({ page }) => {
  await openDemo(page);
  const dense: Array<[number, number]> = Array.from({ length: 13 }, (_, index) => [51.5, -0.12 + index * 0.0025]);
  await setPair(page, track(dense), track([...base].reverse()));
  await compare(page);
  await expect(page.locator('#metric-zones')).toHaveText('0');
  await expect(page.locator('#metric-fidelity')).toHaveText('100.0%');
});

test('@claim:bidirectional-changes catches detours, shortcuts, and added loops', async ({ page }) => {
  await openDemo(page);
  const cases = [
    [track(base), track(detour)],
    [track(detour), track(base)],
    [track(base), track([[51.5, -0.12], [51.5, -0.11], [51.507, -0.105], [51.507, -0.10], [51.5, -0.10], [51.5, -0.09]])],
  ];
  for (const [planned, exported] of cases) {
    await setPair(page, planned, exported);
    await compare(page);
    expect(Number(await page.locator('#metric-zones').innerText())).toBeGreaterThan(0);
  }
});

test('@claim:review-metrics reports fidelity, separation, distance change, and review zones', async ({ page }) => {
  await openDemo(page);
  const metrics = await page.locator('.metrics > div').allTextContents();
  expect(metrics).toHaveLength(4);
  expect(metrics.join(' ')).toMatch(/Fidelity.*%/s);
  expect(metrics.join(' ')).toMatch(/Largest separation.*m/s);
  expect(metrics.join(' ')).toMatch(/Distance change.*m/s);
  expect(metrics.join(' ')).toMatch(/Review zones.*1/s);
});

test('@claim:tile-free-trace renders aligned routes and focuses a review zone without outside services', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await expect(page.locator('#route-map svg')).toBeVisible();
  await expect(page.locator('#route-map .route-line.intended')).toHaveCount(1);
  await expect(page.locator('#route-map .route-line.exported')).toHaveCount(1);
  const before = await page.locator('#route-map svg').getAttribute('viewBox');
  await page.getByRole('button', { name: /Focus route view/ }).click();
  const after = await page.locator('#route-map svg').getAttribute('viewBox');
  expect(after).not.toBe(before);
  await page.locator('#reset-view').click();
  await expect(page.locator('#route-map svg')).toHaveAttribute('viewBox', before ?? '');
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:print-checklist opens printing with the populated rider checklist', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => document.documentElement.setAttribute('data-print-called', 'yes');
  });
  await openDemo(page);
  await expect(page.locator('.checklist label')).toHaveCount(4);
  await page.locator('#print-button').click();
  await expect(page.locator('html')).toHaveAttribute('data-print-called', 'yes');
});

test('@claim:copy-summary copies the completed comparison summary', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openDemo(page);
  await page.locator('#copy-summary').click();
  await expect(page.locator('#copy-summary')).toHaveText('Copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('1 review zone over 50 m found');
  expect(copied).toContain('Geometry only');
});

test('@claim:offline-reload reloads the complete demo offline after one visit', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(`${appOrigin}/demo`);
    await expect(page.locator('#results')).toBeVisible();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await expect(page.locator('#results')).toBeVisible();
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Demo — Route Fidelity Check');
    await expect(page.locator('#demo-banner')).toBeVisible();
    await expect(page.locator('#metric-zones')).toHaveText('1');
  } finally {
    await context.close();
  }
});

test('@claim:local-processing compares uploaded GPX data without sending it', async ({ page }) => {
  await openDemo(page);
  const requests: Array<{ method: string; url: string }> = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url() }));
  await setPair(page, track(base, 'Private planned route'), track(detour, 'Private exported route'));
  await compare(page);
  expect(requests.filter((request) => request.method !== 'GET')).toEqual([]);
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test('@claim:ephemeral-state clears uploaded routes and results on refresh', async ({ page }) => {
  await openDemo(page);
  await page.locator('#start-real').click();
  await setPair(page, track(base, 'Temporary planned route'), track(detour, 'Temporary exported route'));
  await compare(page);
  await expect(page.locator('#results')).toBeVisible();
  await page.reload();
  await expect(page.locator('#results')).toBeHidden();
  await expect(page.locator('#intended-manifest')).toBeHidden();
  await expect(page.getByText('Temporary planned route')).toHaveCount(0);
});

test('@claim:tracking-free uses only first-party requests and sets no cookies', async ({ browser }) => {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(`${appOrigin}/demo`, { waitUntil: 'networkidle' });
    await expect(page.locator('#results')).toBeVisible();
    expect(requests.length).toBeGreaterThan(0);
    expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
    expect(await context.cookies()).toEqual([]);
  } finally {
    await context.close();
  }
});

test('@claim:free-use completes the sample without an account or payment step', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => { window.print = () => undefined; });
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  await openDemo(page);
  await page.locator('#copy-summary').click();
  await page.locator('#print-button').click();
  await expect(page.getByText('Free to use.')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  expect(outsideRequests).toEqual([]);
});

test('@claim:file-size-boundary accepts 15 MB and rejects 15 MB plus one byte', async ({ page }) => {
  test.setTimeout(45_000);
  await openDemo(page);
  const maximum = 15 * 1024 * 1024;
  const valid = Buffer.alloc(maximum, 32);
  valid.write(track(base, 'Exact size route'));
  await page.locator('#intended-file').setInputFiles({ name: 'exactly-15mb.gpx', mimeType: 'application/gpx+xml', buffer: valid });
  await expect(page.locator('#intended-manifest')).toContainText('Exact size route', { timeout: 20_000 });
  const over = Buffer.alloc(maximum + 1, 32);
  over.write(track(base, 'Oversize route'));
  await page.locator('#intended-file').setInputFiles({ name: 'over-15mb.gpx', mimeType: 'application/gpx+xml', buffer: over });
  await expect(page.locator('#intended-error')).toContainText('over 15 MB');
  await expect(page.locator('#intended-manifest')).toBeHidden();
});

test('@claim:threshold-range compares at 10 and 500 metres and rejects values outside that range', async ({ page }) => {
  await openDemo(page);
  for (const invalid of ['9', '501']) {
    await page.locator('#threshold').fill(invalid);
    await page.locator('#compare-button').click();
    expect(await page.locator('#threshold').evaluate((input: HTMLInputElement) => input.validationMessage)).toContain('10 to 500 metres');
  }
  for (const boundary of ['10', '500']) {
    await page.locator('#threshold').fill(boundary);
    await compare(page);
    await expect(page.locator('#results')).toBeVisible();
  }
});

test('@claim:corpus-recall flags at least 90 percent of known changes and renders each result within 15 seconds', async ({ page }) => {
  test.setTimeout(45_000);
  const manifest = JSON.parse(await readFile(`${corpusDir}manifest.json`, 'utf8')) as {
    pairs: Array<{ material_change: boolean; threshold_m: number; planned: string; exported: string }>;
  };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openDemo(page);
  let positives = 0;
  let detected = 0;
  let falsePositives = 0;
  const resultTimes: number[] = [];
  for (const pair of manifest.pairs) {
    await page.locator('#intended-file').setInputFiles(`${corpusDir}${pair.planned}`);
    await page.locator('#exported-file').setInputFiles(`${corpusDir}${pair.exported}`);
    await page.locator('#threshold').fill(String(pair.threshold_m));
    const resultStarted = Date.now();
    await page.locator('#compare-button').evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.locator('#analysis-status')).toContainText('Comparison complete');
    resultTimes.push(Date.now() - resultStarted);
    const changed = Number(await page.locator('#metric-zones').innerText()) > 0;
    if (pair.material_change) {
      positives += 1;
      if (changed) detected += 1;
    } else if (changed) falsePositives += 1;
  }
  const longestResult = Math.max(...resultTimes);
  console.log(`Corpus outcome: ${detected}/${positives} known changes detected, ${falsePositives} false positives, ${longestResult} ms slowest result.`);
  expect(manifest.pairs).toHaveLength(30);
  expect(detected / positives).toBeGreaterThanOrEqual(0.9);
  expect(falsePositives).toBe(0);
  expect(longestResult).toBeLessThan(15_000);
});

test('@claim:installable-pwa provides a standalone manifest and working install icons', async ({ page, request }) => {
  await openDemo(page);
  const manifestPath = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestPath).toBe('/manifest.webmanifest');
  const response = await request.get(manifestPath ?? '');
  expect(response.ok()).toBe(true);
  const manifest = await response.json() as { display: string; start_url: string; icons: Array<{ src: string; sizes: string; purpose: string }> };
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toContain('version=1.1.0');
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable')).toBe(true);
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
});
