const fs = require('fs');
const path = 'D:\\trusthome\\app\\media-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/'#FFFFFF'Secondary/g, 'colors.textSecondary');
content = content.replace(/'#FFFFFF'Tertiary/g, 'colors.textTertiary');
content = content.replace(/'#FFFFFF'Inverse/g, 'colors.textInverse');

fs.writeFileSync(path, content);
console.log("Fixed botched regex replacements in media-studio.tsx.");
