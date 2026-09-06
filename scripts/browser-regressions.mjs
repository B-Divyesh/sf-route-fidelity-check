import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { preview } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const validGpx = '<gpx><trk><trkseg><trkpt lat="51.5" lon="-0.12"/><trkpt lat="51.5" lon="-0.10"/></trkseg></trk></gpx>';
const incompleteGpx = '<gpx><trkpt lat="51.5" lon="-0.12"/><trkpt lat="51.5" lon="-0.10"/>';

function fixture(name, text) {
  return { name, mimeType: 'application/gpx+xml', buffer: Buffer.from(text) };
}

async function assertVisibleFocus(page, chooserId) {
  const chooser = page.locator(`#${chooserId}`);
  await expectActive(page, chooserId);
  const focusStyle = await chooser.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineWidth: style.outlineWidth, isFocusVisible: element.matches(':focus-visible') };
  });
  assert.equal(focusStyle.outlineWidth, '3px', `${chooserId} must show a visible focus outline`);
  assert.equal(focusStyle.isFocusVisible, true, `${chooserId} must receive keyboard-visible focus`);
}

async function expectActive(page, id) {
  assert.equal(await page.evaluate(() => document.activeElement?.id), id);
}

async function chooseWithKeyboard(page, chooserId, file) {
  const inputId = chooserId.replace('chooser', 'file');
  await page.evaluate((id) => {
    const input = document.getElementById(id);
    input?.addEventListener('click', () => { input.dataset.keyboardActivated = 'true'; }, { once: true });
  }, inputId);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(`#${inputId}`).getAttribute('data-keyboard-activated'), 'true', `${chooserId} must activate its native file input from Enter`);
  await page.locator(`#${inputId}`).setInputFiles(file);
  await expectActive(page, chooserId);
}

async function keyboardChooserRegression(browser, label, viewport, isMobile) {
  const page = await browser.newPage({ viewport, isMobile, hasTouch: isMobile });
  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#intended-file').getAttribute('tabindex'), '-1');
    assert.equal(await page.locator('#exported-file').getAttribute('tabindex'), '-1');

    await page.locator('.real-start-link').focus();
    await page.keyboard.press('Tab');
    await assertVisibleFocus(page, 'intended-chooser');
    await chooseWithKeyboard(page, 'intended-chooser', fixture('intended.gpx', validGpx));
    await page.locator('#intended-manifest').waitFor({ state: 'visible' });
    await page.keyboard.press('Tab');
    await assertVisibleFocus(page, 'exported-chooser');
    await chooseWithKeyboard(page, 'exported-chooser', fixture('exported.gpx', validGpx));
    await page.locator('#exported-manifest').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#compare-button').isEnabled(), true, `${label}: keyboard-selected routes should enable comparison`);
  } finally {
    await page.close();
  }
}

async function malformedGpxRegression(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.locator('#intended-file').setInputFiles(fixture('intended.gpx', validGpx));
    await page.locator('#intended-manifest').waitFor({ state: 'visible' });
    await page.locator('#exported-file').setInputFiles(fixture('device-export.gpx', incompleteGpx));
    await page.locator('#exported-error').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#exported-manifest').isVisible(), false);
    await assert.match(await page.locator('#exported-error').innerText(), /incomplete or malformed\. Re-export the complete GPX file/i);
    assert.equal(await page.locator('#compare-button').isEnabled(), false);
  } finally {
    await page.close();
  }
}

async function uploadCaptionAccessibilityRegression(browser, label, viewport, isMobile) {
  const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile });
  const page = await context.newPage();
  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const captions = page.locator('#intended-chooser em, #exported-chooser em');
    assert.equal(await captions.count(), 2, `${label}: both upload helper captions must render`);

    for (const state of ['rest', 'hover', 'focus', 'dragging']) {
      if (state === 'hover') await page.locator('#intended-chooser').hover();
      if (state === 'focus') await page.locator('#intended-chooser').focus();
      if (state === 'dragging') await page.locator('#intended-chooser').evaluate((node) => node.classList.add('is-dragging'));
      const results = await new AxeBuilder({ page }).analyze();
      const seriousOrCritical = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
      assert.deepEqual(seriousOrCritical, [], `${label} ${state}: axe serious/critical violations: ${seriousOrCritical.map((violation) => violation.id).join(', ')}`);
      assert.equal(results.violations.some((violation) => violation.id === 'color-contrast'), false, `${label} ${state}: upload helper captions must meet axe color contrast`);
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
    }
  } finally {
    await context.close();
  }
}

