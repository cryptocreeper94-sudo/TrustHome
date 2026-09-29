const fs = require('fs');
const path = 'D:\\trusthome\\components\\screens\\CommandCenterHub.tsx';
let content = fs.readFileSync(path, 'utf8');

// The screenshot shows "Everything you need. Nothing you don't." in teal and blue.
content = content.replace(/'#0EA5E9', '#0284C7'/g, "'#71717A', '#3F3F46'");
content = content.replace(/'#8B5CF6', '#7C3AED'/g, "'#52525B', '#27272A'");
content = content.replace(/'#10B981', '#059669'/g, "'#3F3F46', '#18181B'");
content = content.replace(/'#1A8A7E', '#0D9488'/g, "'#27272A', '#000000'");
content = content.replace(/'#0F766E', '#065F46'/g, "'#18181B', '#000000'");
content = content.replace(/'#1A8A7E', '#0F766E'/g, "'#27272A', '#09090B'");

content = content.replace(/color: '#1A8A7E'/g, "color: isDark ? '#E5E5E5' : '#18181B'");
content = content.replace(/color: '#0EA5E9'/g, "color: '#52525B'");
content = content.replace(/color: '#8B5CF6'/g, "color: '#52525B'");
content = content.replace(/color: '#10B981'/g, "color: '#52525B'");
content = content.replace(/color: '#F59E0B'/g, "color: '#52525B'");
content = content.replace(/color: '#EC4899'/g, "color: '#52525B'");
content = content.replace(/color: '#6366F1'/g, "color: '#52525B'");

fs.writeFileSync(path, content);
console.log("CommandCenterHub colors updated to luxury brutalist.");
