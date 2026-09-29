const fs = require('fs');
const path = 'D:\\trusthome\\app\\index.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace teal/blue/green colors in FEATURE_CATEGORIES with neutral metallic tones
content = content.replace(/'#0E7490'/g, "'#737373'");
content = content.replace(/'#1A8A7E'/g, "'#E5E5E5'");
content = content.replace(/'#0D9488'/g, "'#A3A3A3'");
content = content.replace(/'#059669'/g, "'#525252'");
content = content.replace(/'#047857'/g, "'#737373'");
content = content.replace(/'#0369A1'/gi, "'#D4D4D4'");
content = content.replace(/'#1E40AF'/g, "'#404040'");

// Replace gradients
content = content.replace(/'rgba\(26,138,126,0\.25\)', 'rgba\(26,138,126,0\.08\)'/g, "'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.02)'");
content = content.replace(/'#1A8A7E', '#0F766E'/g, "'#1C1C1E', '#0A0A0A'");
content = content.replace(/'rgba\(26,138,126,0\.15\)', 'rgba\(26,138,126,0\.05\)'/g, "'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'");
content = content.replace(/'rgba\(26,138,126,0\.2\)'/g, "'rgba(255,255,255,0.1)'");
content = content.replace(/'rgba\(3,105,161,0\.2\)'/g, "'rgba(255,255,255,0.08)'");
content = content.replace(/'rgba\(37,99,235,0\.2\)'/g, "'rgba(255,255,255,0.05)'");

fs.writeFileSync(path, content);
console.log("Landing page colors updated to luxury brutalist.");
