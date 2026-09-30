const fs = require('fs');
const path = require('path');

const appDir = 'D:/trusthome/app';
const files = fs.readdirSync(appDir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(appDir, f);
  let content = fs.readFileSync(p, 'utf8');
  let original = content;

  const regex = /(<Header[\s\S]*?imageBanner[\s\S]*?\/>)\s*(<ScrollView[^>]*>)/;
  const match = content.match(regex);
  if (match) {
    const headerStr = match[1];
    const scrollStr = match[2];
    content = content.replace(regex, scrollStr + '\n        ' + headerStr);
  }

  if (content !== original) {
    fs.writeFileSync(p, content);
    console.log(`Moved header inside ScrollView in ${f}`);
  }
});
