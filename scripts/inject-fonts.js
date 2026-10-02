/**
 * Post-build: Injects @font-face rules into dist/index.html
 * so icon fonts (Ionicons, MaterialIcons, etc.) load immediately via CSS
 * instead of via async JS — prevents empty-square icon flash.
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const HTML = path.join(DIST, 'index.html');
const FONTS_DIR = path.join(DIST, 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
const FONTS_URL_BASE = '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts';

const FONT_FAMILIES = {
  'Ionicons': 'Ionicons',
  'MaterialCommunityIcons': 'Material Design Icons', 
  'MaterialIcons': 'Material Icons',
  'FontAwesome': 'FontAwesome',
  'Feather': 'Feather',
};

if (!fs.existsSync(FONTS_DIR)) {
  console.error('Fonts directory not found:', FONTS_DIR);
  process.exit(1);
}

const files = fs.readdirSync(FONTS_DIR).filter(f => f.endsWith('.ttf'));
console.log(`Found ${files.length} font files`);

let fontCSS = '';
let preloads = '';

for (const file of files) {
  const baseName = file.split('.')[0];
  const family = FONT_FAMILIES[baseName];
  if (!family) continue;
  
  const url = `${FONTS_URL_BASE}/${file}`;
  fontCSS += `
      @font-face {
        font-family: '${family}';
        src: url('${url}') format('truetype');
        font-display: block;
      }`;
  
  // Preload Ionicons specifically (the most critical one)
  if (baseName === 'Ionicons') {
    preloads += `\n    <link rel="preload" as="font" type="font/ttf" crossorigin href="${url}" />`;
  }
}

if (!fontCSS) {
  console.log('No matching font families found');
  process.exit(0);
}

let html = fs.readFileSync(HTML, 'utf-8');
const injection = `\n    <style id="icon-fonts">${fontCSS}\n    </style>${preloads}`;
html = html.replace('</head>', `${injection}\n  </head>`);

fs.writeFileSync(HTML, html);
console.log('Injected @font-face rules for:', Object.values(FONT_FAMILIES).join(', '));
