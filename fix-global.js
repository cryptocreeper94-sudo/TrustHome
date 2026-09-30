const fs = require('fs');

let layout = fs.readFileSync('D:/trusthome/app/_layout.tsx', 'utf8');
layout = layout.replace(
  /<View style=\{\{ flex: 1, backgroundColor: '#000' \}\}>/,
  `<View style={{ flex: 1, backgroundColor: '#000', minHeight: Platform.OS === 'web' ? '100vh' : '100%' }}>
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
fs.writeFileSync('D:/trusthome/app/_layout.tsx', layout);

let index = fs.readFileSync('D:/trusthome/app/index.tsx', 'utf8');
index = index.replace(/<Image[\s\S]*?require\('@\/assets\/images\/luxury-bg\.jpg'\)[\s\S]*?\/>/, '');
fs.writeFileSync('D:/trusthome/app/index.tsx', index);

let media = fs.readFileSync('D:/trusthome/app/media-studio.tsx', 'utf8');
media = media.replace(/backgroundColor: colors\.background/, "backgroundColor: 'rgba(0,0,0,0.65)'");
fs.writeFileSync('D:/trusthome/app/media-studio.tsx', media);
