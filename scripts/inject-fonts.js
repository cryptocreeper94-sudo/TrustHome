/**
 * Post-build: Injects @font-face rules into dist/index.html
 * Font family names MUST match what expo-font registers via createIconSet.
 * See node_modules/@expo/vector-icons/build/Ionicons.js etc.
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const HTML = path.join(DIST, 'index.html');
const FONTS_DIR = path.join(DIST, 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
const FONTS_URL_BASE = '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts';

// These family names come from the createIconSet calls in @expo/vector-icons/build/*.js
// e.g. createIconSet(glyphMap, 'ionicons', font) — the second argument is the fontFamily
const FONT_FAMILIES = {
  'Ionicons': 'ionicons',
  'MaterialCommunityIcons': 'Material Design Icons',
  'MaterialIcons': 'MaterialIcons-Regular',
  'FontAwesome': 'FontAwesome',
  'Feather': 'Feather',
  'AntDesign': 'anticon',
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
  // Use double quotes for font-family to match expo-font's JS-generated rules exactly
  fontCSS += `@font-face{font-family:"${family}";src:url("${url}") format("truetype");font-display:block}`;

  // Preload the most critical icon fonts
  if (baseName === 'Ionicons' || baseName === 'MaterialCommunityIcons') {
    preloads += `\n    <link rel="preload" as="font" type="font/ttf" crossorigin href="${url}" />`;
  }
}

if (!fontCSS) {
  console.log('No matching font families found');
  process.exit(0);
}

let html = fs.readFileSync(HTML, 'utf-8');

// Remove any existing expo-generated font style element that might conflict
// (expo-font creates <style id="expo-generated-fonts"> at runtime)
const injection = `\n    <style id="expo-generated-fonts">${fontCSS}</style>${preloads}`;
html = html.replace('</head>', `${injection}\n  </head>`);

fs.writeFileSync(HTML, html);
console.log('Injected @font-face rules for:', Object.entries(FONT_FAMILIES).map(([k,v]) => `${k} → "${v}"`).join(', '));
