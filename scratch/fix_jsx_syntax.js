const fs = require('fs');
const path = 'D:\\trusthome\\app\\media-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/color=colors\.text/g, "color={colors.text}");
content = content.replace(/color=colors\.error/g, "color={colors.error}");
content = content.replace(/color=colors\.background/g, "color={colors.background}");
content = content.replace(/color=colors\.success/g, "color={colors.success}");

fs.writeFileSync(path, content);
console.log("JSX props syntax fixed!");
