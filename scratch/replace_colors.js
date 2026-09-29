const fs = require('fs');
const path = 'D:\\trusthome\\app\\media-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace exact hex colors and rgba values
content = content.replace(/#1A8A7E/gi, "colors.text");
content = content.replace(/#F59E0B/gi, "colors.text");
content = content.replace(/#6366F1/gi, "colors.text");
content = content.replace(/#EF4444/gi, "colors.error");
content = content.replace(/'rgba\(26,138,126,0\.2\)'/g, "isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'");
content = content.replace(/'rgba\(26,138,126,0\.1\)'/g, "isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'");
content = content.replace(/'rgba\(26,138,126,0\.15\)'/g, "isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'");
content = content.replace(/'rgba\(99,102,241,0\.3\)'/g, "isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'");
content = content.replace(/'rgba\(99,102,241,0\.1\)'/g, "isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'");
content = content.replace(/'rgba\(239,68,68,0\.1\)'/g, "isDark ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.05)'");
content = content.replace(/color:\s*colors\.text\s*,\s*fontWeight/g, "color: colors.background, fontWeight");
content = content.replace(/'#34C759'/g, "colors.success");
content = content.replace(/{ backgroundColor:\s*colors\.text,\s*borderColor:\s*colors\.text }/g, "{ backgroundColor: colors.text, borderColor: colors.text }");

// A few more fixes
content = content.replace(/color:\s*colors\.text/g, "color: colors.text");
content = content.replace(/backgroundColor:\s*colors\.text/g, "backgroundColor: colors.text");
content = content.replace(/borderColor:\s*colors\.text/g, "borderColor: colors.text");
content = content.replace(/color:\s*'#fff'/g, "color: colors.background");

fs.writeFileSync(path, content);
console.log("Colors replaced successfully!");