async function fullProductRegression(browser, label, viewport, isMobile) {
  const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').innerText(), 'Compare planned and exported GPX routes');
    assert.equal(await page.getByText(/For cyclists and club ride leaders/).isVisible(), true);
    const action = await page.locator('#load-example').boundingBox();
    assert(action && action.y + action.height <= viewport.height, `${label}: sample action must be visible before scrolling`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${label}: page must not overflow horizontally`);

    await page.locator('#load-example').click();
    await page.locator('#results').waitFor({ state: 'visible' });
    assert.match(page.url(), /\/demo$/);
    assert.equal(await page.locator('#metric-zones').innerText(), '1');
    assert.match(await page.locator('#demo-banner').innerText(), /Demo — sample data, nothing is saved/);
    const demoAxe = await new AxeBuilder({ page }).analyze();
    assert.deepEqual(demoAxe.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), [], `${label}: populated demo must have no serious or critical axe findings`);

    await page.evaluate(() => window.dispatchEvent(new Event('route-update-available')));
    assert.equal(await page.locator('#update-notice').isVisible(), true, `${label}: an available update must be announced`);
    assert.equal(await page.locator('#results').isVisible(), true, `${label}: update notice must not interrupt the comparison`);
    const motion = await page.locator('.results').evaluate((node) => getComputedStyle(node).animationDuration);
    assert.match(motion, /0\.00001s|1e-05s|0s/);
    assert.deepEqual(errors, [], `${label}: product flow must have no console or page errors`);
  } finally {
    await context.close();
  }
}

async function pageStructureRegression(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    for (const path of ['/privacy/', '/terms/', '/404.html']) {
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').count(), 1, `${path}: exactly one h1`);
      assert.equal(await page.locator('.skip-link').count(), 1, `${path}: skip link`);
      assert.equal(await page.locator('.site-header nav').count(), 1, `${path}: shared header navigation`);
      assert.equal(await page.locator('.site-footer').count(), 1, `${path}: shared footer`);
      const links = page.locator('.site-header a, .site-footer a');
      for (let index = 0; index < await links.count(); index += 1) {
        const box = await links.nth(index).boundingBox();
        assert(box && box.height >= 44 && box.width >= 44, `${path}: header/footer link ${index + 1} must be at least 44px`);
      }
      const axe = await new AxeBuilder({ page }).analyze();
      assert.deepEqual(axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), [], `${path}: no serious or critical axe findings`);
    }
    await page.goto(`${baseUrl}/privacy/`);
    assert.equal(await page.locator('a[href^="mailto:"]').isVisible(), true, 'privacy page must provide a direct request method');
  } finally {
    await context.close();
  }
}

const server = await preview({ root, logLevel: 'error', preview: { host: '127.0.0.1', port: 0 } });
const address = server.httpServer?.address();
if (!address || typeof address === 'string') throw new Error('Could not determine preview server address.');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });

try {
  await uploadCaptionAccessibilityRegression(browser, 'desktop', { width: 1440, height: 900 }, false);
  await uploadCaptionAccessibilityRegression(browser, 'mobile', { width: 390, height: 844 }, true);
  await keyboardChooserRegression(browser, 'desktop', { width: 1440, height: 900 }, false);
  await keyboardChooserRegression(browser, 'mobile', { width: 390, height: 844 }, true);
  await malformedGpxRegression(browser);
  await fullProductRegression(browser, 'desktop', { width: 1440, height: 900 }, false);
  await fullProductRegression(browser, 'mobile', { width: 390, height: 844 }, true);
  await pageStructureRegression(browser);
  console.log('Browser regressions passed: demo, first screen, routes, touch targets, axe, update notice, keyboard choosers, and malformed GPX recovery.');
} finally {
  await browser.close();
  await server.close();
}
