const fs = require('fs');

// 1. Update colors.ts
let c = fs.readFileSync('D:/trusthome/constants/colors.ts', 'utf8');

c = c.replace(/background: 'rgba\\(0, 0, 0, 0\\.6\\)',/, `background: 'transparent',`);
c = c.replace(/backgroundSecondary: 'rgba\\(10, 10, 10, 0\\.7\\)',/, `backgroundSecondary: 'transparent',`);
c = c.replace(/backgroundTertiary: 'rgba\\(23, 23, 23, 0\\.8\\)',/, `backgroundTertiary: 'rgba(12, 18, 36, 0.65)',`);
c = c.replace(/surface: 'rgba\\(10, 10, 10, 0\\.75\\)',/, `surface: 'rgba(12, 18, 36, 0.65)',`);
c = c.replace(/surfaceElevated: 'rgba\\(23, 23, 23, 0\\.85\\)',/, `surfaceElevated: 'rgba(12, 18, 36, 0.85)',`);
c = c.replace(/cardGlass: 'rgba\\(10, 10, 10, 0\\.75\\)',/, `cardGlass: 'rgba(12, 18, 36, 0.65)',`);
c = c.replace(/cardGlassBorder: 'rgba\\(255, 255, 255, 0\\.08\\)',/, `cardGlassBorder: 'rgba(255, 255, 255, 0.08)',`);

fs.writeFileSync('D:/trusthome/constants/colors.ts', c);

// 2. Update _layout.tsx to include NavThemeProvider
let l = fs.readFileSync('D:/trusthome/app/_layout.tsx', 'utf8');

// Import ThemeProvider from react-navigation
if (!l.includes('NavThemeProvider')) {
  l = l.replace(
    /import \{ ThemeProvider \} from "@\/contexts\/ThemeContext";/,
    `import { ThemeProvider } from "@/contexts/ThemeContext";\nimport { ThemeProvider as NavThemeProvider, DarkTheme } from '@react-navigation/native';`
  );
  
  l = l.replace(
    /<Stack screenOptions=\{\{ headerShown: false, contentStyle: \{ backgroundColor: 'transparent' \} \}\}>/,
    `<NavThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent' } }}>\n      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>`
  );

  l = l.replace(
    /<\/Stack>\n      <DrawerMenu \/>/,
    `</Stack>\n      </NavThemeProvider>\n      <DrawerMenu />`
  );
}

fs.writeFileSync('D:/trusthome/app/_layout.tsx', l);

// 3. Update GlassCard to ensure it uses the new colors
let gc = fs.readFileSync('D:/trusthome/components/ui/GlassCard.tsx', 'utf8');
gc = gc.replace(/backgroundColor: isDark \? 'rgba\\(10,15,30,0\\.65\\)' : 'rgba\\(255,255,255,0\\.8\\)'/, `backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.8)'`);
fs.writeFileSync('D:/trusthome/components/ui/GlassCard.tsx', gc);

console.log("Updated colors.ts, _layout.tsx, GlassCard.tsx");
