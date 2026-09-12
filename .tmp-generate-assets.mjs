import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const styles = [
  { slug: '1980s-vintage-portrait', folder: 'boys', palette: ['#6b4b41','#d7a67a','#f4e5d1','#2d3548'], mode: 'vintage' },
  { slug: 'sunlit-girl-editorial', folder: 'girls', palette: ['#d5966a','#f7d7b5','#f2efe8','#7a6f6d'], mode: 'editorial' },
  { slug: 'romantic-couple-street-scene', folder: 'couples', palette: ['#7a4b41','#e0b58f','#f4e3d7','#314d6d'], mode: 'cinematic' },
  { slug: 'cozy-family-portrait', folder: 'family', palette: ['#b9875a','#d9c7ad','#f5f0e7','#50656f'], mode: 'lifestyle' },
  { slug: 'retro-synthwave-portrait', folder: 'boys', palette: ['#2a1d5c','#ff4fd8','#6ae7ff','#f6f3ff'], mode: 'retro' },
  { slug: 'bengali-traditional-portrait', folder: 'girls', palette: ['#7a3d34','#c79b67','#f1e2d0','#2b3d52'], mode: 'traditional' },
  { slug: 'dhaka-street-cinematic-portrait', folder: 'boys', palette: ['#2e3746','#d7a059','#f6e7d0','#7b837f'], mode: 'street' },
  { slug: 'rooftop-couple-golden-hour', folder: 'couples', palette: ['#774d3d','#f5b77f','#fce7c8','#2f4965'], mode: 'golden' },
  { slug: 'dhaka-wedding-inspired-portrait', folder: 'family', palette: ['#9d4a4a','#dca45f','#f3dfd0','#32476c'], mode: 'wedding' },
  { slug: 'rural-bangladesh-vintage-memory', folder: 'family', palette: ['#7d512d','#c9965c','#efe2ce','#405a4d'], mode: 'memory' },
  { slug: 'safari-family-travel-moment', folder: 'family', palette: ['#3d6c52','#d0a654','#f5e7c5','#2d4d69'], mode: 'travel' },
  { slug: 'parisian-fashion-editorial', folder: 'girls', palette: ['#2f4051','#d0b0a0','#f7efe6','#8c6d5b'], mode: 'fashion' },
  { slug: 'studio-portrait-neon-detail', folder: 'boys', palette: ['#121829','#3be7ff','#ff4bd6','#edf2ff'], mode: 'studio' },
  { slug: 'coastal-couple-escape', folder: 'couples', palette: ['#2f4f6d','#89b6d9','#f8e5c2','#d48c62'], mode: 'coastal' },
  { slug: 'monsoon-rural-family-story', folder: 'family', palette: ['#466361','#8e9c9c','#e5e0d3','#c88d57'], mode: 'monsoon' },
  { slug: 'urban-girl-fashion-week', folder: 'girls', palette: ['#24364d','#d67e58','#f6e5d5','#6b4f7a'], mode: 'urban' },
  { slug: 'heritage-culture-portrait', folder: 'boys', palette: ['#4d3925','#b07b52','#f0dfc7','#2f4964'], mode: 'heritage' },
  { slug: 'soft-studio-mother-daughter', folder: 'family', palette: ['#d8b6a1','#f3dfd5','#eae3db','#6e7680'], mode: 'studio-family' },
  { slug: 'weekend-city-couple-walk', folder: 'couples', palette: ['#4a5a6f','#e5b38a','#f7ead7','#7c8db7'], mode: 'walk' },
  { slug: 'editorial-boys-heritage-portrait', folder: 'boys', palette: ['#794b2b','#d7b289','#efe2d1','#2f3d59'], mode: 'editorial-boys' },
];

function personGroup({ skin, hair, outfit, shirt, accent, flip = false, x = 0, y = 0, scale = 1 }) {
  const transform = flip ? ' translate(800 0) scale(-1 1)' : '';
  return `
    <g transform="translate(${x} ${y}) scale(${scale})${transform}">
      <ellipse cx="0" cy="0" rx="70" ry="22" fill="rgba(0,0,0,0.15)"/>
      <circle cx="0" cy="-120" r="52" fill="${skin}"/>
      <path d="M-50 -135 Q0 -182 50 -135 L52 -78 Q30 -62 0 -62 Q-30 -62 -52 -78 Z" fill="${hair}"/>
      <path d="M-58 0 Q0 -32 58 0 L78 180 Q32 220 0 220 Q-32 220 -78 180 Z" fill="${shirt}"/>
      <path d="M-52 -10 L-76 120 L-86 220 L-25 220 L-12 110 L-28 0 Z" fill="${outfit}"/>
      <path d="M52 -10 L76 120 L86 220 L25 220 L12 110 L28 0 Z" fill="${outfit}"/>
      <path d="M-32 70 L-35 188 L-10 188 L-8 70 Z" fill="${accent}" opacity="0.9"/>
      <path d="M32 70 L35 188 L10 188 L8 70 Z" fill="${accent}" opacity="0.9"/>
      <circle cx="-20" cy="-125" r="5" fill="#2a1d1c"/>
      <circle cx="20" cy="-125" r="5" fill="#2a1d1c"/>
      <path d="M-18 -98 Q0 -90 18 -98" stroke="#8d6849" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
  `;
}

