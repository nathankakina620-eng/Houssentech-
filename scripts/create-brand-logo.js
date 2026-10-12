import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. High-fidelity Vector SVG Logo for HOUSSETECH
// Modern, bold emblem combining a racing motorcycle silhouette, dynamic mechanical gear, speed wings, and HOUSSETECH typography.
const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>

    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#dc2626" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background rounded squircle / app badge -->
  <rect width="512" height="512" rx="118" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="114" fill="none" stroke="url(#redGrad)" stroke-width="4" stroke-opacity="0.4" />

  <!-- Outer circular gear ring / brake rotor teeth -->
  <g filter="url(#shadow)">
    <circle cx="256" cy="226" r="172" fill="none" stroke="url(#redGrad)" stroke-width="8" stroke-dasharray="28 14" opacity="0.9" />
    <circle cx="256" cy="226" r="150" fill="#0b1120" stroke="#334155" stroke-width="4" />
    
    <!-- Rotor ventilation drill holes -->
    <g fill="#1e293b">
      <circle cx="256" cy="96" r="7" />
      <circle cx="256" cy="356" r="7" />
      <circle cx="126" cy="226" r="7" />
      <circle cx="386" cy="226" r="7" />
      <circle cx="164" cy="134" r="6" />
      <circle cx="348" cy="134" r="6" />
      <circle cx="164" cy="318" r="6" />
      <circle cx="348" cy="318" r="6" />
    </g>

    <!-- Speed Wings Behind Moto -->
    <path d="M120 185 L210 185 L180 205 L110 205 Z" fill="url(#goldGrad)" opacity="0.85" />
    <path d="M302 185 L392 185 L402 205 L332 205 Z" fill="url(#goldGrad)" opacity="0.85" />
    <path d="M140 215 L220 215 L200 230 L130 230 Z" fill="url(#redGrad)" opacity="0.75" />
    <path d="M292 215 L372 215 L382 230 L312 230 Z" fill="url(#redGrad)" opacity="0.75" />

    <!-- Motorcycle Body & Mechanical Parts -->
    <!-- Front and Rear Wheels / Rims -->
    <g>
      <!-- Rear Wheel -->
      <circle cx="170" cy="272" r="44" fill="#020617" stroke="url(#redGrad)" stroke-width="12" />
      <circle cx="170" cy="272" r="22" fill="#1e293b" stroke="#f8fafc" stroke-width="4" />
      <circle cx="170" cy="272" r="8" fill="#ef4444" />

      <!-- Front Wheel -->
      <circle cx="342" cy="272" r="44" fill="#020617" stroke="url(#redGrad)" stroke-width="12" />
      <circle cx="342" cy="272" r="22" fill="#1e293b" stroke="#f8fafc" stroke-width="4" />
      <circle cx="342" cy="272" r="8" fill="#ef4444" />
    </g>

    <!-- Racing Moto Frame, Engine Piston & Fairing -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Chassis / Frame Tubes -->
      <path d="M170 272 L230 220 L290 220 L342 272" stroke="url(#silverGrad)" stroke-width="14" />
      <path d="M230 220 L256 160 L290 220" stroke="url(#silverGrad)" stroke-width="14" />

      <!-- Fuel Tank & Racing Fairing -->
      <path d="M210 190 Q256 142 300 178 L318 200 L250 206 Z" fill="url(#redGrad)" stroke="#ef4444" stroke-width="4" />
      
      <!-- Aerodynamic Windscreen & Handlebars -->
      <path d="M285 162 L320 156 L332 176" stroke="url(#goldGrad)" stroke-width="10" />
      <circle cx="330" cy="154" r="6" fill="#fbbf24" />

      <!-- Engine Block / Piston Accent -->
      <rect x="236" y="222" width="40" height="34" rx="6" fill="#1e293b" stroke="url(#silverGrad)" stroke-width="4" />
      <line x1="242" y1="232" x2="270" y2="232" stroke="#ef4444" stroke-width="3" />
      <line x1="242" y1="242" x2="270" y2="242" stroke="#ef4444" stroke-width="3" />
      <line x1="242" y1="250" x2="270" y2="250" stroke="#ef4444" stroke-width="3" />

      <!-- Exhaust Pipe / Muffler -->
      <path d="M246 256 L205 264 L160 252" stroke="#94a3b8" stroke-width="9" />
      <path d="M160 252 L142 248" stroke="url(#goldGrad)" stroke-width="11" />

      <!-- Front Shock Absorber Fork -->
      <path d="M320 176 L342 272" stroke="url(#goldGrad)" stroke-width="9" />
    </g>

    <!-- Speed Lightning Bolt / Crest at Top -->
    <polygon points="256,108 266,136 248,136 260,162 242,142 258,142" fill="url(#goldGrad)" />
  </g>

  <!-- Typography: HOUSSETECH -->
  <g text-anchor="middle" id="brand-typography">
    <!-- Brand Name with 3D shadow and dual color -->
    <text x="256" y="428" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-weight="900" font-size="46" letter-spacing="4">
      <tspan fill="#ffffff">HOUSSE</tspan><tspan fill="#ef4444">TECH</tspan>
    </text>

    <!-- Subtitle Badge: PIÈCES MOTO • KINSHASA -->
    <rect x="100" y="446" width="312" height="26" rx="13" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <text x="256" y="464" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12.5" fill="#f59e0b" letter-spacing="5">
      PIÈCES MOTO • KINSHASA
    </text>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgLogo);
