const fs = require('fs');
let l = fs.readFileSync('D:/trusthome/app/_layout.tsx', 'utf8');

if (!l.includes("pointerEvents: 'none'")) {
  l = l.replace(
    /<RootLayoutNav \/>/g,
    `<View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }, Platform.OS === 'web' && { position: 'fixed', width: '100vw', height: '100vh' } as any]} />\n                    <RootLayoutNav />`
  );
  fs.writeFileSync('D:/trusthome/app/_layout.tsx', l);
}
