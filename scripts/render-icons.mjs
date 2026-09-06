import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch({ headless: true });

async function render(size, fileName, padding = 0) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const iconSize = size - padding * 2;
  await page.setContent(`<style>*{box-sizing:border-box}html,body{margin:0;width:${size}px;height:${size}px;background:#061413;display:grid;place-items:center}svg{width:${iconSize}px;height:${iconSize}px}</style>${svg}`);
  await page.screenshot({ path: new URL(`../public/icons/${fileName}`, import.meta.url).pathname });
  await page.close();
}

await render(192, 'sf-route-fidelity-check-icon-192.png');
await render(512, 'sf-route-fidelity-check-icon-512.png');
await render(512, 'sf-route-fidelity-check-maskable-512.png', 51);
await render(180, 'apple-touch-icon.png');
await browser.close();
