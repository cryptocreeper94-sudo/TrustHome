const fs = require('fs');
const path = 'D:\\trusthome\\app\\media-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

// The StyleSheet starts around line 483. We only want to replace `colors.` and `isDark` inside the StyleSheet.
// A safe way is to replace them with static strings in the whole file if they are bare (not inside JSX {}).
// But since they are all inside `StyleSheet.create`, let's just do a blanket regex for the exact lines.

content = content.replace(/color:\s*colors\.text/g, "color: '#FFFFFF'");
content = content.replace(/color:\s*colors\.success/g, "color: '#34C759'");
content = content.replace(/color:\s*colors\.background/g, "color: '#000000'");
content = content.replace(/backgroundColor:\s*isDark \? 'rgba\(255,255,255,0\.1\)' : 'rgba\(0,0,0,0\.05\)'/g, "backgroundColor: 'rgba(150,150,150,0.1)'");
content = content.replace(/borderColor:\s*isDark \? 'rgba\(255,255,255,0\.2\)' : 'rgba\(0,0,0,0\.1\)'/g, "borderColor: 'rgba(150,150,150,0.2)'");
content = content.replace(/backgroundColor:\s*isDark \? 'rgba\(255,255,255,0\.05\)' : 'rgba\(0,0,0,0\.03\)'/g, "backgroundColor: 'rgba(150,150,150,0.05)'");

// Ensure any inline JSX overrides still work by replacing the string '#FFFFFF' back to `{colors.text}` where it matters?
// Wait, replacing `color: colors.text` globally will break JSX if I have `<Ionicons color=colors.text />` (but I fixed that to `<Ionicons color={colors.text} />`).
// If there is `{ color: colors.text }` in JSX, it will become `{ color: '#FFFFFF' }`, losing dynamic theming.
// Let's be more precise. Let's only replace them in the StyleSheet section.

const [jsxPart, stylePart] = content.split('const s = StyleSheet.create({');

let newStylePart = stylePart
  .replace(/colors\.text/g, "'#FFFFFF'")
  .replace(/colors\.success/g, "'#34C759'")
  .replace(/colors\.background/g, "'#000000'")
  .replace(/isDark \? '[^']+' : '[^']+'/g, "'rgba(150,150,150,0.1)'");

fs.writeFileSync(path, jsxPart + 'const s = StyleSheet.create({' + newStylePart);
console.log("StyleSheet references fixed!");
