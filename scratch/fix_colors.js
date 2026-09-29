const fs = require('fs');
const path = 'D:\\trusthome\\app\\media-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix quoted variables
content = content.replace(/'colors\.text'/g, "colors.text");
content = content.replace(/"colors\.text"/g, "colors.text");
content = content.replace(/'colors\.error'/g, "colors.error");
content = content.replace(/"colors\.error"/g, "colors.error");
content = content.replace(/'colors\.background'/g, "colors.background");
content = content.replace(/"colors\.background"/g, "colors.background");

// Fix nested ternaries
content = content.replace(/isDark \? isDark \? 'rgba\(255,255,255,0\.1\)' : 'rgba\(0,0,0,0\.05\)' : isDark \? 'rgba\(255,255,255,0\.05\)' : 'rgba\(0,0,0,0\.03\)'/g, 
  "isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'");

content = content.replace(/isRecording \? isDark \? 'rgba\(255,59,48,0\.1\)' : 'rgba\(255,59,48,0\.05\)' : \(isDark \? 'rgba\(0,0,0,0\.2\)' : 'rgba\(255,255,255,0\.5\)'\)/g,
  "isRecording ? 'rgba(255,59,48,0.1)' : (isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)')");

fs.writeFileSync(path, content);
console.log("Syntax errors fixed!");
