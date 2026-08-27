import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
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

    await page.locator('#load-example').focus();
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

const server = await preview({ root, logLevel: 'error', preview: { host: '127.0.0.1', port: 0 } });
const address = server.httpServer?.address();
if (!address || typeof address === 'string') throw new Error('Could not determine preview server address.');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });

try {
  await keyboardChooserRegression(browser, 'desktop', { width: 1440, height: 900 }, false);
  await keyboardChooserRegression(browser, 'mobile', { width: 390, height: 844 }, true);
  await malformedGpxRegression(browser);
  console.log('Browser regressions passed: desktop/mobile keyboard GPX choosers and malformed GPX recovery.');
} finally {
  await browser.close();
  await server.close();
}