function familyGroup({ skin, hair, outfit, accent, x, y, scale = 1 }) {
  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cx="0" cy="0" rx="86" ry="20" fill="rgba(0,0,0,0.10)"/>
      <circle cx="-40" cy="-85" r="38" fill="${skin}"/>
      <circle cx="40" cy="-92" r="35" fill="${skin}"/>
      <path d="M-72 -84 Q-42 -122 0 -118 L35 -118 Q72 -90 74 -52 Q42 -42 -18 -42 L-68 -42 Z" fill="${hair}"/>
      <path d="M-86 -10 Q-52 -34 0 -34 Q38 -34 78 -10 L90 120 Q28 154 0 154 Q-28 154 -90 120 Z" fill="${outfit}"/>
      <path d="M-70 40 L-105 150 L-18 150 L-25 60 Z" fill="${accent}" opacity="0.85"/>
      <path d="M70 40 L105 150 L18 150 L25 60 Z" fill="${accent}" opacity="0.85"/>
      <circle cx="-10" cy="-95" r="4" fill="#2b2b2b"/>
      <circle cx="18" cy="-98" r="4" fill="#2b2b2b"/>
      <path d="M-18 -68 Q0 -58 18 -68" stroke="#7a5a4a" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
  `;
}

function createSvg(theme) {
  const [c1, c2, c3, c4] = theme.palette;
  const background = `
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.7)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
  `;

  const base = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      ${background}
      <rect width="800" height="1000" fill="url(#bg)"/>
      <circle cx="675" cy="120" r="220" fill="url(#glow)" opacity="0.55"/>
      <circle cx="180" cy="840" r="230" fill="rgba(255,255,255,0.18)"/>
      <rect x="0" y="680" width="800" height="320" fill="rgba(14,18,26,0.17)"/>
  `;

  const getBody = (mode) => {
    switch (mode) {
      case 'vintage':
        return `
          <g opacity="0.18">
            <path d="M60 720 L720 720 M60 760 L720 760 M60 800 L720 800" stroke="#F7F0E6" stroke-width="3"/>
            <circle cx="130" cy="170" r="80" fill="rgba(255,255,255,0.12)"/>
          </g>
          ${personGroup({ skin: '#d7a17a', hair: '#2b1e1c', outfit: '#5a586b', shirt: '#d8c1a1', accent: '#efe4d6', x: 410, y: 490, scale: 1.2 })}
        `;
      case 'editorial':
        return `
          <g opacity="0.22">
            <rect x="120" y="140" width="560" height="240" rx="18" fill="rgba(255,255,255,0.12)"/>
          </g>
          ${personGroup({ skin: '#f1c5a9', hair: '#4a2d2a', outfit: '#f3efe6', shirt: '#f5d8c8', accent: '#c2946c', x: 400, y: 490, scale: 1.15 })}
        `;
      case 'cinematic':
        return `
          <path d="M60 630 L280 450 L520 700 L740 520 L740 1000 L60 1000 Z" fill="rgba(17,22,34,0.18)"/>
          <g opacity="0.26"><circle cx="610" cy="260" r="118" fill="rgba(255,219,160,0.28)"/></g>
          ${personGroup({ skin: '#d7ae86', hair: '#281d1c', outfit: '#a65e47', shirt: '#efc19b', accent: '#f7d8a9', x: 310, y: 460, scale: 1.08 })}
          ${personGroup({ skin: '#e2b391', hair: '#2d1b18', outfit: '#5c7b9d', shirt: '#e9d7ca', accent: '#d98e5b', x: 500, y: 495, scale: 0.95, flip: true })}
        `;
      case 'lifestyle':
        return `
          <rect x="120" y="180" width="560" height="220" rx="18" fill="rgba(255,255,255,0.10)"/>
          <path d="M90 780 L700 780" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          ${familyGroup({ skin: '#d7a07d', hair: '#3a2e30', outfit: '#7a8d7b', accent: '#d4bb9d', x: 420, y: 535, scale: 1.12 })}
        `;
      case 'retro':
        return `
          <g opacity="0.48">
            <path d="M90 200 L230 200 L260 260 L150 318 L90 260 Z" fill="rgba(255,255,255,0.18)"/>
            <path d="M550 200 L690 200 L730 260 L610 318 L550 260 Z" fill="rgba(255,255,255,0.18)"/>
          </g>
          ${personGroup({ skin: '#e5b28e', hair: '#1d1328', outfit: '#7b5fe6', shirt: '#f5d1ff', accent: '#59e1ff', x: 395, y: 460, scale: 1.2 })}
        `;
      case 'traditional':
        return `
          <path d="M150 250 L650 250" stroke="rgba(255,255,255,0.20)" stroke-width="6"/>
          <path d="M180 760 Q400 660 620 760" stroke="rgba(255,255,255,0.15)" stroke-width="6" fill="none"/>
          ${personGroup({ skin: '#d8ab82', hair: '#2b1716', outfit: '#b85b58', shirt: '#f3d8c5', accent: '#d79b62', x: 400, y: 500, scale: 1.18 })}
        `;
      case 'street':
        return `
          <path d="M60 760 L110 540 L180 760 Z M610 760 L700 560 L740 760 Z" fill="rgba(20,24,32,0.18)"/>
          <rect x="120" y="140" width="560" height="180" rx="8" fill="rgba(0,0,0,0.12)"/>
          ${personGroup({ skin: '#cb9e7a', hair: '#1e1b20', outfit: '#4f5f68', shirt: '#d1b494', accent: '#f0b46a', x: 400, y: 520, scale: 1.18 })}
        `;
      case 'golden':
        return `
          <circle cx="540" cy="260" r="145" fill="rgba(255,211,136,0.25)"/>
          <path d="M0 780 L800 700 L800 1000 L0 1000 Z" fill="rgba(56,40,34,0.20)"/>
          ${personGroup({ skin: '#d8a07d', hair: '#281a1c', outfit: '#b8674c', shirt: '#edc9a2', accent: '#f2d299', x: 330, y: 490, scale: 1.06 })}
          ${personGroup({ skin: '#ddaf8a', hair: '#2b1c26', outfit: '#8e574d', shirt: '#f1ddb9', accent: '#f7d89c', x: 500, y: 520, scale: 0.97, flip: true })}
        `;
      case 'wedding':
        return `
          <circle cx="180" cy="200" r="110" fill="rgba(255,255,255,0.12)"/>
          <path d="M160 660 L640 660" stroke="rgba(255,255,255,0.20)" stroke-width="4"/>
          ${familyGroup({ skin: '#ddae88', hair: '#301d17', outfit: '#9b5b45', accent: '#d1ac67', x: 410, y: 550, scale: 1.1 })}
        `;
      case 'memory':
        return `
          <rect x="90" y="150" width="620" height="260" rx="18" fill="rgba(255,255,255,0.06)"/>
          <g opacity="0.16">
            <path d="M100 530 C220 470,300 490,380 530 S580 620,700 570" stroke="rgba(255,255,255,0.4)" stroke-width="5" fill="none"/>
          </g>
          ${familyGroup({ skin: '#d1a37d', hair: '#413227', outfit: '#6b8265', accent: '#d5ba86', x: 420, y: 540, scale: 1.14 })}
        `;
      case 'travel':
        return `
          <circle cx="630" cy="220" r="150" fill="rgba(255,219,153,0.18)"/>
          <path d="M80 760 L720 660 L720 1000 L80 1000 Z" fill="rgba(25,50,49,0.18)"/>
          ${familyGroup({ skin: '#d5a57e', hair: '#443531', outfit: '#5f7c5d', accent: '#d5ae63', x: 428, y: 540, scale: 1.08 })}
        `;
      case 'fashion':
        return `
          <g opacity="0.22"><path d="M120 260 L680 260 L680 420 L120 420 Z" fill="rgba(255,255,255,0.18)"/></g>
          ${personGroup({ skin: '#f1c0a0', hair: '#2b2734', outfit: '#af6c5b', shirt: '#f9cfc0', accent: '#dec1b0', x: 400, y: 500, scale: 1.2 })}
        `;
      case 'studio':
        return `
          <g opacity="0.28">
            <rect x="180" y="170" width="440" height="260" rx="16" fill="rgba(255,255,255,0.10)"/>
            <path d="M250 520 L550 520" stroke="rgba(255,255,255,0.24)" stroke-width="4"/>
          </g>
          ${personGroup({ skin: '#e2b995', hair: '#1c2030', outfit: '#3ec8ff', shirt: '#0d1632', accent: '#ff4bd6', x: 400, y: 520, scale: 1.26 })}
        `;
      case 'coastal':
        return `
          <path d="M0 720 Q250 660 400 700 T800 680 L800 1000 L0 1000 Z" fill="rgba(12,32,48,0.14)"/>
          <circle cx="220" cy="200" r="110" fill="rgba(255,255,255,0.10)"/>
          ${personGroup({ skin: '#dfb38c', hair: '#2d1f29', outfit: '#7ca4bc', shirt: '#f1d9bc', accent: '#f7c18b', x: 320, y: 500, scale: 1.04 })}
          ${personGroup({ skin: '#d19d82', hair: '#382427', outfit: '#c4765b', shirt: '#f4d8c4', accent: '#8fc2d7', x: 500, y: 540, scale: 0.96, flip: true })}
        `;
      case 'monsoon':
        return `
          <g opacity="0.24">
            <path d="M90 260 C200 220,260 220,330 260 S500 300,700 250" stroke="rgba(255,255,255,0.42)" stroke-width="4" fill="none"/>
            <path d="M90 340 C200 300,260 310,330 350 S500 390,700 330" stroke="rgba(255,255,255,0.34)" stroke-width="4" fill="none"/>
          </g>
          ${familyGroup({ skin: '#d2a17b', hair: '#3a2d26', outfit: '#6d7d73', accent: '#d7a060', x: 430, y: 560, scale: 1.15 })}
        `;
      case 'urban':
        return `
          <g opacity="0.20">
            <rect x="120" y="200" width="560" height="200" rx="10" fill="rgba(255,255,255,0.14)"/>
            <path d="M150 430 L650 430" stroke="rgba(255,255,255,0.18)" stroke-width="4"/>
          </g>
          ${personGroup({ skin: '#e4b391', hair: '#2d2731', outfit: '#8d5c68', shirt: '#f7d4bf', accent: '#d98a42', x: 400, y: 500, scale: 1.18 })}
        `;
      case 'heritage':
        return `
          <g opacity="0.20">
            <path d="M180 200 L620 200" stroke="rgba(255,255,255,0.22)" stroke-width="3"/>
            <path d="M180 250 L620 250" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
          </g>
          ${personGroup({ skin: '#d8a278', hair: '#352515', outfit: '#6d4d2d', shirt: '#e8d5be', accent: '#b98b5a', x: 400, y: 500, scale: 1.22 })}
        `;
      case 'studio-family':
        return `
          <rect x="150" y="170" width="500" height="260" rx="18" fill="rgba(255,255,255,0.12)"/>
          ${familyGroup({ skin: '#d6a584', hair: '#413a3e', outfit: '#91a1a8', accent: '#d4b598', x: 350, y: 560, scale: 1.00 })}
        `;
      case 'walk':
        return `
          <path d="M70 760 L730 760" stroke="rgba(255,255,255,0.22)" stroke-width="4"/>
          <path d="M150 190 L650 190" stroke="rgba(255,255,255,0.18)" stroke-width="5"/>
          ${personGroup({ skin: '#d19d7d', hair: '#2a201e', outfit: '#7f6f87', shirt: '#f0d7b3', accent: '#eab08a', x: 340, y: 530, scale: 1.0 })}
          ${personGroup({ skin: '#dbb18b', hair: '#27262d', outfit: '#5f7999', shirt: '#f4ddcb', accent: '#d69165', x: 510, y: 550, scale: 0.92, flip: true })}
        `;
      case 'editorial-boys':
        return `
          <g opacity="0.24"><rect x="180" y="160" width="440" height="200" rx="20" fill="rgba(255,255,255,0.12)"/></g>
          ${personGroup({ skin: '#d5a47d', hair: '#332924', outfit: '#805f42', shirt: '#f0d8bc', accent: '#d49665', x: 400, y: 500, scale: 1.22 })}
        `;
      default:
        return personGroup({ skin: '#d7a07d', hair: '#2b1d1d', outfit: '#7d95b3', shirt: '#f1d4af', accent: '#d8b68e', x: 400, y: 500, scale: 1.13 });
    }
  };

  return `${base}${getBody(theme.mode)} </svg>`;
}

async function main() {
  const outputRoot = path.resolve('public/images/styles');
  fs.mkdirSync(outputRoot, { recursive: true });

  const generated = [];
  for (const theme of styles) {
    const dir = path.join(outputRoot, theme.folder);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${theme.slug}.webp`);
    const svg = createSvg(theme);
    await sharp(Buffer.from(svg)).resize(800, 1000, { fit: 'cover' }).webp({ quality: 82 }).toFile(filePath);
    generated.push(filePath);
  }

  console.log(JSON.stringify({ total: generated.length, files: generated.map(p => p.replace(/^.*public\//, '/')) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
