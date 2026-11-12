// Regenerates public/og-default.png, logo.png, apple-touch-icon.png, favicon.ico (PNG-in-ICO).
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630 });
await p.goto(pathToFileURL(path.resolve('scripts/assets/og.html')).href, { waitUntil: 'networkidle0' });
await p.screenshot({ path: 'public/og-default.png' });
const svg = fs.readFileSync('public/favicon.svg', 'utf8');
for (const [name, size] of [['logo.png', 512], ['apple-touch-icon.png', 180], ['favicon-32.png', 32]]) {
  await p.setViewport({ width: size, height: size });
  await p.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await p.screenshot({ path: `public/${name}`, omitBackground: true });
}
await b.close();
// Wrap the 32px PNG in an ICO container
const png = fs.readFileSync('public/favicon-32.png');
const h = Buffer.alloc(22);
h.writeUInt16LE(0, 0); h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4);
h.writeUInt8(32, 6); h.writeUInt8(32, 7); h.writeUInt8(0, 8); h.writeUInt8(0, 9);
h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12); h.writeUInt32LE(png.length, 14); h.writeUInt32LE(22, 18);
fs.writeFileSync('public/favicon.ico', Buffer.concat([h, png]));
fs.unlinkSync('public/favicon-32.png');
console.log('images done');
