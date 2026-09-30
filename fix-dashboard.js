const fs = require('fs');

// 1. Fix colors.ts
let c = fs.readFileSync('D:/trusthome/constants/colors.ts', 'utf8');

c = c.replace(/background: 'rgba\\(0, 0, 0, 0\\.6\\)',/, `background: 'rgba(12, 18, 36, 1)',`);
c = c.replace(/backgroundSecondary: 'rgba\\(10, 10, 10, 0\\.7\\)',/, `backgroundSecondary: 'rgba(12, 18, 36, 0.8)',`);
c = c.replace(/backgroundTertiary: 'rgba\\(23, 23, 23, 0\\.8\\)',/, `backgroundTertiary: 'rgba(12, 18, 36, 0.65)',`);
c = c.replace(/surface: 'rgba\\(10, 10, 10, 0\\.75\\)',/, `surface: 'rgba(12, 18, 36, 0.65)',`);
c = c.replace(/surfaceElevated: 'rgba\\(23, 23, 23, 0\\.85\\)',/, `surfaceElevated: 'rgba(12, 18, 36, 0.85)',`);

fs.writeFileSync('D:/trusthome/constants/colors.ts', c);

// 2. Fix _layout.tsx
let l = fs.readFileSync('D:/trusthome/app/_layout.tsx', 'utf8');

// Remove the global background Image and Overlay from _layout.tsx
l = l.replace(
  /<Image[\\s\\S]*?resizeMode="cover"[\\s\\S]*?\/>\\s*<View style=\{\\[StyleSheet\\.absoluteFill, \{ backgroundColor: 'rgba\\(0,0,0,0\\.4\\)'[\\s\\S]*?\/>/,
  ''
);

fs.writeFileSync('D:/trusthome/app/_layout.tsx', l);

// 3. Fix Header.tsx
let h = fs.readFileSync('D:/trusthome/components/ui/Header.tsx', 'utf8');

if (!h.includes('<Image\\n          source={imageBanner}')) {
  h = h.replace(
    /<View style=\{\{ width: '100%', height: Platform\\.OS === 'web' \\? 240 : 200 \\+ insets\\.top, overflow: 'hidden' \}\}>\\n        <LinearGradient/,
    `<View style={{ width: '100%', height: Platform.OS === 'web' ? 240 : 200 + insets.top, overflow: 'hidden' }}>
        <Image
          source={imageBanner}
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        <LinearGradient`
  );
}

fs.writeFileSync('D:/trusthome/components/ui/Header.tsx', h);

// 4. Update CommandCenterHub.tsx
let hub = fs.readFileSync('D:/trusthome/components/screens/CommandCenterHub.tsx', 'utf8');

// A. Import HorizontalCarousel
if (!hub.includes('HorizontalCarousel')) {
  hub = hub.replace(
    /import \{ KenBurnsHero \} from '@\/components\/ui\/VideoHero';/,
    `import { KenBurnsHero } from '@/components/ui/VideoHero';\nimport { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';`
  );
}

// B. Update TOOLS_QUICK to include images
hub = hub.replace(
  /const TOOLS_QUICK = \\[[\\s\\S]*?\\];/,
  `const TOOLS_QUICK = [
  { emoji: '📋', label: 'Transactions', route: '/transactions', color: '#52525B', image: require('@/assets/images/guide-transactions.jpg') },
  { emoji: '🏠', label: 'Properties', route: '/properties', color: '#52525B', image: require('@/assets/images/guide-properties.jpg') },
  { emoji: '📄', label: 'Documents', route: '/documents', color: '#52525B', image: require('@/assets/images/guide-documents.jpg') },
  { emoji: '💬', label: 'Messages', route: '/messages', color: '#52525B', image: require('@/assets/images/guide-messages.jpg') },
  { emoji: '🎬', label: 'Media Studio', route: '/media-studio', color: '#52525B', image: require('@/assets/images/guide-media.jpg') },
  { emoji: '💼', label: 'Business Suite', route: '/business', color: '#52525B', image: require('@/assets/images/guide-business.jpg') },
];`
);

// C. Replace toolsGrid with HorizontalCarousel
hub = hub.replace(
  /<View style=\{styles\\.toolsGrid\}>[\\s\\S]*?<\/View>/,
  `<HorizontalCarousel itemWidth={220}>
          {TOOLS_QUICK.map((tool) => (
            <Pressable
              key={tool.label}
              style={({ pressed }) => [
                styles.toolCardCarousel,
                { opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={() => router.push(tool.route as any)}
            >
              <Image source={tool.image} style={styles.toolCardImg} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
                style={styles.toolCardGradient}
              />
              <View style={styles.toolCardContent}>
                <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text style={{ fontSize: 20 }}>{tool.emoji}</Text>
                </View>
                <Text style={styles.toolLabelCarousel}>{tool.label}</Text>
              </View>
            </Pressable>
          ))}
        </HorizontalCarousel>`
);

// D. Add styles
if (!hub.includes('toolCardCarousel')) {
  hub = hub.replace(
    /toolCard: \{\\n[\\s\\S]*?\},\\n  toolIconWrap/,
    `toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    ...(SCREEN_WIDTH > 600 ? { width: '30%', minWidth: 200 } : {})
  },
  toolCardCarousel: {
    width: 210,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toolCardImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  toolCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  toolCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  toolLabelCarousel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  toolIconWrap`
  );
}

fs.writeFileSync('D:/trusthome/components/screens/CommandCenterHub.tsx', hub);

console.log('Update script completed successfully!');
