const fs = require('fs');
let c = fs.readFileSync('D:/trusthome/app/index.tsx', 'utf8');
c = c.replace(/Linking,/, 'Linking, Image,');
c = c.replace(
  /<View style=\{\[styles\.container, \{ backgroundColor: colors\.background \}\]\}>/,
  `<View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image 
        source={require('@/assets/images/luxury-bg.jpg')} 
        style={[
          StyleSheet.absoluteFill, 
          { width: '100%', height: '100%', opacity: 1 },
          Platform.OS === 'web' && { position: 'fixed', width: '100vw', height: '100vh' } as any
        ]} 
        resizeMode="cover"
      />`
);
fs.writeFileSync('D:/trusthome/app/index.tsx', c);
