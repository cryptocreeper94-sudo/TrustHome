const fs = require('fs');
const path = require('path');

const appDir = 'D:/trusthome/app';
const files = fs.readdirSync(appDir).filter(f => f.endsWith('.tsx'));

let changedFiles = 0;

files.forEach(f => {
  const p = path.join(appDir, f);
  let content = fs.readFileSync(p, 'utf8');
  let original = content;

  // Remove imageBanner
  content = content.replace(/imageBanner=\{require\([^)]+\)\}/g, '');
  
  // Set transparent to false
  content = content.replace(/transparent=\{true\}/g, 'transparent={false}');
  content = content.replace(/transparent\s*\/>/g, 'transparent={false} />');
  content = content.replace(/transparent\n/g, 'transparent={false}\n');
  
  // Set root view background to dark blue
  // Look for styles.container, { backgroundColor: colors.background }
  content = content.replace(/backgroundColor:\s*colors\.background/g, "backgroundColor: isDark ? '#0B1021' : colors.background");
  
  // Also look for specific overrides like leads.tsx uses 'rgba(0,0,0,0.65)'
  content = content.replace(/backgroundColor:\s*'rgba\(0,0,0,0\.65\)'/g, "backgroundColor: isDark ? '#0B1021' : 'rgba(0,0,0,0.65)'");
  content = content.replace(/backgroundColor:\s*'rgba\(0,0,0,0\.6\)'/g, "backgroundColor: isDark ? '#0B1021' : 'rgba(0,0,0,0.6)'");

  if (content !== original) {
    fs.writeFileSync(p, content);
    changedFiles++;
    console.log(`Updated ${f}`);
  }
});

console.log(`Updated ${changedFiles} files.`);