fs.writeFileSync(path.join(publicDir, 'houssetech-logo.svg'), svgLogo);

// 2. Generate PNG icons with the same branding using pure Node.js buffer & zlib
function createBrandedPng(width, height) {
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

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - width / 2;
      const dy = y - height * 0.45; // Center slightly higher for text
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark background #0f172a
      let r = 15, g = 23, b = 42, a = 255;

      const outerR = width * 0.42;
      const ringWidth = width * 0.05;

      // Outer Red Gear Ring
      if (dist <= outerR && dist >= outerR - ringWidth) {
        // Gear notch effect
        const angle = Math.atan2(dy, dx);
        const notch = Math.sin(angle * 16);
        if (notch > -0.3) {
          r = 220; g = 38; b = 38; // Red
        } else {
          r = 185; g = 28; b = 28;
        }
      } else if (dist < outerR - ringWidth && dist >= outerR - ringWidth * 1.5) {
        // Gold accent circle
        r = 245; g = 158; b = 11;
      } else if (dist < outerR - ringWidth * 1.5 && dist >= outerR - ringWidth * 1.8) {
        // Dark inner groove
        r = 11; g = 17; b = 32;
      } else if (dist < outerR - ringWidth * 1.8) {
        // Center metallic area with motorcycle shape
        r = 15; g = 23, b = 42;

        // Two wheels: rear wheel at (-0.18w, +0.12h), front at (+0.18w, +0.12h)
        const rearWheelDist = Math.hypot(dx + width * 0.18, dy - width * 0.12);
        const frontWheelDist = Math.hypot(dx - width * 0.18, dy - width * 0.12);
        const wheelR = width * 0.10;

        if (rearWheelDist <= wheelR && rearWheelDist >= wheelR * 0.5) {
          r = 220; g = 38; b = 38; // Red tyre rim
        } else if (frontWheelDist <= wheelR && frontWheelDist >= wheelR * 0.5) {
          r = 220; g = 38; b = 38;
        } else if (rearWheelDist < wheelR * 0.5 && rearWheelDist >= wheelR * 0.2) {
          r = 248; g = 250; b = 252; // White hub
        } else if (frontWheelDist < wheelR * 0.5 && frontWheelDist >= wheelR * 0.2) {
          r = 248; g = 250; b = 252;
        } else if (rearWheelDist < wheelR * 0.2 || frontWheelDist < wheelR * 0.2) {
          r = 239; g = 68; b = 68; // Red center axle
        } else {
          // Motorcycle body frame line
          const isFrameLine = Math.abs(dy - (-Math.abs(dx) * 0.6 + width * 0.04)) < width * 0.04 && Math.abs(dx) < width * 0.20;
          const isTank = dy < 0 && dy > -width * 0.12 && Math.abs(dx) < width * 0.12;
          const isGoldFork = dx > width * 0.06 && dx < width * 0.18 && Math.abs(dy - (dx - width * 0.06) * 1.2) < width * 0.035;

          if (isTank) {
            r = 220; g = 38; b = 38; // Red tank
          } else if (isGoldFork) {
            r = 245; g = 158; b = 11; // Gold front fork
          } else if (isFrameLine) {
            r = 241; g = 245; b = 249; // White/chrome frame
          }
        }
      }

      // Bottom typography bar area
      if (y > height * 0.78 && y < height * 0.94) {
        // Red HOUSSETECH brand badge at bottom
        if (Math.abs(dx) < width * 0.44) {
          if (dx < 0) {
            // "HOUSSE" white area
            r = 248; g = 250; b = 252;
          } else {
            // "TECH" red area
            r = 239; g = 68; b = 68;
          }
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

// Generate branded icons
const pwa192 = createBrandedPng(192, 192);
const pwa512 = createBrandedPng(512, 512);
const appleIcon = createBrandedPng(180, 180);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), appleIcon);
fs.writeFileSync(path.join(publicDir, 'houssetech-logo.png'), pwa512);

console.log('HOUSSETECH brand icons generated successfully in public/');
