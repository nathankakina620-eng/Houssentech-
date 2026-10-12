import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create crisp SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f1f5f9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#94a3b8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Background with rounded squircle -->
  <rect width="512" height="512" rx="112" fill="#0f172a"/>
  
  <!-- Outer glowing gear / brake disc motif -->
  <circle cx="256" cy="256" r="195" fill="none" stroke="url(#grad1)" stroke-width="14" stroke-dasharray="24 16"/>
  <circle cx="256" cy="256" r="165" fill="#1e293b"/>
  
  <!-- Motorcycle silhouette & piston gear accent -->
  <g fill="none" stroke="#f8fafc" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <!-- Wheels -->
    <circle cx="160" cy="310" r="48" fill="#0f172a" stroke="#ef4444" stroke-width="14" />
    <circle cx="352" cy="310" r="48" fill="#0f172a" stroke="#ef4444" stroke-width="14" />
    <circle cx="160" cy="310" r="16" fill="#f8fafc" />
    <circle cx="352" cy="310" r="16" fill="#f8fafc" />
    <!-- Frame -->
    <path d="M160 310 L220 250 L292 250 L352 310" stroke="#f8fafc" stroke-width="16"/>
    <path d="M220 250 L248 180 L292 250" stroke="#f8fafc" stroke-width="16"/>
    <path d="M248 180 L330 195 L345 170" stroke="#f59e0b" stroke-width="16"/>
    <!-- Exhaust pipe -->
    <path d="M245 285 L320 285" stroke="#94a3b8" stroke-width="12"/>
    <!-- Shock / Brake disc highlight -->
    <path d="M190 280 L220 250" stroke="#ef4444" stroke-width="10"/>
  </g>

  <!-- High-tech lightning / wrench speed spark -->
  <path d="M256 100 L275 140 L245 140 L268 180" fill="#f59e0b" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Text brand badge -->
  <text x="256" y="420" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="4">MOTO PARTS</text>
  <text x="256" y="445" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="16" fill="#ef4444" text-anchor="middle" letter-spacing="6">EXPRESS</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

// Helper function to create a basic solid/gradient PNG with CRC32
function createPngBuffer(width, height, rBg = 15, gBg = 23, bBg = 42) {
  // Simple uncompressed or zlib compressed PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = chunk('IHDR', ihdrData);

  // Raw image data: filter byte (0) + width * 4 bytes per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Draw stylized badge (red ring, dark center)
      const radius = width * 0.42;
      const innerRadius = width * 0.35;

      let r = rBg, g = gBg, b = bBg, a = 255;
      if (dist >= innerRadius && dist <= radius) {
        r = 220; g = 38; b = 38; // Red ring
      } else if (dist < innerRadius) {
        // Dark metallic center
        r = 30; g = 41; b = 59;
        if (Math.abs(dy) < width * 0.08 && Math.abs(dx) < width * 0.25) {
          // White bike bar
          r = 248; g = 250; b = 252;
        } else if (Math.abs(dx) < width * 0.08 && Math.abs(dy) < width * 0.22) {
          // Yellow speed bar
          r = 245; g = 158; b = 11;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', compressedData);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Standard table-based CRC32
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

// Generate the required files
const pwa192 = createPngBuffer(192, 192);
const pwa512 = createPngBuffer(512, 512);
const appleIcon = createPngBuffer(180, 180);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), appleIcon);

console.log('Icons generated successfully in public/');
