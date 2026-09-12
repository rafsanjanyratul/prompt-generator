import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const styles = [
  ['1980s-vintage-portrait', 'boys', '#6f4a3b,#d6a268,#f3e5d0,#24314f'],
  ['sunlit-girl-editorial', 'girls', '#d89a74,#f5d7b4,#f3efe7,#7a6b67'],
  ['romantic-couple-street-scene', 'couples', '#7b4a48,#d7a67f,#f5e7d8,#2d4668'],
  ['cozy-family-portrait', 'family', '#bd8e5d,#d9c9ac,#f4efe7,#53656e'],
  ['retro-synthwave-portrait', 'boys', '#2a1d5c,#ff4cd9,#65e5ff,#f4f0ff'],
  ['bengali-traditional-portrait', 'girls', '#7c3d35,#c48759,#f2e3d5,#2b3f57'],
  ['dhaka-street-cinematic-portrait', 'boys', '#2f3949,#d3a15d,#f6ead9,#79857e'],
  ['rooftop-couple-golden-hour', 'couples', '#7a4b40,#f5b77a,#fce9cc,#314a67'],
  ['dhaka-wedding-inspired-portrait', 'family', '#9d4b49,#d7a65d,#f2e4d3,#334768'],
  ['rural-bangladesh-vintage-memory', 'family', '#7e522d,#c99669,#efe2d3,#405a4d'],
  ['safari-family-travel-moment', 'family', '#3d6d53,#d1a456,#f5e7c0,#2a4968'],
  ['parisian-fashion-editorial', 'girls', '#2e4051,#c9a791,#f7eee7,#8a6e5e'],
  ['studio-portrait-neon-detail', 'boys', '#101930,#3be8ff,#ff52d9,#edf5ff'],
  ['coastal-couple-escape', 'couples', '#2d4f6d,#8bb7db,#f8e7c8,#d48c66'],
  ['monsoon-rural-family-story', 'family', '#465f5f,#8b9e9e,#e5e0d1,#c68f57'],
  ['urban-girl-fashion-week', 'girls', '#23364e,#d87d5c,#f6e5d3,#6f4e7a'],
  ['heritage-culture-portrait', 'boys', '#4c3825,#ae7d52,#f1e0ca,#2e4968'],
  ['soft-studio-mother-daughter', 'family', '#d7b09e,#f4e0d7,#e7e0db,#6e7380'],
  ['weekend-city-couple-walk', 'couples', '#4a5d6d,#e5b18d,#f7ebd8,#7c8db7'],
  ['editorial-boys-heritage-portrait', 'boys', '#7a472b,#d8b38f,#efe3d0,#2c3d5b']
];

const rootDir = path.resolve(process.cwd(), 'public', 'images', 'styles');

function buildSvg(slug, palette) {
  const [a, b, c, d] = palette.split(',');

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${a}" />
        <stop offset="50%" stop-color="${b}" />
        <stop offset="100%" stop-color="${c}" />
      </linearGradient>
    </defs>
    <rect width="800" height="1000" fill="url(#bg)" />
    <circle cx="650" cy="160" r="220" fill="rgba(255,255,255,0.18)"/>
    <rect x="0" y="700" width="800" height="300" fill="rgba(10,15,20,0.18)"/>
    <path d="M120 760 L680 760" stroke="rgba(255,255,255,0.18)" stroke-width="4"/>
    <path d="M150 220 L650 220" stroke="rgba(255,255,255,0.12)" stroke-width="5"/>
    <rect x="170" y="180" width="460" height="220" rx="18" fill="rgba(255,255,255,0.08)"/>
    <g transform="translate(400 520)">
      <ellipse cx="0" cy="0" rx="120" ry="30" fill="rgba(0,0,0,0.10)"/>
      <circle cx="-60" cy="-110" r="42" fill="#e7c4a0"/>
      <circle cx="60" cy="-120" r="38" fill="#e0ae83"/>
      <path d="M-95 -105 Q0 -160 95 -105 L100 -30 Q50 -10 0 -10 Q-50 -10 -100 -30 Z" fill="#2b1f1c"/>
      <path d="M-120 0 Q0 -35 120 0 L150 190 Q80 220 0 220 Q-80 220 -150 190 Z" fill="${d}"/>
      <path d="M-95 40 L-150 180 L-45 180 L-28 80 Z" fill="#4b5b70" opacity="0.9"/>
      <path d="M95 40 L150 180 L45 180 L28 80 Z" fill="#4b5b70" opacity="0.9"/>
      <circle cx="-15" cy="-122" r="4" fill="#2c1f20"/>
      <circle cx="15" cy="-122" r="4" fill="#2c1f20"/>
      <path d="M-20 -90 Q0 -80 20 -90" stroke="#7b5a4e" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <text x="400" y="930" text-anchor="middle" font-size="32" font-family="Arial, sans-serif" fill="rgba(255,255,255,0.82)" letter-spacing="2">${slug.replace(/-/g, ' ').toUpperCase()}</text>
  </svg>
  `;
}

async function generateAssets() {
  fs.mkdirSync(rootDir, { recursive: true });

  const entries = [];

  for (const [slug, folder, palette] of styles) {
    const dir = path.join(rootDir, folder);
    fs.mkdirSync(dir, { recursive: true });

    const svg = buildSvg(slug, palette);
    const outputPath = path.join(dir, `${slug}.webp`);

    await sharp(Buffer.from(svg))
      .resize(800, 1000, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toFile(outputPath);

    entries.push({ slug, folder, outputPath });
  }

  console.log(`Generated ${entries.length} WebP assets in ${rootDir}`);
  for (const item of entries) {
    console.log(`${item.slug}: ${item.outputPath}`);
  }
}

generateAssets().catch((error) => {
  console.error('Asset generation failed:', error);
  process.exit(1);
});
